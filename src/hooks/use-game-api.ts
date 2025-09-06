"use client";
import { useState, useEffect, useCallback } from 'react';
import { apiService, CreateGameRequest, JoinGameRequest, MakeMoveRequest } from '@/services/api';
import { Game, GameDifficulty, GameMode } from '@/lib/game-state';

export const useGameApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGame = useCallback(async (
    difficulty: GameDifficulty,
    mode: GameMode,
    playerId: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.createGame({
        difficulty,
        mode,
        playerId,
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create game');
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create game';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const joinGame = useCallback(async (gameId: string, playerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.joinGame({
        gameId,
        playerId,
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to join game');
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join game';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getGameState = useCallback(async (gameId: string, playerId: string) => {
    try {
      const response = await apiService.getGameState(gameId, playerId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get game state');
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get game state';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const makeMove = useCallback(async (
    gameId: string,
    playerId: string,
    row: number,
    col: number,
    value: number | null,
    isNote: boolean = false
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.makeMove({
        gameId,
        playerId,
        row,
        col,
        value,
        isNote,
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to make move');
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to make move';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const startGame = useCallback(async (gameId: string, playerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.startGame(gameId, playerId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to start game');
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start game';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getActiveGames = useCallback(async () => {
    try {
      const response = await apiService.getActiveGames();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get active games');
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get active games';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    loading,
    error,
    createGame,
    joinGame,
    getGameState,
    makeMove,
    startGame,
    getActiveGames,
  };
};

// Hook for polling game state updates
export const useGamePolling = (gameId: string | null, playerId: string | null, interval: number = 2000) => {
  const [gameState, setGameState] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getGameState } = useGameApi();

  const pollGameState = useCallback(async () => {
    if (!gameId || !playerId) {
      setGameState(null);
      return;
    }

    try {
      setLoading(true);
      const state = await getGameState(gameId, playerId);
      setGameState(state);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get game state';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameId, playerId, getGameState]);

  useEffect(() => {
    if (!gameId || !playerId) {
      setGameState(null);
      return;
    }

    // Initial fetch
    pollGameState();

    // Set up polling interval
    const intervalId = setInterval(pollGameState, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [gameId, playerId, interval, pollGameState]);

  return {
    gameState,
    loading,
    error,
    refetch: pollGameState,
  };
};
