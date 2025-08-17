
"use client";
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Game, FirestoreGame } from '@/lib/game-state';
import { fromFirestoreGame } from '@/lib/game-state';

export const useGameUpdates = (gameId: string | null, initialGameData?: Game | null) => {
    const [gameData, setGameData] = useState<Game | null>(initialGameData || null);

    useEffect(() => {
        if (!gameId) {
            // If there's no gameId, we might be in a solo game.
            // The state is managed locally, so we don't need a listener.
            // If initialGameData is provided, set it. Otherwise, it might be set by other means (e.g., loading from localStorage).
            if(initialGameData) {
                setGameData(initialGameData);
            }
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
    }, [gameId, initialGameData]);

    return { gameData, setGameData };
};
