

// --- Utility functions for Sudoku generation and manipulation ---
export const sudokuGenerator = {
    generate: (difficulty) => {
        let puzzle = Array(9).fill(null).map(() => Array(9).fill(null));
        sudokuGenerator.solve(puzzle);
        let holes;
        switch (difficulty) {
            case 'Let':
            case 'Easy':
                holes = 35;
                break;
            case 'Medium':
                holes = 45;
                break;
            case 'Svær':
            case 'Hard':
                holes = 50;
                break;
            case 'Meget svær':
            case 'Very Hard':
                holes = 55;
                break;
            case 'Umulig':
            case 'Impossible':
                holes = 60;
                break;
            default:
                holes = 35;
        }
        let solution = JSON.parse(JSON.stringify(puzzle));
        let attempts = holes;
        while (attempts > 0) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);
            if (puzzle[row][col] !== null) {
                puzzle[row][col] = null;
                attempts--;
            }
        }
        return { puzzle, solution };
    },
    solve: (board) => {
        const findEmpty = (b) => {
            for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (b[r][c] === null) return [r, c];
            return null;
        };
        const validate = (num, pos, b) => {
            const [r, c] = pos;
            for (let i = 0; i < 9; i++) if (b[r][i] === num && c !== i) return false;
            for (let i = 0; i < 9; i++) if (b[i][c] === num && r !== i) return false;
            const boxRow = Math.floor(r / 3) * 3, boxCol = Math.floor(c / 3) * 3;
            for (let i = boxRow; i < boxRow + 3; i++) for (let j = boxCol; j < boxCol + 3; j++) if (b[i][j] === num && (i !== r || j !== c)) return false;
            return true;
        };
        const empty = findEmpty(board);
        if (!empty) return true;
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (let i = 0; i < nums.length; i++) {
            if (validate(nums[i], empty, board)) {
                board[empty[0]][empty[1]] = nums[i];
                if (sudokuGenerator.solve(board)) return true;
                board[empty[0]][empty[1]] = null;
            }
        }
        return false;
    },
    // Converts a 2D array board to a flat string
    boardToString: (board) => {
        return board.map(row => row.map(cell => cell === null ? '.' : cell).join('')).join('');
    },
    // Converts a flat string to a 2D array board
    stringToBoard: (boardString) => {
        const board = [];
        for (let i = 0; i < 9; i++) {
            const row = boardString.substring(i * 9, (i + 1) * 9).split('').map(char => char === '.' ? null : parseInt(char));
            board.push(row);
        }
        return board;
    },
    // Serializes the notes Set[][] to a string
    notesToString: (notes) => {
        return JSON.stringify(notes.map(row => row.map(cellSet => Array.from(cellSet))));
    },
    // Deserializes a string back into the notes Set[][]
    stringToNotes: (notesString) => {
        if (!notesString) {
            return Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()));
        }
        const parsedArray = JSON.parse(notesString);
        return parsedArray.map(row => row.map(cellArray => new Set(cellArray)));
    }
};
