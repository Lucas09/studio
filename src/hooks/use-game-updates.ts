
"use client";
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Game, FirestoreGame } from '@/lib/game-state';
import { fromFirestoreGame } from '@/lib/game-state';

export const useGameUpdates = (gameId: string | null) => {
    const [gameData, setGameData] = useState<Game | null>(null);

    useEffect(() => {
        if (!gameId) {
            setGameData(null);
            return;
        };

        const gameRef = doc(db, 'games', gameId);
        const unsubscribe = onSnapshot(gameRef, (docSnap) => {
            if (docSnap.exists()) {
                const newGameData = fromFirestoreGame(docSnap.data() as FirestoreGame, docSnap.id);
                setGameData(newGameData);
            } else {
                console.error("Game not found during update");
                setGameData(null);
            }
        });

        // Cleanup the listener when the component unmounts or gameId changes
        return () => unsubscribe();
    }, [gameId]);

    return { gameData, setGameData };
};
