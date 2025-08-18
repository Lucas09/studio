"use client";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const usePlayerId = () => {
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    let storedId = localStorage.getItem("sudokuPlayerId");
    if (!storedId) {
      storedId = uuidv4();  // generer et unikt ID
      localStorage.setItem("sudokuPlayerId", storedId);
    }
    setPlayerId(storedId);
  }, []);

  return playerId;
}