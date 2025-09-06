export interface GameState {
  gameId: string;
  puzzle: string; // 81-character string representation
  solution: string; // 81-character string representation
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Impossible';
  mode: 'Solo' | 'Co-op' | 'Versus';
  status: 'waiting' | 'active' | 'finished' | 'abandoned';
  players: {
    [playerId: string]: {
      id: string;
      board: string; // 81-character string representation
      notes: string; // JSON string of notes
      errors: number;
      timer: number;
      hints: number;
      errorCells: Array<{ row: number; col: number }>;
    };
  };
  winner?: string | null;
  createdAt: Date;
  expiresAt: Date;
}

export interface GameRecord {
  gameId: string;
  players: string[];
  difficulty: string;
  mode: string;
  completedAt: Date;
  winner?: string;
  duration: number; // in seconds
  errors: number;
  hints: number;
  isCompleted: boolean;
}

export interface UserStats {
  userId: string;
  totalGames: number;
  wins: number;
  averageTime: number;
  bestTime: number;
  gamesByDifficulty: Record<string, number>;
  lastPlayedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface CreateGameRequest {
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Impossible';
  mode: 'Solo' | 'Co-op' | 'Versus';
}

export interface JoinGameRequest {
  gameId: string;
}

export interface MakeMoveRequest {
  gameId: string;
  row: number;
  col: number;
  value: number | null;
  isNote?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GameListResponse {
  activeGames: Array<{
    gameId: string;
    difficulty: string;
    mode: string;
    playerCount: number;
    maxPlayers: number;
    createdAt: Date;
  }>;
}
