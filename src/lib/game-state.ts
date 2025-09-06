
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

// Backend API game state structure
export interface ApiGameState {
    gameId: string;
    puzzle: string; // 81-character string representation
    solution?: string; // 81-character string representation (not returned to frontend)
    difficulty: GameDifficulty;
    mode: GameMode;
    status: GameStatus;
    players: {
        [playerId: string]: {
            id: string;
            board: string; // 81-character string representation
            notes: string; // JSON string of notes
            errors: number;
            timer: number;
            hints: number;
            errorCells: Array<{ row: number; col: number }>;
        };
    };
    winner?: string | null;
    createdAt: string;
    expiresAt?: string;
}

// Convert backend API game state to frontend Game format
export const fromApiGameState = (apiGameState: ApiGameState): Game | null => {
    if (!apiGameState) {
        return null;
    }
    
    const players: { [key: string]: Player } = {};
    if (apiGameState.players) {
        for (const pId in apiGameState.players) {
            const pData = apiGameState.players[pId];
            
            // Convert string board to 2D array
            const playerBoard = sudokuGenerator.stringToBoard(pData.board);
            
            // Convert JSON notes string to Set array
            let playerNotes: Set<number>[][] = [];
            try {
                const notesData = JSON.parse(pData.notes);
                playerNotes = notesData.map((row: any[]) => 
                    row.map((cell: any[]) => new Set(cell))
                );
            } catch (error) {
                console.error('Error parsing notes:', error);
                playerNotes = sudokuGenerator.createEmptyNotes();
            }

            players[pId] = {
                id: pData.id,
                errors: pData.errors,
                timer: pData.timer,
                hints: pData.hints,
                board: playerBoard,
                notes: playerNotes,
                errorCells: pData.errorCells
            };
        }
    }

    const convertedGame = {
        gameId: apiGameState.gameId,
        puzzle: sudokuGenerator.stringToBoard(apiGameState.puzzle),
        solution: apiGameState.solution ? sudokuGenerator.stringToBoard(apiGameState.solution) : [],
        difficulty: apiGameState.difficulty,
        mode: apiGameState.mode,
        status: apiGameState.status,
        winner: apiGameState.winner,
        createdAt: apiGameState.createdAt,
        players,
    };
    
    return convertedGame;
};

