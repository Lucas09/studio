
import { db } from '@/lib/firebase';
import { sudokuGenerator } from '@/lib/sudoku';
import { collection, doc, getDoc, onSnapshot, setDoc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";

export type GameDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Impossible';
export type GameMode = 'Solo' | 'Co-op' | 'Versus';
export type GameStatus = 'waiting' | 'active' | 'finished';

export interface Player {
    id: string;
    board: (number | null)[][];
    notes: any; // Should be Set<number>[][]
    errors: number;
    timer: number;
    errorCells?: { row: number, col: number }[];
    hints?: number;
}

// This interface represents the data structure in Firestore
export interface FirestoreGame {
    gameId?: string;
    puzzle: { [key: string]: (number | null)[] };
    solution: { [key: string]: number[] };
    difficulty: GameDifficulty;
    mode: GameMode;
    status: GameStatus;
    players: { [key: string]: FirestorePlayer };
    winner?: string;
    createdAt?: any;
}

// This interface represents the player data structure in Firestore
export interface FirestorePlayer {
    id: string;
    board: { [key: string]: (number | null)[] };
    notes: { [key: string]: number[][] };
    errors: number;
    timer: number;
    errorCells?: { row: number, col: number }[];
    hints?: number;
}


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

const serializeNotes = (notes: Set<number>[][]): { [key: string]: number[][] } => {
    const obj = {};
    notes.forEach((row, r) => {
        obj[r] = row.map(cellSet => Array.from(cellSet));
    });
    return obj;
};

const deserializeNotes = (serializedNotes: { [key: string]: number[][] } | undefined): Set<number>[][] => {
    if (!serializedNotes) {
        return Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()));
    }
    const notes: Set<number>[][] = [];
    Object.keys(serializedNotes).sort((a, b) => parseInt(a) - parseInt(b)).forEach(key => {
        const r = parseInt(key);
        notes[r] = serializedNotes[key].map(cellArray => new Set(cellArray));
    });
    return notes;
};

const convertBoardToObject = (board: (number | null)[][]): { [key: string]: (number | null)[] } => {
    const obj = {};
    board.forEach((row, i) => {
        obj[i] = row;
    });
    return obj;
};

const convertObjectToBoard = (boardObject: { [key: string]: any[] }): (number | null)[][] => {
    if (!boardObject || Object.keys(boardObject).length === 0) return Array(9).fill(null).map(() => Array(9).fill(null));
    const board: (number | null)[][] = [];
    Object.keys(boardObject).sort((a, b) => parseInt(a) - parseInt(b)).forEach(key => {
        board.push(boardObject[key]);
    });
    return board;
};


export const gameService = {
    createGame: async (difficulty: GameDifficulty, mode: GameMode, playerId: string): Promise<Game> => {
        const { puzzle, solution } = sudokuGenerator.generate(difficulty);
        
        const initialPlayerState: Player = {
            id: playerId,
            board: puzzle.map(row => [...row]),
            notes: Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set())),
            errors: 0,
            timer: 0,
            hints: 3,
            errorCells: []
        };
        
        const firestorePlayerData: FirestorePlayer = {
            ...initialPlayerState,
            board: convertBoardToObject(initialPlayerState.board),
            notes: serializeNotes(initialPlayerState.notes),
        };

        const newGameDataForFirestore: Omit<FirestoreGame, 'gameId'> = {
            difficulty,
            mode,
            puzzle: convertBoardToObject(puzzle),
            solution: convertBoardToObject(solution),
            status: 'waiting' as GameStatus,
            players: {
                [playerId]: firestorePlayerData
            },
            createdAt: serverTimestamp(),
        };

        const gameCollection = collection(db, "games");
        const gameRef = await addDoc(gameCollection, newGameDataForFirestore);
        
        return { 
            gameId: gameRef.id,
            difficulty,
            mode,
            puzzle: puzzle,
            solution: solution,
            status: 'waiting',
            players: { [playerId]: initialPlayerState }
        };
    },

    joinGame: async (gameId: string, playerId: string): Promise<Game | null> => {
        const gameRef = doc(db, 'games', gameId);
        const gameSnap = await getDoc(gameRef);

        if (!gameSnap.exists()) {
            console.error("Game not found!");
            return null;
        }

        const firestoreGame = gameSnap.data() as FirestoreGame;
        const puzzle = convertObjectToBoard(firestoreGame.puzzle);
        
        const newPlayer: Player = {
            id: playerId,
            board: puzzle.map(row => [...row]),
            notes: Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set())),
            errors: 0,
            timer: 0,
            hints: 3,
            errorCells: []
        };
        
        const firestorePlayerData: FirestorePlayer = {
             ...newPlayer,
             board: convertBoardToObject(newPlayer.board),
             notes: serializeNotes(newPlayer.notes),
        };

        await updateDoc(gameRef, {
            [`players.${playerId}`]: firestorePlayerData,
            status: 'active'
        });

        // Return the game in the client-side format
        const updatedGameSnap = await getDoc(gameRef);
        const rawGameData = updatedGameSnap.data() as FirestoreGame;
        
        const players: { [key: string]: Player } = {};
        if (rawGameData.players) {
            for(const pId in rawGameData.players) {
                const pData = rawGameData.players[pId];
                players[pId] = {
                    ...pData,
                    board: convertObjectToBoard(pData.board),
                    notes: deserializeNotes(pData.notes)
                }
            }
        }
        
        return {
            gameId: updatedGameSnap.id,
            puzzle: convertObjectToBoard(rawGameData.puzzle),
            solution: convertObjectToBoard(rawGameData.solution),
            difficulty: rawGameData.difficulty,
            mode: rawGameData.mode,
            status: rawGameData.status,
            players: players
        };
    },

    getGameUpdates: (gameId: string, callback: (game: Game) => void) => {
        const gameRef = doc(db, 'games', gameId);
        return onSnapshot(gameRef, (docSnap) => {
            if (docSnap.exists()) {
                const firestoreGame = docSnap.data() as FirestoreGame;
                
                const players: { [key: string]: Player } = {};
                if (firestoreGame.players) {
                    for(const pId in firestoreGame.players) {
                        const pData = firestoreGame.players[pId];
                        players[pId] = {
                            ...pData,
                            board: convertObjectToBoard(pData.board),
                            notes: deserializeNotes(pData.notes)
                        }
                    }
                }

                callback({ 
                    ...firestoreGame, 
                    gameId: docSnap.id, 
                    puzzle: convertObjectToBoard(firestoreGame.puzzle), 
                    solution: convertObjectToBoard(firestoreGame.solution),
                    players 
                });
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
                 value = convertBoardToObject(value as (number|null)[][]);
            }
            if (key === 'notes') {
                value = serializeNotes(value);
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
    serializeNotes: (notes: Set<number>[][]) => notes.map(row => row.map(cell => Array.from(cell))),
    deserializeNotes,
};
