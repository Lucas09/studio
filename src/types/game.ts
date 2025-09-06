// Core game types
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Impossible';

export type GameMode = 'solo' | 'coop' | 'versus';

export type GameStatus = 'waiting' | 'active' | 'finished' | 'paused';

export type Cell = {
  row: number;
  col: number;
};

export type Board = (number | null)[][];

export type Notes = Set<number>[][];

export interface Player {
  id: string;
  board: Board;
  notes: Notes;
  errors: number;
  hints: number;
  timer: number;
  isActive: boolean;
}

export interface Game {
  id: string;
  mode: GameMode;
  difficulty: Difficulty;
  puzzle: Board;
  solution: Board;
  players: Player[];
  status: GameStatus;
  winner?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameSettings {
  difficulty: Difficulty;
  hints: number;
  maxErrors: number;
  timer: boolean;
}

export interface Move {
  row: number;
  col: number;
  value: number | null;
  isNote: boolean;
  timestamp: Date;
}

export interface GameStats {
  totalMoves: number;
  correctMoves: number;
  incorrectMoves: number;
  hintsUsed: number;
  timeSpent: number;
  completionRate: number;
}
