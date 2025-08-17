
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, onSnapshot, increment } from 'firebase/firestore';

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Impossible';
export type GameMode = 'Solo' | 'Co-op' | 'Versus' | string; // string for daily challenges
export type GameStatus = 'lobby' | 'active' | 'finished';

// Firestore doesn't support nested arrays. We convert them to objects/maps.
type BoardObject = { [row: number]: (number | null)[] };
type SolutionObject = { [row: number]: number[] };

export interface Game {
    gameId?: string;
    puzzle: BoardObject;
    solution: SolutionObject;
    difficulty: Difficulty;
    mode: GameMode;
    status: GameStatus;
    board: BoardObject;
    notes: any; // Serialized Set[][]
    errors: number;
    timer: number;
    hints: number;
    errorCells: { row: number, col: number }[];
    playerCount: number;
    winner?: string;
    createdAt?: Date;
}

// --- Data Conversion Helpers ---
const arrayToBoardObject = (arr: (number | null)[][]): BoardObject => {
    const obj: BoardObject = {};
    arr.forEach((row, i) => {
        obj[i] = row;
    });
    return obj;
};

const boardObjectToArray = (obj: BoardObject): (number | null)[][] => {
    if (!obj) return Array(9).fill(null).map(() => Array(9).fill(null));
    return Object.keys(obj).sort((a,b) => Number(a)-Number(b)).map(key => obj[key]);
};


function generateGameId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Firestore strips out empty arrays and custom objects like Set, so we need to serialize/deserialize notes.
const serializeNotes = (notes) => {
    const serialized = {};
    for(let r=0; r<9; r++) {
        for(let c=0; c<9; c++) {
            if (notes[r] && notes[r][c] && notes[r][c].size > 0) {
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

    const newGameForStore: Game = {
        difficulty: gameData.difficulty,
        mode: gameData.mode,
        puzzle: arrayToBoardObject(gameData.puzzle),
        solution: arrayToBoardObject(gameData.solution),
        gameId,
        status: 'lobby',
        board: arrayToBoardObject(gameData.puzzle),
        notes: serializeNotes(initialNotes),
        errors: 0,
        timer: 0,
        hints: 3,
        errorCells: [],
        playerCount: 1,
        createdAt: new Date(),
    };

    await setDoc(doc(db, 'games', gameId), newGameForStore);
    return gameId;
};

const getGame = async (gameId: string): Promise<Game | null> => {
    const gameDoc = await getDoc(doc(db, 'games', gameId));
    if (gameDoc.exists()) {
        const gameData = gameDoc.data() as Game;
        return {
            ...gameData,
            puzzle: boardObjectToArray(gameData.puzzle),
            solution: boardObjectToArray(gameData.solution),
            board: boardObjectToArray(gameData.board),
        };
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
    }
    
    if (gameDoc.exists()) {
        const gameData = gameDoc.data() as Game;
        return {
            ...gameData,
            puzzle: boardObjectToArray(gameData.puzzle),
            solution: boardObjectToArray(gameData.solution),
            board: boardObjectToArray(gameData.board),
        };
    }
    return null;
};


const updateGame = async (gameId: string, updates: Partial<Omit<Game, 'puzzle' | 'solution' | 'board'> & { board?: (number|null)[][] }>) => {
    const gameRef = doc(db, 'games', gameId);
    const updatesForStore: any = {...updates};

    if (updates.board) {
        updatesForStore.board = arrayToBoardObject(updates.board);
    }

    await updateDoc(gameRef, updatesForStore);
};

const onGameUpdate = (gameId: string, callback: (game: Game | null) => void) => {
    const gameRef = doc(db, 'games', gameId);
    return onSnapshot(gameRef, (doc) => {
        if (doc.exists()) {
            const gameData = doc.data() as Game;
            callback({
                ...gameData,
                puzzle: boardObjectToArray(gameData.puzzle),
                solution: boardObjectToArray(gameData.solution),
                board: boardObjectToArray(gameData.board),
            });
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
