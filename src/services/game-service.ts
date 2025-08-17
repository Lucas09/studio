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
    return Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()));
};

const convertBoardToObject = (board: (number|null)[][]) => {
    return board.reduce((acc, row, i) => {
        acc[i] = row;
        return acc;
    }, {});
};

const convertObjectToBoard = (boardObject: {[key: number]: (number|null)[]}) => {
    if (!boardObject) return Array(9).fill(null).map(() => Array(9).fill(null));
    return Object.keys(boardObject).sort((a,b) => parseInt(a) - parseInt(b)).map(key => boardObject[key]);
};


export const gameService = {
    createGame: async (difficulty: GameDifficulty, mode: GameMode, playerId: string): Promise<Game> => {
        const { puzzle, solution } = sudokuGenerator.generate(difficulty);
        const newGame: Game = {
            difficulty,
            mode,
            puzzle: convertBoardToObject(puzzle),
            solution: convertBoardToObject(solution),
            status: 'waiting',
            players: {
                [playerId]: {
                    id: playerId,
                    board: puzzle,
                    notes: Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set())),
                    errors: 0,
                    timer: 0,
                }
            },
            createdAt: serverTimestamp(),
        };

        const gameCollection = collection(db, "games");
        const gameRef = await addDoc(gameCollection, {
            ...newGame,
            puzzle: newGame.puzzle,
            solution: newGame.solution,
            players: {
                [playerId]: {
                    ...newGame.players[playerId],
                    board: convertBoardToObject(newGame.players[playerId].board),
                    notes: serializeNotes(newGame.players[playerId].notes)
                }
            }
        });
        
        return { ...newGame, gameId: gameRef.id };
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
        };

        await updateDoc(gameRef, {
            [`players.${playerId}`]: {
                 ...newPlayer,
                 board: convertBoardToObject(newPlayer.board),
                 notes: serializeNotes(newPlayer.notes)
            },
            status: 'active'
        });

        return { ...gameData, gameId: gameRef.id, puzzle: puzzle };
    },

    getGameUpdates: (gameId: string, callback: (game: Game) => void) => {
        const gameRef = doc(db, 'games', gameId);
        return onSnapshot(gameRef, (docSnap) => {
            if (docSnap.exists()) {
                const gameData = docSnap.data() as Game;
                const puzzle = convertObjectToBoard(gameData.puzzle);
                const solution = convertObjectToBoard(gameData.solution) as number[][];
                
                const players = {};
                if (gameData.players) {
                    for(const playerId in gameData.players) {
                        const player = gameData.players[playerId];
                        players[playerId] = {
                            ...player,
                            board: convertObjectToBoard(player.board),
                            notes: deserializeNotes(player.notes)
                        }
                    }
                }

                callback({ ...gameData, gameId: docSnap.id, puzzle, solution, players });
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
    
    deserializeNotes,
};
