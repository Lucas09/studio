
"use client";
import React from 'react';
import { Home, Calendar, User, ArrowLeft, Star, Trophy, BrainCircuit, Users, Swords, HelpCircle, Lightbulb, History, Video, Repeat, Eraser, Copy, Check, Settings } from 'lucide-react';

// --- TRANSLATIONS ---
const translations = {
    da: {
        // General
        home: 'Hjem',
        challenges: 'Udfordringer',
        profile: 'Profil',
        settings: 'Sprog',
        language: 'Sprog',
        
        // Lobby
        title: 'Social Sudoku',
        continueGame: 'Fortsæt Sidste Spil',
        difficulty: 'Vælg Sværhedsgrad',
        startGameAlone: 'Start Spil (Alene)',
        startGameMultiplayer: 'Start Spil (Sammen med andre)',
        playTogether: 'Spil sammen',
        createNewGame: 'Opret et nyt spil',
        joinGame: 'Deltag i et spil',
        coop: 'Sammen',
        vs: 'Mod hinanden',
        enterGameId: 'Indtast Spil ID',
        join: 'Deltag',
        invalidGameId: 'Indtast venligst en gyldig 6-cifret spilkode.',

        // Difficulties
        easy: 'Let',
        medium: 'Medium',
        hard: 'Svær',
        veryhard: 'Meget svær',
        impossible: 'Umulig',

        // Game Board
        errors: 'Fejl',
        hint: 'Hint',
        erase: 'Slet',
        notes: 'Noter',
        gameOver: 'Game Over',
        gameOverMessage: 'Du har lavet 3 fejl.',
        tryAgain: 'Prøv Igen',
        watchAdForLife: 'Se Reklame for Ekstra Liv',
        opportunity: 'Mulighed!',
        adForHint: 'Se en reklame for et ekstra hint?',
        adForLife: 'Se reklame for et ekstra liv?',
        yes: 'Ja tak',
        no: 'Nej tak',
        congratulations: 'Tillykke!',
        puzzleSolved: 'Du har løst Sudokuen!',
        backToMenu: 'Tilbage til menuen',
        
        // Multiplayer Lobby
        gameLobby: 'Spil Lobby',
        shareCode: 'Del denne kode med en ven for at spille sammen.',
        waitingForPlayer: 'Venter på at en anden spiller deltager...',
        startGame: 'Start Spil',
        
        // Daily Challenges
        dailyChallengesTitle: 'Daglige Udfordringer',
        
        // Profile
        statistics: 'Statistik',
        memberSince: 'Medlem siden',
        solved: 'Løste',
        bestTime: 'Bedste tid',
        avgTime: 'Gns. tid',
        weekdays: ['M', 'T', 'O', 'T', 'F', 'L', 'S'],
        months: ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"],
    },
    en: {
        // General
        home: 'Home',
        challenges: 'Challenges',
        profile: 'Profile',
        settings: 'Settings',
        language: 'Language',

        // Lobby
        title: 'Social Sudoku',
        continueGame: 'Continue Last Game',
        difficulty: 'Select Difficulty',
        startGameAlone: 'Start Game (Solo)',
        startGameMultiplayer: 'Start Game (Multiplayer)',
        playTogether: 'Play Together',
        createNewGame: 'Create a new game',
        joinGame: 'Join a game',
        coop: 'Co-op',
        vs: 'Versus',
        enterGameId: 'Enter Game ID',
        join: 'Join',
        invalidGameId: 'Please enter a valid 6-character game code.',

        // Difficulties
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
        veryhard: 'Very Hard',
        impossible: 'Impossible',

        // Game Board
        errors: 'Errors',
        hint: 'Hint',
        erase: 'Erase',
        notes: 'Notes',
        gameOver: 'Game Over',
        gameOverMessage: 'You made 3 mistakes.',
        tryAgain: 'Try Again',
        watchAdForLife: 'Watch Ad for Extra Life',
        opportunity: 'Opportunity!',
        adForHint: 'Watch an ad for an extra hint?',
        adForLife: 'Watch an ad for an extra life?',
        yes: 'Yes please',
        no: 'No thanks',
        congratulations: 'Congratulations!',
        puzzleSolved: 'You solved the puzzle!',
        backToMenu: 'Back to menu',

        // Multiplayer Lobby
        gameLobby: 'Game Lobby',
        shareCode: 'Share this code with a friend to play together.',
        waitingForPlayer: 'Waiting for another player to join...',
        startGame: 'Start Game',

        // Daily Challenges
        dailyChallengesTitle: 'Daily Challenges',

        // Profile
        statistics: 'Statistics',
        memberSince: 'Member since',
        solved: 'Solved',
        bestTime: 'Best time',
        avgTime: 'Avg. time',
        weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    }
};

