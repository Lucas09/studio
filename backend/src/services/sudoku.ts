export class SudokuGenerator {
  generate(difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Impossible'): {
    puzzle: string;
    solution: string;
  } {
    const solution = this.createSolvedBoard();
    const puzzle = this.createPuzzle(solution, difficulty);
    
    return {
      puzzle: this.boardToString(puzzle),
      solution: this.boardToString(solution),
    };
  }

  private createSolvedBoard(): number[][] {
    const board = Array(9).fill(null).map(() => Array(9).fill(null));
    this.solve(board);
    return board;
  }

  private solve(board: number[][]): boolean {
    const findEmpty = (b: number[][]) => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (b[r][c] === null) return [r, c];
        }
      }
      return null;
    };

    const isValid = (num: number, pos: [number, number], b: number[][]) => {
      const [r, c] = pos;
      
      // Check row
      for (let i = 0; i < 9; i++) {
        if (b[r][i] === num && c !== i) return false;
      }
      
      // Check column
      for (let i = 0; i < 9; i++) {
        if (b[i][c] === num && r !== i) return false;
      }
      
      // Check 3x3 box
      const boxRow = Math.floor(r / 3) * 3;
      const boxCol = Math.floor(c / 3) * 3;
      for (let i = boxRow; i < boxRow + 3; i++) {
        for (let j = boxCol; j < boxCol + 3; j++) {
          if (b[i][j] === num && (i !== r || j !== c)) return false;
        }
      }
      
      return true;
    };

    const empty = findEmpty(board);
    if (!empty) return true; // Board is full

    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    for (const num of nums) {
      if (isValid(num, empty as [number, number], board)) {
        board[empty[0]][empty[1]] = num;
        if (this.solve(board)) return true;
        board[empty[0]][empty[1]] = null; // Backtrack
      }
    }
    
    return false;
  }

  private createPuzzle(solution: number[][], difficulty: string): number[][] {
    const puzzle = solution.map(row => [...row]);
    let holes: number;

    switch (difficulty) {
      case 'Easy':
        holes = 35;
        break;
      case 'Medium':
        holes = 45;
        break;
      case 'Hard':
        holes = 50;
        break;
      case 'Very Hard':
        holes = 55;
        break;
      case 'Impossible':
        holes = 60;
        break;
      default:
        holes = 35;
    }

    let attempts = holes;
    while (attempts > 0) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (puzzle[row][col] !== null) {
        puzzle[row][col] = null;
        attempts--;
      }
    }

    return puzzle;
  }

  boardToString(board: number[][]): string {
    return board.map(row => 
      row.map(cell => cell === null ? '.' : cell.toString()).join('')
    ).join('');
  }

  stringToBoard(boardString: string): number[][] {
    if (!boardString || boardString.length !== 81) {
      return Array(9).fill(null).map(() => Array(9).fill(null));
    }

    const board: number[][] = [];
    for (let i = 0; i < 9; i++) {
      const rowString = boardString.substring(i * 9, (i + 1) * 9);
      const row = rowString.split('').map(char => 
        char === '.' ? null : parseInt(char, 10)
      );
      board.push(row);
    }
    return board;
  }

  createEmptyNotes(): Set<number>[][] {
    return Array(9).fill(0).map(() => 
      Array(9).fill(0).map(() => new Set<number>())
    );
  }

  notesToString(notes: Set<number>[][]): string {
    return JSON.stringify(
      notes.map(row => 
        row.map(cellSet => Array.from(cellSet))
      )
    );
  }

  stringToNotes(notesString: string): Set<number>[][] {
    if (!notesString) {
      return this.createEmptyNotes();
    }

    try {
      const parsedArray = typeof notesString === 'string' 
        ? JSON.parse(notesString) 
        : notesString;
      
      if (!Array.isArray(parsedArray)) {
        return this.createEmptyNotes();
      }

      return parsedArray.map(row => 
        (Array.isArray(row) ? row : []).map(cellArray => 
          new Set(Array.isArray(cellArray) ? cellArray : [])
        )
      );
    } catch (error) {
      console.error('Failed to parse notes string:', error);
      return this.createEmptyNotes();
    }
  }

  validateMove(board: number[][], row: number, col: number, value: number): boolean {
    if (value < 1 || value > 9) return false;
    if (row < 0 || row > 8 || col < 0 || col > 8) return false;
    if (board[row][col] !== null) return false;

    // Check row
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === value && i !== col) return false;
    }

    // Check column
    for (let i = 0; i < 9; i++) {
      if (board[i][col] === value && i !== row) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if (board[i][j] === value && (i !== row || j !== col)) return false;
      }
    }

    return true;
  }

  isBoardComplete(board: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === null) return false;
      }
    }
    return true;
  }

  isBoardValid(board: number[][]): boolean {
    // Check rows
    for (let r = 0; r < 9; r++) {
      const seen = new Set<number>();
      for (let c = 0; c < 9; c++) {
        const value = board[r][c];
        if (value !== null) {
          if (seen.has(value)) return false;
          seen.add(value);
        }
      }
    }

    // Check columns
    for (let c = 0; c < 9; c++) {
      const seen = new Set<number>();
      for (let r = 0; r < 9; r++) {
        const value = board[r][c];
        if (value !== null) {
          if (seen.has(value)) return false;
          seen.add(value);
        }
      }
    }

    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const seen = new Set<number>();
        for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
          for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
            const value = board[r][c];
            if (value !== null) {
              if (seen.has(value)) return false;
              seen.add(value);
            }
          }
        }
      }
    }

    return true;
  }
}

export const sudokuGenerator = new SudokuGenerator();
