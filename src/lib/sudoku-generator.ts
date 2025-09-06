import { Board, Difficulty } from '@/types/game';

export class SudokuGenerator {
  /**
   * Generate a complete solved Sudoku board
   */
  static generateSolvedBoard(): Board {
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
    this.solve(board);
    return board;
  }

  /**
   * Generate a puzzle with the specified difficulty
   */
  static generate(difficulty: Difficulty): { puzzle: Board; solution: Board } {
    const solution = this.generateSolvedBoard();
    const puzzle = this.createPuzzle(solution, difficulty);
    
    return { puzzle, solution };
  }

  /**
   * Create a puzzle by removing numbers from a solved board
   */
  private static createPuzzle(solution: Board, difficulty: Difficulty): Board {
    const puzzle = solution.map(row => [...row]);
    const holes = this.getHolesForDifficulty(difficulty);
    
    let attempts = holes;
    const positions = this.getAllPositions();
    this.shuffleArray(positions);
    
    for (const [row, col] of positions) {
      if (attempts <= 0) break;
      
      const originalValue = puzzle[row][col];
      puzzle[row][col] = null;
      
      // Check if puzzle still has unique solution
      if (this.hasUniqueSolution(puzzle)) {
        attempts--;
      } else {
        // Restore if removing this cell makes puzzle unsolvable
        puzzle[row][col] = originalValue;
      }
    }
    
    return puzzle;
  }

  /**
   * Get number of holes for each difficulty level
   */
  private static getHolesForDifficulty(difficulty: Difficulty): number {
    switch (difficulty) {
      case 'Easy': return 35;
      case 'Medium': return 45;
      case 'Hard': return 50;
      case 'Very Hard': return 55;
      case 'Impossible': return 60;
      default: return 35;
    }
  }

  /**
   * Get all possible positions on the board
   */
  private static getAllPositions(): [number, number][] {
    const positions: [number, number][] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        positions.push([row, col]);
      }
    }
    return positions;
  }

  /**
   * Shuffle array in place using Fisher-Yates algorithm
   */
  private static shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Check if a puzzle has a unique solution
   */
  private static hasUniqueSolution(puzzle: Board): boolean {
    const solutions: Board[] = [];
    this.findAllSolutions(puzzle, solutions, 0, 2); // Stop after finding 2 solutions
    return solutions.length === 1;
  }

  /**
   * Find all solutions to a puzzle (with limit)
   */
  private static findAllSolutions(
    board: Board, 
    solutions: Board[], 
    startIndex: number, 
    maxSolutions: number
  ): void {
    if (solutions.length >= maxSolutions) return;
    
    const emptyCell = this.findEmptyCell(board, startIndex);
    if (!emptyCell) {
      solutions.push(board.map(row => [...row]));
      return;
    }
    
    const [row, col] = emptyCell;
    for (let num = 1; num <= 9; num++) {
      if (this.isValidMove(board, row, col, num)) {
        board[row][col] = num;
        this.findAllSolutions(board, solutions, startIndex + 1, maxSolutions);
        board[row][col] = null;
        
        if (solutions.length >= maxSolutions) return;
      }
    }
  }

  /**
   * Find the next empty cell starting from a given index
   */
  private static findEmptyCell(board: Board, startIndex: number): [number, number] | null {
    for (let i = startIndex; i < 81; i++) {
      const row = Math.floor(i / 9);
      const col = i % 9;
      if (board[row][col] === null) {
        return [row, col];
      }
    }
    return null;
  }

  /**
   * Solve a Sudoku board using backtracking
   */
  static solve(board: Board): boolean {
    const emptyCell = this.findEmptyCell(board, 0);
    if (!emptyCell) return true;
    
    const [row, col] = emptyCell;
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.shuffleArray(numbers); // Add randomness for variety
    
    for (const num of numbers) {
      if (this.isValidMove(board, row, col, num)) {
        board[row][col] = num;
        
        if (this.solve(board)) {
          return true;
        }
        
        board[row][col] = null; // Backtrack
      }
    }
    
    return false;
  }

  /**
   * Check if a move is valid
   */
  static isValidMove(board: Board, row: number, col: number, value: number): boolean {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (board[row][c] === value && c !== col) return false;
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
      if (board[r][col] === value && r !== row) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (board[r][c] === value && (r !== row || c !== col)) return false;
      }
    }
    
    return true;
  }

  /**
   * Check if a board is complete and valid
   */
  static isBoardComplete(board: Board): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === null) return false;
      }
    }
    return true;
  }

  /**
   * Check if a board is valid (no conflicts)
   */
  static isBoardValid(board: Board): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = board[row][col];
        if (value !== null && !this.isValidMove(board, row, col, value)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Create an empty notes grid
   */
  static createEmptyNotes(): Set<number>[][] {
    return Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => new Set<number>())
    );
  }

  /**
   * Convert board to string representation
   */
  static boardToString(board: Board): string {
    return board.map(row => 
      row.map(cell => cell === null ? '.' : cell.toString()).join('')
    ).join('');
  }

  /**
   * Convert string to board
   */
  static stringToBoard(boardString: string): Board {
    if (boardString.length !== 81) {
      throw new Error('Invalid board string length');
    }
    
    const board: Board = [];
    for (let i = 0; i < 9; i++) {
      const rowString = boardString.substring(i * 9, (i + 1) * 9);
      const row = rowString.split('').map(char => 
        char === '.' ? null : parseInt(char, 10)
      );
      board.push(row);
    }
    
    return board;
  }
}