// Utility functions for Sudoku generation
const sudokuGenerator = {
    generate: (difficulty) => {
        let puzzle = Array(9).fill(0).map(() => Array(9).fill(0));
        sudokuGenerator.solve(puzzle);
        let holes = { 'Let': 35, 'Medium': 45, 'Svær': 50, 'Meget svær': 55, 'Umulig': 60 }[difficulty] || 35;
        let solution = JSON.parse(JSON.stringify(puzzle));
        let attempts = holes;
        while (attempts > 0) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);
            if (puzzle[row][col] !== 0) {
                puzzle[row][col] = 0;
                attempts--;
            }
        }
        return { puzzle, solution };
    },
    solve: (board) => {
        const findEmpty = (b) => {
            for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (b[r][c] === 0) return [r, c];
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
                board[empty[0]][empty[1]] = 0;
            }
        }
        return false;
    }
};

const calculateInitialCounts = (board) => {
    const counts = {};
    for (let i = 1; i <= 9; i++) {
        counts[i] = 0;
    }
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] !== 0) {
                counts[board[r][c]]++;
            }
        }
    }
    return counts;
};

// --- Components ---

const Confetti = () => {
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);


    if (!isClient) return null;

    const confettiCount = 150;
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-50">
            {Array.from({ length: confettiCount }).map((_, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-4"
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                        animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 5}s infinite`,
                        transform: `rotate(${Math.random() * 360}deg)`,
                        top: '-20px',
                    }}
                />
            ))}
            <style>{`
                @keyframes fall {
                    to {
                        transform: translateY(100vh) rotate(720deg);
                    }
                }
            `}</style>
        </div>
    );
};

const GameBoard = ({ gameData, onBack, onSave, t }) => {
    const [board, setBoard] = React.useState(JSON.parse(JSON.stringify(gameData.board || gameData.puzzle)));
    const [notes, setNotes] = React.useState(() => {
        if (gameData.notes) {
            return gameData.notes.map(row => row.map(cellNotes => new Set(cellNotes)));
        }
        return Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()));
    });
    const [isNoteMode, setIsNoteMode] = React.useState(false);
    const [selectedCell, setSelectedCell] = React.useState(null);
    const [highlightedNumber, setHighlightedNumber] = React.useState(null);
    const [timer, setTimer] = React.useState(gameData.timer || 0);
    const [errors, setErrors] = React.useState(gameData.errors || 0);
    const [hints, setHints] = React.useState(gameData.hints !== undefined ? gameData.hints : 3);
    const [isGameOver, setIsGameOver] = React.useState(false);
    const [isGameWon, setIsGameWon] = React.useState(false);
    const [isAdPlaying, setIsAdPlaying] = React.useState(false);
    const [adMessage, setAdMessage] = React.useState('');
    const [errorCells, setErrorCells] = React.useState(gameData.errorCells || []);
    const [numberCounts, setNumberCounts] = React.useState(() => calculateInitialCounts(board));

    React.useEffect(() => {
        if (isGameWon) return;
        const interval = setInterval(() => {
            setTimer(t => {
                const newTime = t + 1;
                if (gameData.mode === 'Alene') {
                    const notesAsArrays = notes.map(row => row.map(set => Array.from(set)));
                    onSave({ ...gameData, board, notes: notesAsArrays, timer: newTime, errors, hints, errorCells });
                }
                return newTime;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isGameWon, board, notes, errors, hints, errorCells, gameData, onSave]);

    const checkWinCondition = (currentBoard) => {
        const isBoardFull = !currentBoard.flat().includes(0);
        if (isBoardFull) {
            setIsGameWon(true);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleCellClick = (row, col) => {
        setSelectedCell({ row, col });
        const clickedNumber = board[row][col];
        setHighlightedNumber(clickedNumber !== 0 ? clickedNumber : null);
    };
    
    const clearNotesForValue = (row, col, value) => {
        const newNotes = [...notes];
        for (let i = 0; i < 9; i++) {
            newNotes[row][i].delete(value);
            newNotes[i][col].delete(value);
        }
        const startRow = Math.floor(row / 3) * 3, startCol = Math.floor(col / 3) * 3;
        for (let r = startRow; r < startRow + 3; r++) for (let c = startCol; c < startCol + 3; c++) newNotes[r][c].delete(value);
        setNotes(newNotes);
    };

    const handleNumberInput = (num) => {
        if (!selectedCell || isGameWon) return;
        const { row, col } = selectedCell;
        if (gameData.puzzle[row][col] !== 0) return; 

        if (isNoteMode) {
            const newNotes = [...notes];
            const cellNotes = newNotes[row][col];
            if (cellNotes.has(num)) cellNotes.delete(num);
            else cellNotes.add(num);
            setNotes(newNotes);
        } else {
            const newErrorCells = errorCells.filter(cell => !(cell.row === row && cell.col === col));
            const newBoard = board.map(r => [...r]);
            newBoard[row][col] = num;
            setBoard(newBoard);
            if (gameData.solution[row][col] === num) {
                setErrorCells(newErrorCells);
                clearNotesForValue(row, col, num);
                setNumberCounts(prev => ({ ...prev, [num]: (prev[num] || 0) + 1 }));
                setHighlightedNumber(num);
                checkWinCondition(newBoard);
            } else {
                setErrorCells([...newErrorCells, { row, col }]);
                const newErrors = errors + 1;
                setErrors(newErrors);
                if (newErrors >= 3) setIsGameOver(true);
            }
        }
    };
    
    const handleErase = () => {
        if (!selectedCell || isGameWon) return;
        const { row, col } = selectedCell;
        if (gameData.puzzle[row][col] !== 0) return;
        
        const numToErase = board[row][col];
        if (numToErase !== 0) {
            setNumberCounts(prev => ({ ...prev, [numToErase]: prev[numToErase] - 1 }));
        }

        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = 0;
        setBoard(newBoard);
        const newNotes = [...notes];
        newNotes[row][col].clear();
        setNotes(newNotes);
        setErrorCells(errorCells.filter(cell => !(cell.row === row && cell.col === col)));
    };

    const handleHint = () => {
        if (hints > 0 && !isGameWon) {
            const emptyCells = [];
            for(let r=0; r<9; r++) for(let c=0; c<9; c++) if(board[r][c] === 0) emptyCells.push({r, c});
            if(emptyCells.length > 0) {
                const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                const newBoard = board.map(r => [...r]);
                const hintNum = gameData.solution[r][c];
                newBoard[r][c] = hintNum;
                setBoard(newBoard);
                setHints(h => h - 1);
                setNumberCounts(prev => ({ ...prev, [hintNum]: (prev[hintNum] || 0) + 1 }));
                clearNotesForValue(r, c, hintNum);
                setErrorCells(errorCells.filter(cell => !(cell.row === r && cell.col === c)));
                checkWinCondition(newBoard);
            }
        } else if (!isGameWon) {
            setAdMessage(t.adForHint);
            setIsAdPlaying(true);
        }
    };
    
    const handleAdConfirm = (type) => {
        setIsAdPlaying(false);
        setTimeout(() => {
            if(type === 'hint') setHints(1);
            else if (type === 'life') {
                setIsGameOver(false);
                setErrors(2);
            }
        }, 1500);
    };
    
    const Modal = ({ title, titleColor, children, onConfirm, onCancel, confirmText, cancelText }) => (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-full max-w-sm text-gray-800">
                <h2 className={`text-3xl font-bold mb-4 ${titleColor}`}>{title}</h2>
                <div className="text-gray-600 mb-6">{children}</div>
                <div className="flex flex-col space-y-4">
                    {onConfirm && <button onClick={onConfirm} className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105">{confirmText}</button>}
                    {onCancel && <button onClick={onCancel} className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105">{cancelText}</button>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 bg-gray-50 text-gray-800 flex flex-col h-full justify-between">
            {isGameWon && <Confetti />}
            {isGameWon && <Modal title={t.congratulations} titleColor="text-green-500" onCancel={onBack} cancelText={t.backToMenu}><p>{t.puzzleSolved}</p></Modal>}
            {isGameOver && <Modal title={t.gameOver} titleColor="text-red-500" onCancel={onBack} cancelText={<><Repeat className="mr-2 h-5 w-5" /> {t.tryAgain}</>} onConfirm={() => { setIsGameOver(false); setAdMessage(t.adForLife); setIsAdPlaying(true); }} confirmText={<><Video className="mr-2 h-5 w-5" /> {t.watchAdForLife}</>}><p>{t.gameOverMessage}</p></Modal>}
            {isAdPlaying && <Modal title={t.opportunity} titleColor="text-yellow-500" onCancel={() => setIsAdPlaying(false)} cancelText={t.no} onConfirm={() => handleAdConfirm(adMessage.includes('hint') ? 'hint' : 'life')} confirmText={t.yes}><p>{adMessage}</p></Modal>}
            
            <div>
                <div className="flex justify-between items-center mb-4">
                    <button onClick={onBack} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"><ArrowLeft /></button>
                    <div className="text-lg font-semibold">{gameData.difficulty}</div>
                    <div className="flex items-center space-x-4">
                        <div className="text-red-500 font-bold text-lg">{t.errors}: {errors}/3</div>
                        <div className="font-mono text-lg">{formatTime(timer)}</div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-1 sm:gap-1.5 bg-gray-400 rounded-lg overflow-hidden border-2 border-gray-400 aspect-square">
                    {Array.from({ length: 9 }).map((_, boxIdx) => (
                        <div key={boxIdx} className="grid grid-cols-3 gap-px bg-gray-300">
                            {Array.from({ length: 9 }).map((_, cellIdx) => {
                                const rIdx = Math.floor(boxIdx / 3) * 3 + Math.floor(cellIdx / 3);
                                const cIdx = (boxIdx % 3) * 3 + (cellIdx % 3);
                                const cell = board[rIdx][cIdx];
                                const isGiven = gameData.puzzle[rIdx][cIdx] !== 0;
                                const isSelected = selectedCell && selectedCell.row === rIdx && selectedCell.col === cIdx;
                                const isInSelectedRowCol = !isSelected && selectedCell && (rIdx === selectedCell.row || cIdx === selectedCell.col);
                                const isInSelectedBox = !isSelected && selectedCell && (Math.floor(rIdx / 3) === Math.floor(selectedCell.row / 3) && Math.floor(cIdx / 3) === Math.floor(selectedCell.col / 3));
                                const isError = !isGiven && errorCells.some(cell => cell.row === rIdx && cell.col === cIdx);
                                const isHighlighted = !isSelected && highlightedNumber && cell !== 0 && cell === highlightedNumber;

                                return (
                                    <div key={`${rIdx}-${cIdx}`} onClick={() => handleCellClick(rIdx, cIdx)} className={`flex justify-center items-center aspect-square transition-colors duration-100 cursor-pointer ${isSelected ? 'bg-blue-300' : isHighlighted ? 'bg-yellow-200' : (isInSelectedRowCol || isInSelectedBox) ? 'bg-blue-100' : 'bg-white'}`}>
                                        <div className={`text-3xl ${isGiven ? 'font-bold text-gray-800' : isError ? 'font-medium text-red-500' : 'font-medium text-blue-600'}`}>
                                            {cell !== 0 ? cell : (
                                                notes[rIdx][cIdx].size > 0 && (
                                                    <div className="grid grid-cols-3 gap-px text-xs text-gray-500 leading-none">
                                                        {[1,2,3,4,5,6,7,8,9].map(n => (<div key={n} className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex justify-center items-center">{notes[rIdx][cIdx].has(n) ? n : ''}</div>))}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4">
                <div className="flex justify-center items-center space-x-4 mb-4">
                    <button onClick={handleHint} className="flex flex-col items-center p-3 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50" disabled={hints === 0}><Lightbulb className="text-yellow-500"/><span className="text-xs font-semibold mt-1">{t.hint} ({hints})</span></button>
                    <button onClick={handleErase} className="flex flex-col items-center p-3 rounded-lg bg-gray-200 hover:bg-gray-300"><Eraser /><span className="text-xs font-semibold mt-1">{t.erase}</span></button>
                    <button onClick={() => setIsNoteMode(!isNoteMode)} className={`flex flex-col items-center p-3 rounded-lg transition-colors ${isNoteMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}><BrainCircuit /><span className="text-xs font-semibold mt-1">{t.notes}</span></button>
                </div>
                <div className="grid grid-cols-9 gap-1 sm:gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (<button key={num} onClick={() => handleNumberInput(num)} disabled={numberCounts[num] === 9} className="bg-gray-200 hover:bg-blue-200 text-2xl font-bold rounded-lg p-3 aspect-square flex justify-center items-center transition-transform transform hover:scale-105 disabled:opacity-30 disabled:pointer-events-none">{num}</button>))}
                </div>
            </div>
        </div>
    );
};

