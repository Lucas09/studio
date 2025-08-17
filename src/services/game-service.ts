
import { db } from '@/lib/firebase';
import { sudokuGenerator } from '@/lib/sudoku';
import { collection, doc, getDoc, onSnapshot, setDoc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";

export type GameDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Impossible';
export type GameMode = 'Solo' | 'Co-op' | 'Versus';
export type GameStatus = 'waiting' | 'active' | 'finished';

export interface Player {
    id: string;
    board: (number | null)[][];
    notes: any; // Serialized Set[][]
    errors: number;
    timer: number;
    errorCells?: { row: number, col: number }[];
    hints?: number;
}

export interface Game {
    gameId?: string;
    puzzle: { [key: number]: (number | null)[] };
    solution: { [key: number]: number[] };
    difficulty: GameDifficulty;
    mode: GameMode;
    status: GameStatus;
    players: { [key: string]: Player };
    winner?: string;
    createdAt?: any;
}


const serializeNotes = (notes) => {
    return notes.map(row => row.map(cell => Array.from(cell)));
};

const deserializeNotes = (serializedNotes) => {
    if (serializedNotes && Array.isArray(serializedNotes)) {
        return serializedNotes.map(row => row.map(cellData => new Set(cellData)));
    }
     // If notes are stored as an object
    if (serializedNotes && typeof serializedNotes === 'object' && !Array.isArray(serializedNotes)) {
        const board = convertObjectToBoard(serializedNotes as any) as any[][];
        return board.map(row => row.map(cellData => new Set(cellData)));
    }
    return Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()));
};

const convertBoardToObject = (board: (any)[][]) => {
    if (!board) return {};
    return board.reduce((acc, row, i) => {
        acc[i] = row;
        return acc;
    }, {});
};

const convertObjectToBoard = (boardObject: {[key: string]: any[]}) => {
    if (!boardObject || Object.keys(boardObject).length === 0) return Array(9).fill(null).map(() => Array(9).fill(null));
    return Object.keys(boardObject).sort((a,b) => parseInt(a) - parseInt(b)).map(key => boardObject[key]);
};


export const gameService = {
    createGame: async (difficulty: GameDifficulty, mode: GameMode, playerId: string): Promise<Game> => {
        const { puzzle, solution } = sudokuGenerator.generate(difficulty);
        
        const initialPlayerState: Player = {
            id: playerId,
            board: puzzle,
            notes: Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set())),
            errors: 0,
            timer: 0,
            hints: 3,
            errorCells: []
        };
        
        const newGame: Game = {
            difficulty,
            mode,
            puzzle: convertBoardToObject(puzzle),
            solution: convertBoardToObject(solution),
            status: 'waiting',
            players: {
                [playerId]: initialPlayerState,
            },
            createdAt: serverTimestamp(),
        };

        const gameCollection = collection(db, "games");
        
        // Prepare player data for Firestore
        const firestorePlayerData = {
            ...initialPlayerState,
            board: convertBoardToObject(initialPlayerState.board),
            notes: convertBoardToObject(serializeNotes(initialPlayerState.notes))
        };

        const gameRef = await addDoc(gameCollection, {
            ...newGame,
            players: {
                [playerId]: firestorePlayerData
            }
        });
        
        return { ...newGame, gameId: gameRef.id, players: { [playerId]: initialPlayerState } };
    },

    joinGame: async (gameId: string, playerId: string): Promise<Game | null> => {
        const gameRef = doc(db, 'games', gameId);
        const gameSnap = await getDoc(gameRef);

        if (!gameSnap.exists()) {
            console.error("Game not found!");
            return null;
        }

        const gameData = gameSnap.data() as Game;
        const puzzle = convertObjectToBoard(gameData.puzzle);
        
        const newPlayer: Player = {
            id: playerId,
            board: puzzle,
            notes: Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set())),
            errors: 0,
            timer: 0,
            hints: 3,
            errorCells: []
        };

        await updateDoc(gameRef, {
            [`players.${playerId}`]: {
                 ...newPlayer,
                 board: convertBoardToObject(newPlayer.board),
                 notes: convertBoardToObject(serializeNotes(newPlayer.notes))
            },
            status: 'active'
        });

        // Re-fetch the game data to return the latest state
        const updatedGameSnap = await getDoc(gameRef);
        const updatedGameData = updatedGameSnap.data() as Game;
        return { ...updatedGameData, gameId: updatedGameSnap.id };
    },

    getGameUpdates: (gameId: string, callback: (game: Game) => void) => {
        const gameRef = doc(db, 'games', gameId);
        return onSnapshot(gameRef, (docSnap) => {
            if (docSnap.exists()) {
                const gameData = docSnap.data() as Game;
                
                const players = {};
                if (gameData.players) {
                    for(const pId in gameData.players) {
                        const player = gameData.players[pId];
                        players[pId] = {
                            ...player,
                            board: convertObjectToBoard(player.board as any),
                            notes: deserializeNotes(player.notes)
                        }
                    }
                }

                callback({ 
                    ...gameData, 
                    gameId: docSnap.id, 
                    puzzle: convertObjectToBoard(gameData.puzzle), 
                    solution: convertObjectToBoard(gameData.solution as any),
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
            if (key === 'board') {
                 value = convertBoardToObject(value as (number|null)[][]);
            }
            if (key === 'notes') {
                value = convertBoardToObject(serializeNotes(value));
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
    
    serializeNotes,
    deserializeNotes,
};
