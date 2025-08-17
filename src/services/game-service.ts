
'use server';
import { db } from '@/lib/firebase';
import { sudokuGenerator } from '@/lib/sudoku';
import { collection, doc, getDoc, onSnapshot, setDoc, updateDoc, serverTimestamp, addDoc, writeBatch } from "firebase/firestore";

export type GameDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Impossible';
export type GameMode = 'Solo' | 'Co-op' | 'Versus' | string; // Allow string for daily challenges
export type GameStatus = 'waiting' | 'active' | 'finished' | 'lost';

export interface Player {
    id: string;
    board: (number | null)[][];
    notes: Set<number>[][];
    errors: number;
    timer: number;
    errorCells: { row: number, col: number }[];
    hints: number;
}

export interface FirestorePlayer {
    id: string;
    errors: number;
    timer: number;
    hints: number;
    // board, notes, etc. are stored at the top level for co-op or individually for versus
}

export interface FirestoreGame {
    gameId?: string;
    puzzle: string;
    solution: string;
    difficulty: GameDifficulty;
    mode: GameMode;
    status: GameStatus;
    players: { [key: string]: FirestorePlayer };
    winner?: string | null;
    createdAt: any;
    // For Co-op mode, the board state is shared
    coopState?: {
        board: string;
        notes: string;
        errorCells: { row: number, col: number }[];
    },
    // For Versus mode, each player has their own board
    versusState?: {
        [playerId: string]: {
            board: string;
            notes: string;
            errorCells: { row: number, col: number }[];
        }
    }
}

export interface Game {
    gameId?: string;
    puzzle: (number | null)[][];
    solution: (number | null)[][];
    difficulty: GameDifficulty;
    mode: GameMode;
    status: GameStatus;
    players: { [key: string]: Player };
    winner?: string | null;
    createdAt?: any;
}

const fromFirestoreGame = (firestoreGame: FirestoreGame, id: string): Game | null => {
    if (!firestoreGame) return null;
    
    const players: { [key: string]: Player } = {};
    if (firestoreGame.players) {
        for (const pId in firestoreGame.players) {
            const pData = firestoreGame.players[pId];
            let playerBoard: (number|null)[][] = [];
            let playerNotes: Set<number>[][] = [];
            let playerErrorCells: {row: number, col: number}[] = [];

            if (firestoreGame.mode === 'Co-op' && firestoreGame.coopState) {
                playerBoard = sudokuGenerator.stringToBoard(firestoreGame.coopState.board);
                playerNotes = sudokuGenerator.stringToNotes(firestoreGame.coopState.notes);
                playerErrorCells = firestoreGame.coopState.errorCells;
            } else if (firestoreGame.mode === 'Versus' && firestoreGame.versusState?.[pId]) {
                 const vsState = firestoreGame.versusState[pId];
                 playerBoard = sudokuGenerator.stringToBoard(vsState.board);
                 playerNotes = sudokuGenerator.stringToNotes(vsState.notes);
                 playerErrorCells = vsState.errorCells;
            } else {
                 // Fallback for solo or if state is missing
                 playerBoard = sudokuGenerator.stringToBoard(firestoreGame.puzzle);
                 playerNotes = sudokuGenerator.createEmptyNotes();
                 playerErrorCells = [];
            }

            players[pId] = {
                id: pData.id,
                errors: pData.errors,
                timer: pData.timer,
                hints: pData.hints,
                board: playerBoard,
                notes: playerNotes,
                errorCells: playerErrorCells
            };
        }
    }

    return {
        gameId: id,
        puzzle: sudokuGenerator.stringToBoard(firestoreGame.puzzle),
        solution: sudokuGenerator.stringToBoard(firestoreGame.solution),
        difficulty: firestoreGame.difficulty,
        mode: firestoreGame.mode,
        status: firestoreGame.status,
        winner: firestoreGame.winner,
        createdAt: firestoreGame.createdAt,
        players,
    };
};

