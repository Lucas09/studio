import { createClient, RedisClientType } from 'redis';
import { config } from '../config';
import { GameState } from '../types';

class RedisService {
  private client: RedisClientType;
  private isConnected = false;

  constructor() {
    // Parse the Redis URL to extract components
    const redisUrl = new URL(config.redis.url);
    
    this.client = createClient({
      socket: {
        host: redisUrl.hostname,
        port: parseInt(redisUrl.port) || 6379,
        tls: true, // Force TLS for Upstash compatibility
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis: Max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        },
        connectTimeout: 10000,
        lazyConnect: true,
      },
      password: redisUrl.password || undefined,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('Redis Client Disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
        console.log('Redis: Successfully connected');
      } catch (error) {
        console.error('Redis: Failed to connect', error);
        throw error;
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      await this.client.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed', error);
      this.isConnected = false;
      return false;
    }
  }

  // Game state management
  async setGameState(gameId: string, gameState: GameState): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      const key = `game:${gameId}`;
      const ttl = config.game.gameExpirationHours * 3600; // Convert hours to seconds
      
      await this.client.setEx(key, ttl, JSON.stringify(gameState));
    } catch (error) {
      console.error('Redis: Failed to set game state', error);
      throw error;
    }
  }

  async getGameState(gameId: string): Promise<GameState | null> {
    const key = `game:${gameId}`;
    const data = await this.client.get(key);
    
    if (!data) {
      return null;
    }
    
    try {
      return JSON.parse(data) as GameState;
    } catch (error) {
      console.error('Failed to parse game state', error);
      return null;
    }
  }

  async deleteGameState(gameId: string): Promise<void> {
    const key = `game:${gameId}`;
    await this.client.del(key);
  }

  async updateGameState(gameId: string, updates: Partial<GameState>): Promise<GameState | null> {
    const currentState = await this.getGameState(gameId);
    if (!currentState) {
      return null;
    }

    const updatedState = { ...currentState, ...updates };
    await this.setGameState(gameId, updatedState);
    return updatedState;
  }

  // Active games tracking
  async addActiveGame(gameId: string, gameInfo: {
    difficulty: string;
    mode: string;
    playerCount: number;
    createdAt: Date;
  }): Promise<void> {
    const key = `active_games:${gameId}`;
    const ttl = config.game.gameExpirationHours * 3600;
    
    await this.client.setEx(key, ttl, JSON.stringify(gameInfo));
  }

  async removeActiveGame(gameId: string): Promise<void> {
    const key = `active_games:${gameId}`;
    await this.client.del(key);
  }

  async getActiveGames(): Promise<Array<{
    gameId: string;
    difficulty: string;
    mode: string;
    playerCount: number;
    createdAt: Date;
  }>> {
    const keys = await this.client.keys('active_games:*');
    const games = [];

    for (const key of keys) {
      const data = await this.client.get(key);
      if (data) {
        try {
          const gameInfo = JSON.parse(data);
          const gameId = key.replace('active_games:', '');
          games.push({
            gameId,
            ...gameInfo,
          });
        } catch (error) {
          console.error('Failed to parse active game info', error);
        }
      }
    }

    return games;
  }

  // Player session management
  async setPlayerSession(playerId: string, gameId: string): Promise<void> {
    const key = `player_session:${playerId}`;
    const ttl = config.game.gameExpirationHours * 3600;
    
    await this.client.setEx(key, ttl, gameId);
  }

  async getPlayerSession(playerId: string): Promise<string | null> {
    const key = `player_session:${playerId}`;
    return await this.client.get(key);
  }

  async removePlayerSession(playerId: string): Promise<void> {
    const key = `player_session:${playerId}`;
    await this.client.del(key);
  }

  // Rate limiting
  async checkRateLimit(identifier: string, limit: number, windowMs: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const windowKey = `${key}:${window}`;

    const current = await this.client.incr(windowKey);
    if (current === 1) {
      await this.client.expire(windowKey, Math.ceil(windowMs / 1000));
    }

    const remaining = Math.max(0, limit - current);
    const resetTime = (window + 1) * windowMs;

    return {
      allowed: current <= limit,
      remaining,
      resetTime,
    };
  }

  // Cleanup expired games
  async cleanupExpiredGames(): Promise<number> {
    const activeGameKeys = await this.client.keys('active_games:*');
    const gameKeys = await this.client.keys('game:*');
    const sessionKeys = await this.client.keys('player_session:*');
    
    let cleaned = 0;
    
    // Check active games
    for (const key of activeGameKeys) {
      const ttl = await this.client.ttl(key);
      if (ttl === -2) { // Key doesn't exist
        await this.client.del(key);
        cleaned++;
      }
    }
    
    // Check game states
    for (const key of gameKeys) {
      const ttl = await this.client.ttl(key);
      if (ttl === -2) { // Key doesn't exist
        await this.client.del(key);
        cleaned++;
      }
    }
    
    // Check player sessions
    for (const key of sessionKeys) {
      const ttl = await this.client.ttl(key);
      if (ttl === -2) { // Key doesn't exist
        await this.client.del(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

export const redisService = new RedisService();
