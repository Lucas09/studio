export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export class SudokuGenerator {
    private board: number[][];
    private size: number;
    private boxSize: number;

    constructor(size: number = 9) {
        this.size = size;
        this.boxSize = Math.sqrt(size);
        this.board = this.createEmptyBoard();
    }

    private createEmptyBoard(): number[][] {
        return Array.from({ length: this.size }, () => Array(this.size).fill(0));
    }

    public generate(difficulty: Difficulty): { puzzle: (number | null)[][], solution: number[][] } {
        this.board = this.createEmptyBoard();
        this.solve();
        const solution = JSON.parse(JSON.stringify(this.board));
        const puzzle = this.createPuzzle(difficulty);
        return { puzzle, solution };
    }

    private solve(): boolean {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) {
                    const numbers = this.shuffle(Array.from({ length: this.size }, (_, i) => i + 1));
                    for (let num of numbers) {
                        if (this.isValid(row, col, num)) {
                            this.board[row][col] = num;
                            if (this.solve()) {
                                return true;
                            }
                            this.board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    private isValid(row: number, col: number, num: number): boolean {
        for (let i = 0; i < this.size; i++) {
            if (this.board[row][i] === num || this.board[i][col] === num) {
                return false;
            }
        }
        const startRow = Math.floor(row / this.boxSize) * this.boxSize;
        const startCol = Math.floor(col / this.boxSize) * this.boxSize;
        for (let i = 0; i < this.boxSize; i++) {
            for (let j = 0; j < this.boxSize; j++) {
                if (this.board[startRow + i][startCol + j] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    private createPuzzle(difficulty: Difficulty): (number | null)[][] {
        let attempts: number;
        switch (difficulty) {
            case 'easy': attempts = 40; break;
            case 'medium': attempts = 50; break;
            case 'hard': attempts = 55; break;
            case 'expert': attempts = 60; break;
            default: attempts = 45;
        }

        let puzzle: (number | null)[][] = JSON.parse(JSON.stringify(this.board));
        let removed = 0;

        while (removed < attempts) {
            let row = Math.floor(Math.random() * this.size);
            let col = Math.floor(Math.random() * this.size);

            if (puzzle[row][col] !== null) {
                puzzle[row][col] = null;
                removed++;
            }
        }
        return puzzle;
    }

    private shuffle(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
