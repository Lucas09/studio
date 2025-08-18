
'use server';
import { db } from '@/lib/firebase';
import { sudokuGenerator } from '@/lib/sudoku';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, addDoc, writeBatch } from "firebase/firestore";
import type { Player, GameDifficulty, GameMode, FirestoreGame, FirestorePlayer } from '@/lib/game-state';

export const createMultiplayerGame = async (playerId: string, difficulty: GameDifficulty, mode: GameMode): Promise<string> => {
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
    
    return gameRef.id;
};

export const joinMultiplayerGame = async (gameId: string, playerId: string): Promise<void> => {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);

    if (!gameSnap.exists()) {
        throw new Error("Game not found!");
    }

    const firestoreGame = gameSnap.data() as FirestoreGame;
    if (Object.keys(firestoreGame.players).length >= 2) {
         console.error("Game is full!");
         return;
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
};

export const updateGame = async (gameId: string, playerId: string, updates: Partial<Player>) => {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);
    if (!gameSnap.exists()) return;

    const firestoreGame = gameSnap.data() as FirestoreGame;
    const updateData = {};
    
    for(const key of Object.keys(updates)) {
        let value = updates[key];
        
        if (key === 'timer' || key === 'errors' || key === 'hints') {
             updateData[`players.${playerId}.${key}`] = value;
        }
        
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
