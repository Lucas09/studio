
"use client";
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const usePlayerId = () => {
    const [playerId, setPlayerId] = useState<string | null>(null);

    useEffect(() => {
        let storedPlayerId = localStorage.getItem('sudokuPlayerId');
        if (!storedPlayerId) {
            storedPlayerId = uuidv4();
            localStorage.setItem('sudokuPlayerId', storedPlayerId);
        }
        setPlayerId(storedPlayerId);
    }, []);

    return playerId;
};
