

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Impossible';
export type GameMode = 'Solo' | string; // string for daily challenges
export type GameStatus = 'active' | 'finished';

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


const deserializeNotes = (serializedNotes) => {
    const notes = Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()));
    if (serializedNotes) {
        // This is a simplified deserialization for localStorage.
        // It assumes the saved notes are already in a Set-compatible format.
        if (Array.isArray(serializedNotes)) {
             return serializedNotes.map(row => row.map(cell => new Set(cell)));
        }
    }
    return notes;
};


export const gameService = {
    deserializeNotes,
};