const MultiplayerLobby = ({ gameId, onStart, onBack, t }) => {
    const [copied, setCopied] = React.useState(false);

    const copyToClipboard = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(gameId).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    return (
        <div className="p-6 bg-gray-50 text-gray-800 flex flex-col h-full items-center justify-center text-center">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
                <button onClick={onBack} className="absolute top-6 left-6 p-2 rounded-full bg-gray-200 hover:bg-gray-300"><ArrowLeft /></button>
                <h2 className="text-2xl font-bold mb-4">{t.gameLobby}</h2>
                <p className="text-gray-600 mb-6">{t.shareCode}</p>
                <div className="flex items-center justify-center space-x-2 bg-gray-100 p-4 rounded-lg mb-6">
                    <span className="text-3xl font-bold tracking-widest text-blue-600">{gameId}</span>
                    <button onClick={copyToClipboard} className="p-2 rounded-full hover:bg-gray-300 transition-colors">
                        {copied ? <Check className="text-green-500" /> : <Copy />}
                    </button>
                </div>
                <p className="text-gray-500 mb-6 animate-pulse">{t.waitingForPlayer}</p>
                <button onClick={onStart} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-transform transform hover:scale-105">
                    {t.startGame}
                </button>
            </div>
        </div>
    );
};

const Lobby = ({ onStartGame, onCreateMultiplayerGame, onJoinMultiplayerGame, onResumeGame, t }) => {
    const [difficulty, setDifficulty] = React.useState('Let');
    const [gameMode, setGameMode] = React.useState(null);
    const [multiplayerStep, setMultiplayerStep] = React.useState(null);
    const [joinGameId, setJoinGameId] = React.useState('');
    const [hasSavedGame, setHasSavedGame] = React.useState(false);

    React.useEffect(() => {
        setHasSavedGame(!!localStorage.getItem('savedSudokuGame'))
    }, []);


    const difficulties = {
        'Let': t.easy, 'Medium': t.medium, 'Svær': t.hard, 
        'Meget svær': t.veryhard, 'Umulig': t.impossible
    };

    const handleMultiplayerClick = () => {
        if (gameMode === 'multi') {
            setGameMode(null);
            setMultiplayerStep(null);
        } else {
            setGameMode('multi');
            setMultiplayerStep('choice');
        }
    };

    return (
        <div className="p-6 bg-gray-50 text-gray-800 flex flex-col h-full">
            <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">{t.title}</h1>
            
            {hasSavedGame && (<button onClick={onResumeGame} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl mb-8 flex items-center justify-center transition-transform transform hover:scale-105"><History className="mr-3" /> {t.continueGame}</button>)}

            <div className="bg-white p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{t.difficulty}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {Object.entries(difficulties).map(([key, value]) => (<button key={key} onClick={() => setDifficulty(key)} className={`py-3 rounded-lg text-sm font-semibold transition-colors ${difficulty === key ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{value}</button>))}
                </div>

                <div className="flex flex-col space-y-4">
                     <button onClick={() => onStartGame(difficulty, 'Alene')} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-transform transform hover:scale-105">{t.startGameAlone}</button>
                    <button onClick={handleMultiplayerClick} className={`w-full text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-colors ${gameMode === 'multi' ? 'bg-purple-600' : 'bg-purple-500 hover:bg-purple-600'}`}>{t.startGameMultiplayer}</button>
                </div>

                {gameMode === 'multi' && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                        {multiplayerStep === 'choice' && (
                            <>
                                <h3 className="font-semibold mb-3 text-center">{t.playTogether}</h3>
                                <div className="flex flex-col space-y-3">
                                    <button onClick={() => setMultiplayerStep('create')} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg">{t.createNewGame}</button>
                                    <button onClick={() => setMultiplayerStep('join')} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg">{t.joinGame}</button>
                                </div>
                            </>
                        )}
                        {multiplayerStep === 'create' && (
                             <>
                                <h3 className="font-semibold mb-3 text-center">{t.createNewGame}</h3>
                                <div className="flex space-x-4 mb-4">
                                    <button onClick={() => onCreateMultiplayerGame(difficulty, 'Sammen')} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-lg flex items-center justify-center"><Users className="mr-2 h-5 w-5" /> {t.coop}</button>
                                    <button onClick={() => onCreateMultiplayerGame(difficulty, 'Mod hinanden')} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center"><Swords className="mr-2 h-5 w-5" /> {t.vs}</button>
                                </div>
                             </>
                        )}
                        {multiplayerStep === 'join' && (
                            <>
                                <h3 className="font-semibold mb-3 text-center">{t.joinGame}</h3>
                                <div className="flex items-center space-x-2">
                                    <input type="text" value={joinGameId} onChange={(e) => setJoinGameId(e.target.value.toUpperCase())} placeholder={t.enterGameId} className="w-full p-3 rounded-md bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest"/>
                                    <button onClick={() => onJoinMultiplayerGame(joinGameId)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold p-3 rounded-md">{t.join}</button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const DailyChallenges = ({ onStartDailyChallenge, t }) => {
    const today = new Date();
    const firstDayOfMonth = (new Date(today.getFullYear(), today.getMonth(), 1).getDay() + 6) % 7;
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const completedChallenges = [3, 8, 12, 15];
    const calendarDays = Array.from({length: daysInMonth}, (_, i) => i + 1);
    const emptyDays = Array.from({length: firstDayOfMonth});
    const monthName = t.months[today.getMonth()];

    return (
        <div className="p-4 sm:p-6 bg-gray-50 text-gray-800 flex flex-col h-full">
            <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">{t.dailyChallengesTitle}</h1>
            <div className="bg-white p-4 rounded-2xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <button className="p-2 rounded-full hover:bg-gray-200"><ArrowLeft /></button>
                    <h2 className="text-xl font-semibold">{monthName} {today.getFullYear()}</h2>
                    <button className="p-2 rounded-full hover:bg-gray-200 transform rotate-180"><ArrowLeft /></button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-2">{t.weekdays.map((day, index) => <div key={`${day}-${index}`}>{day}</div>)}</div>
                <div className="grid grid-cols-7 gap-2">
                    {emptyDays.map((_, i) => <div key={`empty-${i}`}></div>)}
                    {calendarDays.map(day => {
                        const isCompleted = completedChallenges.includes(day);
                        const isToday = day === today.getDate();
                        const isFuture = day > today.getDate();
                        return (<button 
                                    key={day} 
                                    onClick={() => onStartDailyChallenge(day)}
                                    disabled={isFuture}
                                    className={`aspect-square rounded-lg flex flex-col justify-center items-center transition-colors 
                                        ${isFuture ? 'bg-gray-100 text-gray-400' : isToday ? 'bg-blue-500 text-white ring-2 ring-blue-300' : 'bg-gray-200 hover:bg-gray-300'} 
                                        ${isCompleted ? 'bg-green-500 text-white' : ''}
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}>
                                <span className="text-lg font-bold">{day}</span>
                                {isCompleted && <Trophy className="h-4 w-4 text-yellow-300" />}
                            </button>)
                    })}
                </div>
            </div>
        </div>
    );
};

const Profile = ({ t, language, setLanguage }) => {
    const stats = {
        'Let': { solved: 12, bestTime: '03:45', avgTime: '05:12' },
        'Medium': { solved: 8, bestTime: '07:11', avgTime: '09:34' },
        'Svær': { solved: 3, bestTime: '15:23', avgTime: '18:01' },
        'Meget svær': { solved: 1, bestTime: '25:40', avgTime: '25:40' },
        'Umulig': { solved: 0, bestTime: 'N/A', avgTime: 'N/A' },
    };

    return (
        <div className="p-6 bg-gray-50 text-gray-800 flex flex-col h-full">
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-4 ring-4 ring-white shadow-md"><User className="w-12 h-12 text-white" /></div>
                <h1 className="text-2xl font-bold">Spiller123</h1>
                <p className="text-gray-500">{t.memberSince} Juli 2025</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">{t.statistics}</h2>
                <div className="space-y-3">
                    {Object.entries(stats).map(([difficulty, data]) => (
                        <div key={difficulty} className="bg-gray-100 p-4 rounded-lg">
                            <h3 className="font-bold text-blue-600">{t[difficulty.toLowerCase().replace(/ /g, '').replace('æ', 'ae')] || difficulty}</h3>
                            <div className="flex justify-between items-center text-sm mt-2 text-gray-600 flex-wrap gap-2">
                                <span>{t.solved}: <span className="font-semibold text-gray-800">{data.solved}</span></span>
                                <span>{t.bestTime}: <span className="font-semibold text-gray-800">{data.bestTime}</span></span>
                                <span>{t.avgTime}: <span className="font-semibold text-gray-800">{data.avgTime}</span></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-md">
                 <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">{t.settings}</h2>
                 <div className="p-4 bg-gray-100 rounded-lg">
                    <h3 className="font-bold text-blue-600 mb-2">{t.language}</h3>
                    <div className="flex space-x-4">
                        <button onClick={() => setLanguage('da')} className={`w-full py-2 rounded-lg font-semibold ${language === 'da' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Dansk</button>
                        <button onClick={() => setLanguage('en')} className={`w-full py-2 rounded-lg font-semibold ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>English</button>
                    </div>
                 </div>
            </div>
        </div>
    );
};


export default function App() {
    const [language, setLanguage] = React.useState('da');
    const [activeView, setActiveView] = React.useState('lobby');
    const [gameData, setGameData] = React.useState(null);
    const [multiplayerInfo, setMultiplayerInfo] = React.useState(null);
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);
    
    const t = translations[language];

    const handleSaveGame = (currentGameState) => {
        if (typeof window !== 'undefined' && currentGameState.mode === 'Alene') {
            localStorage.setItem('savedSudokuGame', JSON.stringify(currentGameState));
        }
    };

    const startGame = (difficulty, mode, gameId = null) => {
        const { puzzle, solution } = sudokuGenerator.generate(difficulty);
        const difficultyKey = Object.keys(t).find(key => t[key] === difficulty) || difficulty;
        const newGameData = { puzzle, solution, difficulty: t[difficultyKey] || difficulty, mode, gameId };
        setGameData(newGameData);
        setActiveView('game');
        if (mode === 'Alene') {
             handleSaveGame(newGameData);
        }
    };

    const handleResumeGame = () => {
        if (typeof window !== 'undefined') {
            const savedGameJSON = localStorage.getItem('savedSudokuGame');
            if (savedGameJSON) {
                const savedGameData = JSON.parse(savedGameJSON);
                setGameData(savedGameData);
                setActiveView('game');
            }
        }
    };
    
    const handleCreateMultiplayerGame = (difficulty, mode) => {
        const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
        setMultiplayerInfo({ gameId, difficulty, mode });
        setActiveView('multiplayerLobby');
    };

    const handleJoinMultiplayerGame = (gameId) => {
        if (gameId && gameId.length === 6) {
            const difficulty = 'Medium';
            const mode = 'Sammen';
            startGame(difficulty, mode, gameId);
        } else {
            alert(t.invalidGameId);
        }
    };
    
    const handleStartDailyChallenge = (day) => {
        startGame('Medium', `${t.dailyChallengesTitle} - Dag ${day}`);
    };
    
    const handleGameExit = () => {
        const previousView = gameData?.mode?.startsWith(t.dailyChallengesTitle) ? 'daily' : 'lobby';
        if (typeof window !== 'undefined' && gameData?.mode === 'Alene') {
            localStorage.removeItem('savedSudokuGame');
        }
        setGameData(null);
        setMultiplayerInfo(null);
        setActiveView(previousView);
    };

    const renderView = () => {
        switch (activeView) {
            case 'game': 
                return <GameBoard gameData={gameData} onBack={handleGameExit} onSave={handleSaveGame} t={t} />;
            case 'multiplayerLobby':
                return <MultiplayerLobby 
                            gameId={multiplayerInfo.gameId} 
                            onBack={handleGameExit}
                            onStart={() => startGame(multiplayerInfo.difficulty, multiplayerInfo.mode, multiplayerInfo.gameId)}
                            t={t}
                        />;
            case 'daily': 
                return <DailyChallenges onStartDailyChallenge={handleStartDailyChallenge} t={t} />;
            case 'profile': 
                return <Profile t={t} language={language} setLanguage={setLanguage} />;
            case 'lobby': 
            default: 
                return <Lobby 
                            onStartGame={startGame} 
                            onCreateMultiplayerGame={handleCreateMultiplayerGame}
                            onJoinMultiplayerGame={handleJoinMultiplayerGame}
                            onResumeGame={handleResumeGame}
                            t={t}
                        />;
        }
    };

    const NavItem = ({ view, icon, label }) => (
        <button onClick={() => setActiveView(view)} className={`flex flex-col items-center justify-center w-full pt-3 pb-3 transition-colors ${activeView === view ? 'text-blue-500' : 'text-gray-400 hover:text-gray-800'}`}>
            {icon}
            <span className="text-xs mt-1 font-medium">{label}</span>
        </button>
    );
    
    if (!isClient) {
        return (
            <div className="h-screen w-screen bg-gray-50 font-sans flex flex-col max-w-lg mx-auto shadow-2xl">
              <main className="flex-grow overflow-y-auto relative"></main>
              <nav className="flex justify-around bg-white border-t border-gray-200 shadow-lg pb-safe">
                    <div className="flex flex-col items-center justify-center w-full pt-3 pb-3 text-gray-400">
                        <Home /><span className="text-xs mt-1 font-medium">{t.home}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full pt-3 pb-3 text-gray-400">
                        <Calendar /><span className="text-xs mt-1 font-medium">{t.challenges}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full pt-3 pb-3 text-gray-400">
                        <User /><span className="text-xs mt-1 font-medium">{t.profile}</span>
                    </div>
              </nav>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-gray-50 font-sans flex flex-col max-w-lg mx-auto shadow-2xl">
            <main className="flex-grow overflow-y-auto relative">
                {renderView()}
            </main>
            {activeView !== 'multiplayerLobby' && (
                <nav className="flex justify-around bg-white border-t border-gray-200 shadow-lg pb-safe">
                    <NavItem view="lobby" icon={<Home />} label={t.home} />
                    <NavItem view="daily" icon={<Calendar />} label={t.challenges} />
                    <NavItem view="profile" icon={<User />} label={t.profile} />
                </nav>
            )}
        </div>
    );
}

    