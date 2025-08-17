

import { db } from '@/lib/firebase';
import { sudokuGenerator } from '@/lib/sudoku';
import { collection, doc, getDoc, onSnapshot, setDoc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";

export type GameDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Impossible';
export type GameMode = 'Solo' | 'Co-op' | 'Versus';
export type GameStatus = 'waiting' | 'active' | 'finished';

// This interface represents the data structure for client-side logic
export interface Player {
    id: string;
    board: (number | null)[][];
    notes: Set<number>[][];
    errors: number;
    timer: number;
    errorCells?: { row: number, col: number }[];
    hints?: number;
}

// This interface represents the data structure in Firestore
// Notice board and notes are simple strings
export interface FirestorePlayer {
    id: string;
    board: string;
    notes: string;
    errors: number;
    timer: number;
    errorCells?: { row: number, col: number }[];
    hints?: number;
}

// This interface represents the game structure in Firestore
export interface FirestoreGame {
    gameId?: string;
    puzzle: string; // Stored as a flat string
    solution: string; // Stored as a flat string
    difficulty: GameDifficulty;
    mode: GameMode;
    status: GameStatus;
    players: { [key: string]: FirestorePlayer };
    winner?: string;
    createdAt?: any;
}

// This is the main Game interface used throughout the app client-side
export interface Game {
    gameId?: string;
    puzzle: (number | null)[][];
    solution: number[][];
    difficulty: GameDifficulty;
    mode: GameMode;
    status: GameStatus;
    players: { [key: string]: Player };
    winner?: string;
    createdAt?: any;
}


// Helper to convert a FirestoreGame to a client-side Game
const fromFirestoreGame = (firestoreGame: FirestoreGame, id: string): Game => {
    const players: { [key: string]: Player } = {};
    if (firestoreGame.players) {
        for (const pId in firestoreGame.players) {
            const pData = firestoreGame.players[pId];
            players[pId] = {
                ...pData,
                board: sudokuGenerator.stringToBoard(pData.board),
                notes: sudokuGenerator.stringToNotes(pData.notes),
            };
        }
    }

    return {
        ...firestoreGame,
        gameId: id,
        puzzle: sudokuGenerator.stringToBoard(firestoreGame.puzzle),
        solution: sudokuGenerator.stringToBoard(firestoreGame.solution),
        players,
    };
};

export const gameService = {
    createGame: async (difficulty: GameDifficulty, mode: GameMode, playerId: string): Promise<Game> => {
        const { puzzle, solution } = sudokuGenerator.generate(difficulty);
        
        const initialPlayerState: FirestorePlayer = {
            id: playerId,
            board: sudokuGenerator.boardToString(puzzle),
            notes: sudokuGenerator.notesToString(Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()))),
            errors: 0,
            timer: 0,
            hints: 3,
            errorCells: []
        };

        const newGameDataForFirestore: Omit<FirestoreGame, 'gameId'> = {
            difficulty,
            mode,
            puzzle: sudokuGenerator.boardToString(puzzle),
            solution: sudokuGenerator.boardToString(solution),
            status: 'waiting' as GameStatus,
            players: {
                [playerId]: initialPlayerState
            },
            createdAt: serverTimestamp(),
        };

        const gameCollection = collection(db, "games");
        const gameRef = await addDoc(gameCollection, newGameDataForFirestore);
        
        // Return the client-side game object by converting the firestore data
        const createdGame = await getDoc(gameRef);
        return fromFirestoreGame(createdGame.data() as FirestoreGame, gameRef.id);
    },

    joinGame: async (gameId: string, playerId: string): Promise<Game | null> => {
        const gameRef = doc(db, 'games', gameId);
        const gameSnap = await getDoc(gameRef);

        if (!gameSnap.exists()) {
            console.error("Game not found!");
            return null;
        }

        const firestoreGame = gameSnap.data() as FirestoreGame;
        
        const newPlayer: FirestorePlayer = {
            id: playerId,
            board: firestoreGame.puzzle,
            notes: sudokuGenerator.notesToString(Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()))),
            errors: 0,
            timer: 0,
            hints: 3,
            errorCells: []
        };

        await updateDoc(gameRef, {
            [`players.${playerId}`]: newPlayer
        });
        
        const updatedGameSnap = await getDoc(gameRef);
        return fromFirestoreGame(updatedGameSnap.data() as FirestoreGame, updatedGameSnap.id);
    },

    getGameUpdates: (gameId: string, callback: (game: Game) => void) => {
        const gameRef = doc(db, 'games', gameId);
        return onSnapshot(gameRef, (docSnap) => {
            if (docSnap.exists()) {
                const firestoreGame = docSnap.data() as FirestoreGame;
                callback(fromFirestoreGame(firestoreGame, docSnap.id));
            } else {
                console.error("Game not found during update");
            }
        });
    },

    updateGame: async (gameId: string, playerId: string, updates: Partial<Player>) => {
        const gameRef = doc(db, 'games', gameId);
        const updateData = {};
        
        for(const key in updates) {
            let value = updates[key];
            if (key === 'board' && Array.isArray(value)) {
                 value = sudokuGenerator.boardToString(value as (number|null)[][]);
            }
            if (key === 'notes') {
                value = sudokuGenerator.notesToString(value);
            }
            updateData[`players.${playerId}.${key}`] = value;
        }

        if(Object.keys(updateData).length > 0) {
            await updateDoc(gameRef, updateData);
        }
    },

    setWinner: async (gameId: string, playerId: string) => {
        const gameRef = doc(db, 'games', gameId);
        await updateDoc(gameRef, {
            winner: playerId,
            status: 'finished'
        });
    },
    
    // We only export what the client components need
    serializeNotes: (notes: Set<number>[][]) => sudokuGenerator.notesToString(notes),
    deserializeNotes: (notesString: string) => sudokuGenerator.stringToNotes(notesString),
};
