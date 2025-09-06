import { Game, GameDifficulty, GameMode, Player, ApiGameState, fromApiGameState } from '@/lib/game-state';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateGameRequest {
  difficulty: GameDifficulty;
  mode: GameMode;
  playerId: string;
}

export interface JoinGameRequest {
  gameId: string;
  playerId: string;
}

export interface MakeMoveRequest {
  gameId: string;
  playerId: string;
  row: number;
  col: number;
  value: number | null;
  isNote?: boolean;
}

export interface GameListResponse {
  activeGames: Array<{
    gameId: string;
    difficulty: string;
    mode: string;
    playerCount: number;
    maxPlayers: number;
    createdAt: string;
  }>;
}

export interface UserStats {
  userId: string;
  totalGames: number;
  wins: number;
  averageTime: number;
  bestTime: number | null;
  gamesByDifficulty: Record<string, number>;
  lastPlayedAt: string | null;
}

export interface GameRecord {
  gameId: string;
  players: string[];
  difficulty: string;
  mode: string;
  completedAt: string;
  winner: string | null;
  duration: number;
  totalErrors: number;
  totalHints: number;
  isCompleted: boolean;
  userWon: boolean;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useApiPrefix: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const baseUrl = useApiPrefix ? API_BASE_URL : API_BASE_URL.replace('/api', '');
      const url = `${baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Game management
  async createGame(request: CreateGameRequest): Promise<ApiResponse<{
    gameId: string;
    difficulty: string;
    mode: string;
    status: string;
    playerCount: number;
    maxPlayers: number;
  }>> {
    return this.request('/api/games/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async joinGame(request: JoinGameRequest): Promise<ApiResponse<{
    gameId: string;
    difficulty: string;
    mode: string;
    status: string;
    playerCount: number;
    maxPlayers: number;
  }>> {
    return this.request('/api/games/join', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getGameState(gameId: string, playerId: string): Promise<ApiResponse<Game>> {
    const response = await this.request<ApiGameState>(`/games/${gameId}?playerId=${encodeURIComponent(playerId)}`);
    
    if (response.success && response.data) {
      const convertedGame = fromApiGameState(response.data);
      return {
        success: true,
        data: convertedGame,
      };
    }
    
    return response as ApiResponse<Game>;
  }

  async makeMove(request: MakeMoveRequest): Promise<ApiResponse<{
    gameState: Game;
    moveResult: {
      isValid: boolean;
      isComplete: boolean;
      winner: string | null;
    };
  }>> {
    const response = await this.request<{
      gameState: ApiGameState;
      moveResult: {
        isValid: boolean;
        isComplete: boolean;
        winner: string | null;
      };
    }>(`/games/${request.gameId}/move`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    if (response.success && response.data) {
      const convertedGameState = fromApiGameState(response.data.gameState);
      return {
        success: true,
        data: {
          gameState: convertedGameState,
          moveResult: response.data.moveResult,
        },
      };
    }
    
    return response as ApiResponse<{
      gameState: Game;
      moveResult: {
        isValid: boolean;
        isComplete: boolean;
        winner: string | null;
      };
    }>;
  }

  async startGame(gameId: string, playerId: string): Promise<ApiResponse<{
    gameId: string;
    status: string;
  }>> {
    return this.request(`/games/${gameId}/start`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  }

  async getActiveGames(): Promise<ApiResponse<GameListResponse>> {
    return this.request('/api/games');
  }

  // Statistics
  async getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
    return this.request(`/api/stats/user/${encodeURIComponent(userId)}`);
  }

  async getUserGames(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ApiResponse<{
    games: GameRecord[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }>> {
    return this.request(
      `/api/stats/user/${encodeURIComponent(userId)}/games?limit=${limit}&offset=${offset}`
    );
  }

  async getLeaderboard(
    difficulty?: string,
    limit: number = 10
  ): Promise<ApiResponse<{
    leaderboard: Array<{
      rank: number;
      userId: string;
      totalGames: number;
      wins: number;
      winRate: string;
      averageTime: number;
      bestTime: number | null;
      gamesByDifficulty: Record<string, number>;
      lastPlayedAt: string | null;
    }>;
    difficulty: string;
    totalPlayers: number;
  }>> {
    const params = new URLSearchParams();
    if (difficulty) params.append('difficulty', difficulty);
    params.append('limit', limit.toString());
    
    return this.request(`/api/stats/leaderboard?${params.toString()}`);
  }

  async getGlobalStats(): Promise<ApiResponse<{
    totalGames: number;
    totalPlayers: number;
    gamesByDifficulty: Record<string, number>;
    gamesByMode: Record<string, number>;
    averageCompletionTime: number;
    gamesCompletedToday: number;
    lastUpdated: string;
  }>> {
    return this.request('/api/stats/global');
  }

  async getDailyChallengeStats(date?: string): Promise<ApiResponse<{
    date: string;
    totalCompletions: number;
    averageDuration: number;
    averageErrors: number;
    averageHints: number;
  }>> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    return this.request(`/api/stats/daily-challenges?${params.toString()}`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{
    status: string;
    timestamp: string;
    services: {
      database: string;
      redis: string;
    };
  }>> {
    return this.request('/health', {}, false); // Don't use /api prefix for health
  }
}

export const apiService = new ApiService();
