
import { sudokuGenerator } from '@/lib/sudoku';

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

export const fromFirestoreGame = (firestoreGame: FirestoreGame, id: string): Game | null => {
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
