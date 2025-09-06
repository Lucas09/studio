"use client";
import { useState, useCallback } from 'react';
import { apiService, UserStats, GameRecord } from '@/services/api';

export const useStatsApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserStats = useCallback(async (userId: string): Promise<UserStats | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getUserStats(userId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get user stats');
      }
      
      return response.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get user stats';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserGames = useCallback(async (
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    games: GameRecord[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  } | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getUserGames(userId, limit, offset);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get user games');
      }
      
      return response.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get user games';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLeaderboard = useCallback(async (
    difficulty?: string,
    limit: number = 10
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getLeaderboard(difficulty, limit);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get leaderboard');
      }
      
      return response.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get leaderboard';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getGlobalStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getGlobalStats();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get global stats');
      }
      
      return response.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get global stats';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDailyChallengeStats = useCallback(async (date?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getDailyChallengeStats(date);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get daily challenge stats');
      }
      
      return response.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get daily challenge stats';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getUserStats,
    getUserGames,
    getLeaderboard,
    getGlobalStats,
    getDailyChallengeStats,
  };
};
