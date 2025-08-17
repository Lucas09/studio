import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, onSnapshot, increment } from 'firebase/firestore';

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Impossible';
export type GameMode = 'Solo' | 'Co-op' | 'Versus' | string; // string for daily challenges
export type GameStatus = 'lobby' | 'active' | 'finished';

export interface Game {
    gameId?: string;
    puzzle: (number | null)[][];
    solution: number[][];
    difficulty: Difficulty;
    mode: GameMode;
    status: GameStatus;
    board: (number | null)[][];
    notes: any; // Serialized Set[][]
    errors: number;
    timer: number;
    hints: number;
    errorCells: { row: number, col: number }[];
    playerCount: number;
    winner?: string;
    createdAt?: Date;
}

function generateGameId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Firestore strips out empty arrays and custom objects like Set, so we need to serialize/deserialize notes.
const serializeNotes = (notes) => {
    const serialized = {};
    for(let r=0; r<9; r++) {
        for(let c=0; c<9; c++) {
            if (notes[r][c] && notes[r][c].size > 0) {
                serialized[`${r}-${c}`] = Array.from(notes[r][c]);
            }
        }
    }
    return serialized;
};

const deserializeNotes = (serializedNotes) => {
    const notes = Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()));
    if (serializedNotes) {
        for (const key in serializedNotes) {
            const [r, c] = key.split('-').map(Number);
            notes[r][c] = new Set(serializedNotes[key]);
        }
    }
    return notes;
};


const createGame = async (gameData: { puzzle: (number | null)[][], solution: number[][], difficulty: Difficulty, mode: GameMode }): Promise<string> => {
    const gameId = generateGameId();
    const initialNotes = Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()));

    const newGame: Game = {
        ...gameData,
        gameId,
        status: 'lobby',
        board: gameData.puzzle.map(row => [...row]),
        notes: serializeNotes(initialNotes),
        errors: 0,
        timer: 0,
        hints: 3,
        errorCells: [],
        playerCount: 1,
        createdAt: new Date(),
    };

    await setDoc(doc(db, 'games', gameId), newGame);
    return gameId;
};

const getGame = async (gameId: string): Promise<Game | null> => {
    const gameDoc = await getDoc(doc(db, 'games', gameId));
    if (gameDoc.exists()) {
        return gameDoc.data() as Game;
    }
    return null;
};

const joinGame = async (gameId: string): Promise<Game | null> => {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    if(gameDoc.exists() && gameDoc.data().playerCount < 2) {
        await updateDoc(gameRef, {
            playerCount: increment(1)
        });
        return gameDoc.data() as Game;
    }
    // If game exists but is full, or doesn't exist
    return gameDoc.exists() ? gameDoc.data() as Game : null;
};


const updateGame = async (gameId: string, updates: Partial<Game>) => {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, updates);
};

const onGameUpdate = (gameId: string, callback: (game: Game | null) => void) => {
    const gameRef = doc(db, 'games', gameId);
    return onSnapshot(gameRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data() as Game);
        } else {
            callback(null);
        }
    });
};

export const gameService = {
    createGame,
    getGame,
    updateGame,
    onGameUpdate,
    joinGame,
    serializeNotes,
    deserializeNotes,
};
