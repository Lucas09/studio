import { Board, Cell, Notes, Move, GameStats } from '@/types/game';
import { SudokuGenerator } from './sudoku-generator';

export class GameEngine {
  /**
   * Validate a move on the board
   */
  static validateMove(
    board: Board, 
    row: number, 
    col: number, 
    value: number
  ): boolean {
    if (value < 1 || value > 9) return false;
    if (row < 0 || row > 8 || col < 0 || col > 8) return false;
    if (board[row][col] !== null) return false;
    
    return SudokuGenerator.isValidMove(board, row, col, value);
  }

  /**
   * Check if a move is correct against the solution
   */
  static isCorrectMove(
    board: Board,
    solution: Board,
    row: number,
    col: number,
    value: number
  ): boolean {
    return solution[row][col] === value;
  }

  /**
   * Check if the game is won
   */
  static checkWinCondition(board: Board, solution: Board): boolean {
    if (!SudokuGenerator.isBoardComplete(board)) return false;
    
    // Check if board matches solution
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== solution[row][col]) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Get all possible values for a cell
   */
  static getPossibleValues(board: Board, row: number, col: number): number[] {
    if (board[row][col] !== null) return [];
    
    const possibleValues: number[] = [];
    for (let value = 1; value <= 9; value++) {
      if (SudokuGenerator.isValidMove(board, row, col, value)) {
        possibleValues.push(value);
      }
    }
    
    return possibleValues;
  }

  /**
   * Generate a hint for the player
   */
  static generateHint(board: Board, solution: Board): Cell | null {
    const emptyCells: Cell[] = [];
    
    // Find all empty cells
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length === 0) return null;
    
    // Return a random empty cell
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  /**
   * Get the correct value for a cell from the solution
   */
  static getCorrectValue(solution: Board, row: number, col: number): number {
    return solution[row][col];
  }

  /**
   * Clear notes for a value in row, column, and box
   */
  static clearNotesForValue(
    notes: Notes,
    row: number,
    col: number,
    value: number
  ): Notes {
    const newNotes = notes.map(r => r.map(c => new Set([...c])));
    
    // Clear in row
    for (let c = 0; c < 9; c++) {
      newNotes[row][c].delete(value);
    }
    
    // Clear in column
    for (let r = 0; r < 9; r++) {
      newNotes[r][col].delete(value);
    }
    
    // Clear in 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        newNotes[r][c].delete(value);
      }
    }
    
    return newNotes;
  }

  /**
   * Toggle a note for a cell
   */
  static toggleNote(
    notes: Notes,
    row: number,
    col: number,
    value: number
  ): Notes {
    const newNotes = notes.map(r => r.map(c => new Set([...c])));
    const cellNotes = newNotes[row][col];
    
    if (cellNotes.has(value)) {
      cellNotes.delete(value);
    } else {
      cellNotes.add(value);
    }
    
    return newNotes;
  }

  /**
   * Calculate game statistics
   */
  static calculateStats(moves: Move[], hintsUsed: number, timeSpent: number): GameStats {
    const totalMoves = moves.length;
    const correctMoves = moves.filter(move => move.value !== null).length;
    const incorrectMoves = totalMoves - correctMoves;
    const completionRate = totalMoves > 0 ? (correctMoves / totalMoves) * 100 : 0;
    
    return {
      totalMoves,
      correctMoves,
      incorrectMoves,
      hintsUsed,
      timeSpent,
      completionRate
    };
  }

  /**
   * Get difficulty rating based on puzzle characteristics
   */
  static calculateDifficulty(puzzle: Board): number {
    let difficulty = 0;
    
    // Count empty cells
    const emptyCells = puzzle.flat().filter(cell => cell === null).length;
    difficulty += emptyCells * 0.5;
    
    // Check for patterns that make puzzles harder
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (puzzle[row][col] === null) {
          const possibleValues = this.getPossibleValues(puzzle, row, col);
          if (possibleValues.length === 1) {
            difficulty += 2; // Naked single
          } else if (possibleValues.length === 2) {
            difficulty += 1; // Hidden single
          }
        }
      }
    }
    
    return Math.round(difficulty);
  }

  /**
   * Check if a cell is in the same row, column, or box as another cell
   */
  static areCellsRelated(cell1: Cell, cell2: Cell): boolean {
    // Same row
    if (cell1.row === cell2.row) return true;
    
    // Same column
    if (cell1.col === cell2.col) return true;
    
    // Same 3x3 box
    const box1Row = Math.floor(cell1.row / 3);
    const box1Col = Math.floor(cell1.col / 3);
    const box2Row = Math.floor(cell2.row / 3);
    const box2Col = Math.floor(cell2.col / 3);
    
    return box1Row === box2Row && box1Col === box2Col;
  }

  /**
   * Get all cells in the same row, column, or box as a given cell
   */
  static getRelatedCells(cell: Cell): Cell[] {
    const relatedCells: Cell[] = [];
    
    // Same row
    for (let col = 0; col < 9; col++) {
      if (col !== cell.col) {
        relatedCells.push({ row: cell.row, col });
      }
    }
    
    // Same column
    for (let row = 0; row < 9; row++) {
      if (row !== cell.row) {
        relatedCells.push({ row, col: cell.col });
      }
    }
    
    // Same 3x3 box
    const boxRow = Math.floor(cell.row / 3) * 3;
    const boxCol = Math.floor(cell.col / 3) * 3;
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (r !== cell.row || c !== cell.col) {
          relatedCells.push({ row: r, col: c });
        }
      }
    }
    
    return relatedCells;
  }

  /**
   * Format time in MM:SS format
   */
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Generate a unique game ID
   */
  static generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique player ID
   */
  static generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