export const createGame = async (difficulty: GameDifficulty, mode: GameMode, playerId: string): Promise<Game | null> => {
    const { puzzle, solution } = sudokuGenerator.generate(difficulty);
    const puzzleString = sudokuGenerator.boardToString(puzzle);
    
    const initialPlayer: FirestorePlayer = {
        id: playerId,
        errors: 0,
        timer: 0,
        hints: 3,
    };

    const newGameDataForFirestore: Omit<FirestoreGame, 'gameId' | 'createdAt'> = {
        difficulty,
        mode,
        puzzle: puzzleString,
        solution: sudokuGenerator.boardToString(solution),
        status: 'waiting',
        players: { [playerId]: initialPlayer },
        winner: null,
    };

    if (mode === 'Co-op') {
        newGameDataForFirestore.coopState = {
            board: puzzleString,
            notes: sudokuGenerator.notesToString(sudokuGenerator.createEmptyNotes()),
            errorCells: []
        }
    } else if (mode === 'Versus') {
        newGameDataForFirestore.versusState = {
            [playerId]: {
                board: puzzleString,
                notes: sudokuGenerator.notesToString(sudokuGenerator.createEmptyNotes()),
                errorCells: []
            }
        }
    }

    const gameCollection = collection(db, "games");
    const gameRef = await addDoc(gameCollection, {
        ...newGameDataForFirestore,
        createdAt: serverTimestamp()
    });
    
    const createdGameSnap = await getDoc(gameRef);
    return fromFirestoreGame(createdGameSnap.data() as FirestoreGame, gameRef.id);
};

export const joinGame = async (gameId: string, playerId: string): Promise<Game | null> => {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);

    if (!gameSnap.exists()) {
        console.error("Game not found!");
        return null;
    }

    const firestoreGame = gameSnap.data() as FirestoreGame;
    if (Object.keys(firestoreGame.players).length >= 2) {
         console.error("Game is full!");
         return fromFirestoreGame(firestoreGame, gameId); // Still return the game data
    }
    
    const newPlayer: FirestorePlayer = {
        id: playerId,
        errors: 0,
        timer: 0,
        hints: 3,
    };
    
    const updates = {
        [`players.${playerId}`]: newPlayer
    };

    if (firestoreGame.mode === 'Versus') {
         updates[`versusState.${playerId}`] = {
            board: firestoreGame.puzzle,
            notes: sudokuGenerator.notesToString(sudokuGenerator.createEmptyNotes()),
            errorCells: []
        }
    }

    await updateDoc(gameRef, updates);
    
    const updatedGameSnap = await getDoc(gameRef);
    return fromFirestoreGame(updatedGameSnap.data() as FirestoreGame, updatedGameSnap.id);
};

export const getGameUpdates = (gameId: string, callback: (game: Game | null) => void) => {
    const gameRef = doc(db, 'games', gameId);
    return onSnapshot(gameRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(fromFirestoreGame(docSnap.data() as FirestoreGame, docSnap.id));
        } else {
            console.error("Game not found during update");
            callback(null);
        }
    });
};

export const updateGame = async (gameId: string, playerId: string, updates: Partial<Player>) => {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);
    if (!gameSnap.exists()) return;

    const firestoreGame = gameSnap.data() as FirestoreGame;
    const updateData = {};
    
    for(const key of Object.keys(updates)) {
        let value = updates[key];
        
        // Player-specific updates like timer, errors, hints
        if (key === 'timer' || key === 'errors' || key === 'hints') {
             updateData[`players.${playerId}.${key}`] = value;
        }
        
        // Board state updates depend on game mode
        if (key === 'board' || key === 'notes' || key === 'errorCells') {
            const modePrefix = firestoreGame.mode === 'Co-op' ? 'coopState' : `versusState.${playerId}`;
            let serializedValue = value;
            if(key === 'board' && Array.isArray(value)) {
                serializedValue = sudokuGenerator.boardToString(value);
            }
            if(key === 'notes') {
                 serializedValue = sudokuGenerator.notesToString(value);
            }
             updateData[`${modePrefix}.${key}`] = serializedValue;
        }
    }

    if(Object.keys(updateData).length > 0) {
        await updateDoc(gameRef, updateData);
    }
};

export const startGame = async (gameId: string) => {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, { status: 'active' });
};

export const endGame = async (gameId: string, status: 'win' | 'lost', winnerId?: string) => {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
        status: 'finished',
        winner: winnerId || null,
    });
};
