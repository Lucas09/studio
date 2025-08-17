
"use client";
import React from 'react';
import { ArrowLeft, Lightbulb, Eraser, BrainCircuit, Repeat, Video } from 'lucide-react';
import type { Game, Player } from '@/lib/game-state';
import { updateGame, endGame } from '@/services/game-service';
import { getAdaptiveHint } from '@/ai/flows/adaptive-hints';
import type { AdaptiveHintResponse } from '@/ai/schema/adaptive-hints';
import { sudokuGenerator } from '@/lib/sudoku';
import { useGameUpdates } from '@/hooks/use-game-updates';


const calculateInitialCounts = (board) => {
    const counts = {};
    for (let i = 1; i <= 9; i++) {
        counts[i] = 0;
    }
    if (!board) return counts;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r] && board[r][c] !== null) {
                counts[board[r][c]]++;
            }
        }
    }
    return counts;
};


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


const GameBoard = ({ initialGameData, onBack, onSave, t, playerId }) => {
    const { gameData, setGameData } = useGameUpdates(initialGameData.gameId, initialGameData);
    const [isNoteMode, setIsNoteMode] = React.useState(false);
    const [selectedCell, setSelectedCell] = React.useState(null);
    const [highlightedNumber, setHighlightedNumber] = React.useState(null);
    const [isGameOver, setIsGameOver] = React.useState(false);
    const [isGameWon, setIsGameWon] = React.useState(false);
    const [isAdPlaying, setIsAdPlaying] = React.useState(false);
    const [adMessage, setAdMessage] = React.useState('');
    const [isAiHintLoading, setIsAiHintLoading] = React.useState(false);
    const [aiHint, setAiHint] = React.useState<AdaptiveHintResponse | null>(null);

    
    const isMultiplayer = gameData.mode !== 'Solo' && !gameData.mode.startsWith('Daily');
    const playerState: Player | undefined = gameData.players?.[playerId];
    const opponentId = isMultiplayer ? Object.keys(gameData.players || {}).find(id => id !== playerId) : null;
    const opponentState: Player | undefined = opponentId ? gameData.players?.[opponentId] : undefined;

    const board = playerState?.board
    const notes = playerState?.notes
    const timer = playerState?.timer ?? 0;
    const errors = playerState?.errors ?? 0;
    const hints = playerState?.hints ?? 0;

    const [numberCounts, setNumberCounts] = React.useState(() => calculateInitialCounts(board));
    
    const puzzle = gameData.puzzle;
    const solution = gameData.solution;

    // Real-time updates for multiplayer
    React.useEffect(() => {
        if (gameData?.status === 'finished') {
            if (gameData.winner && gameData.winner === playerId) {
                setIsGameWon(true);
            } else {
                setIsGameOver(true);
            }
        }
    }, [gameData, playerId]);
    
    // Timer logic
    React.useEffect(() => {
        if (gameData.status !== 'active' || isGameWon || isGameOver || !playerState) return;
        
        const interval = setInterval(() => {
            const newTime = (playerState.timer || 0) + 1;
            const updates: Partial<Player> = { timer: newTime };
            
            if (isMultiplayer && gameData.gameId) {
                updateGame(gameData.gameId, playerId, updates);
            } else {
                 const updatedPlayerState = { ...playerState, ...updates };
                 const updatedGame = { ...gameData, players: { ...gameData.players, [playerId]: updatedPlayerState }};
                 setGameData(updatedGame as Game);
                 onSave(updatedGame);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [gameData.status, playerState, onSave, isMultiplayer, gameData.gameId, playerId, isGameWon, isGameOver, setGameData]);

    React.useEffect(() => {
        if (board) {
            checkWinCondition(board);
            setNumberCounts(calculateInitialCounts(board));
        }
    }, [board]);

     React.useEffect(() => {
        if (errors >= 3) {
            setIsGameOver(true);
            if (isMultiplayer && gameData.gameId) {
                endGame(gameData.gameId, 'lost');
            }
        }
    }, [errors, isMultiplayer, gameData.gameId]);

    const updateGameState = (updates: Partial<Player>) => {
        if (isMultiplayer && gameData.gameId) {
            updateGame(gameData.gameId, playerId, updates);
        } else {
             const updatedPlayerState = { ...playerState, ...updates };
             const updatedGame = { ...gameData, players: { ...gameData.players, [playerId]: updatedPlayerState }};
             setGameData(updatedGame as Game);
        }
    };
    
    const checkWinCondition = (currentBoard) => {
        if (!currentBoard) return;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (!currentBoard[r] || currentBoard[r][c] === null) {
                    return; // Game not finished
                }
            }
        }
        
        // Final check against solution
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (currentBoard[r][c] !== solution[r][c]) {
                     return; // Found a mistake, not a win
                }
            }
        }

        setIsGameWon(true);
        if(isMultiplayer && gameData.gameId) {
             endGame(gameData.gameId, 'win', playerId);
        }
    };

    const formatTime = (seconds) => {
        if(typeof seconds !== 'number' || isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleCellClick = (row, col) => {
        if (!board) return;
        setSelectedCell({ row, col });
        const clickedNumber = board[row][col];
        setHighlightedNumber(clickedNumber !== null ? clickedNumber : null);
    };
    
    const clearNotesForValue = (currentNotes, row, col, value) => {
        if(!currentNotes) return [];
        const newNotes = currentNotes.map(r => r.map(c => new Set(c)));
        // Clear row
        for (let i = 0; i < 9; i++) {
            newNotes[row][i].delete(value);
        }
        // Clear column
        for (let i = 0; i < 9; i++) {
            newNotes[i][col].delete(value);
        }
        // Clear 3x3 box
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                newNotes[r][c].delete(value);
            }
        }
        return newNotes;
    };

    const handleNumberInput = (num) => {
        if (!selectedCell || isGameWon || gameData.status === 'finished' || !playerState || !board || !notes) return;
        const { row, col } = selectedCell;
        
        if (puzzle[row][col] !== null) return; 

        if (isNoteMode) {
            const newNotes = notes.map(r => r.map(c => new Set(c)));
            const cellNotes = newNotes[row][col];
            if (cellNotes.has(num)) {
                cellNotes.delete(num);
            } else {
                cellNotes.add(num);
            }
            updateGameState({ notes: newNotes });
        } else {
            let newErrorCells = (playerState.errorCells || []).filter(cell => !(cell.row === row && cell.col === col));
            const newBoard = board.map(r => [...r]);
            newBoard[row][col] = num;
            
            if (solution[row][col] === num) {
                const newNotes = clearNotesForValue(notes, row, col, num);
                setHighlightedNumber(num);
                updateGameState({ board: newBoard, errorCells: newErrorCells, notes: newNotes });
            } else {
                newErrorCells.push({ row, col });
                const newErrors = errors + 1;
                updateGameState({ board: newBoard, errorCells: newErrorCells, errors: newErrors });
            }
        }
    };
    
    const handleErase = () => {
        if (!selectedCell || isGameWon || gameData.status === 'finished' || !playerState || !board) return;
        const { row, col } = selectedCell;
        if (puzzle[row][col] !== null) return;
        
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = null;
        
        const newNotes = notes?.map(r => r.map(c => new Set(c)));
        if (newNotes && newNotes[row]) {
            newNotes[row][col].clear();
        }

        const newErrorCells = (playerState.errorCells || []).filter(cell => !(cell.row === row && cell.col === col));
        updateGameState({ board: newBoard, notes: newNotes, errorCells: newErrorCells });
    };

    const handleHint = () => {
        if (hints > 0 && !isGameWon && board) {
            const emptyCells = [];
            for(let r=0; r<9; r++) for(let c=0; c<9; c++) if(board[r][c] === null) emptyCells.push({r, c});
            if(emptyCells.length > 0) {
                const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                const newBoard = board.map(b => [...b]);
                const hintNum = solution[r][c];
                newBoard[r][c] = hintNum;
                const newNotes = clearNotesForValue(notes, r, c, hintNum);
                const newErrorCells = (playerState.errorCells || []).filter(cell => !(cell.row === r && cell.col === c));
                updateGameState({ board: newBoard, hints: hints - 1, notes: newNotes, errorCells: newErrorCells });
            }
        } else if (!isGameWon) {
            setAdMessage(t.adForHint);
            setIsAdPlaying(true);
        }
    };

     const handleAiHint = async () => {
        if (!board) return;
        setIsAiHintLoading(true);
        setAiHint(null);
        try {
            const progress = (Object.values(numberCounts).reduce((a, b) => a + b, 0) - (81 - sudokuGenerator.getEmptyCells(puzzle))) / sudokuGenerator.getEmptyCells(puzzle);

            const hint = await getAdaptiveHint({
                puzzle: sudokuGenerator.boardToString(board),
                difficulty: gameData.difficulty,
                skillLevel: 5, // This could be dynamic in the future
                progress: Math.max(0, Math.min(1, progress)),
            });
            setAiHint(hint);
        } catch (error) {
            console.error("Error getting AI hint:", error);
            setAiHint({ hint: t.aiHintError, reasoning: "" });
        }
        setIsAiHintLoading(false);
    };

    
    const handleAdConfirm = (type) => {
        setIsAdPlaying(false);
        setTimeout(() => {
            if(type === 'hint') updateGameState({ hints: (hints || 0) + 1 });
            else if (type === 'life') {
                setIsGameOver(false);
                updateGameState({ errors: Math.min(2, errors) });
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
    
    if (!gameData || !playerState || !board || !notes) {
        return <div className="flex justify-center items-center h-full">Loading...</div>;
    }

    const difficultyTranslations = {
        'Easy': t.easy,
        'Medium': t.medium,
        'Hard': t.hard,
        'Very Hard': t.veryhard,
        'Impossible': t.impossible
    };
    const translatedDifficulty = difficultyTranslations[gameData.difficulty] || gameData.difficulty;

    const gameWonByCurrentPlayer = isGameWon && (gameData.winner === playerId || !isMultiplayer);
    const gameLost = isGameOver || (gameData.status === 'finished' && gameData.winner !== playerId);

    return (
        <div className="p-4 bg-gray-50 text-gray-800 flex flex-col h-full justify-between">
            {gameWonByCurrentPlayer && <Confetti />}
            {gameWonByCurrentPlayer && <Modal title={t.congratulations} titleColor="text-green-500" onCancel={onBack} cancelText={t.backToMenu}><p>{t.puzzleSolved}</p></Modal>}
            
            {gameLost && gameData.winner && gameData.winner !== playerId && <Modal title={t.gameOver} titleColor="text-red-500" onCancel={onBack} cancelText={t.backToMenu}><p>{t.opponentWon}</p></Modal>}

            {gameLost && !gameData.winner && <Modal title={t.gameOver} titleColor="text-red-500" onCancel={onBack} cancelText={<><Repeat className="mr-2 h-5 w-5" /> {t.tryAgain}</>} onConfirm={() => { setIsGameOver(false); setAdMessage(t.adForLife); setIsAdPlaying(true); }} confirmText={<><Video className="mr-2 h-5 w-5" /> {t.watchAdForLife}</>}><p>{t.gameOverMessage}</p></Modal>}
            {isAdPlaying && <Modal title={t.opportunity} titleColor="text-yellow-500" onCancel={() => setIsAdPlaying(false)} cancelText={t.no} onConfirm={() => handleAdConfirm(adMessage.includes('hint') ? 'hint' : 'life')} confirmText={t.yes}><p>{adMessage}</p></Modal>}
            
            {(aiHint || isAiHintLoading) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={() => setAiHint(null)}>
                    <div className="bg-white p-6 rounded-2xl shadow-lg text-center w-full max-w-sm text-gray-800 relative" onClick={(e) => e.stopPropagation()}>
                         <button onClick={() => setAiHint(null)} className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full">&times;</button>
                        <h2 className="text-2xl font-bold mb-4 text-blue-600">{t.aiHintTitle}</h2>
                        {isAiHintLoading ? <div className="animate-pulse">Loading...</div> : <p className="text-gray-700">{aiHint?.hint}</p>}
                    </div>
                </div>
            )}

            <div>
                <div className="flex justify-between items-center mb-4">
                    <button onClick={onBack} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"><ArrowLeft /></button>
                    <div className="text-lg font-semibold">{translatedDifficulty} {gameData.mode !== 'Solo' && !gameData.mode.startsWith('Daily') ? `(${gameData.mode})` : ''}</div>
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
                                if (!board || !board[rIdx]) return null;
                                const cell = board[rIdx][cIdx];
                                const isGiven = puzzle[rIdx][cIdx] !== null;
                                const isSelected = selectedCell && selectedCell.row === rIdx && selectedCell.col === cIdx;
                                const isInSelectedRowCol = !isSelected && selectedCell && (rIdx === selectedCell.row || cIdx === selectedCell.col);
                                const isInSelectedBox = !isSelected && selectedCell && (Math.floor(rIdx / 3) === Math.floor(selectedCell.row / 3) && Math.floor(cIdx / 3) === Math.floor(selectedCell.col / 3));
                                const isError = !isGiven && (playerState.errorCells || []).some(cell => cell.row === rIdx && cell.col === cIdx);
                                const isHighlighted = !isSelected && highlightedNumber && cell !== null && cell === highlightedNumber;

                                return (
                                    <div key={`${rIdx}-${cIdx}`} onClick={() => handleCellClick(rIdx, cIdx)} className={`flex justify-center items-center aspect-square transition-colors duration-100 cursor-pointer ${isSelected ? 'bg-blue-300' : isHighlighted ? 'bg-yellow-200' : (isInSelectedRowCol || isInSelectedBox) ? 'bg-blue-100' : 'bg-white'}`}>
                                        <div className={`text-3xl ${isGiven ? 'font-bold text-gray-800' : isError ? 'font-medium text-red-500' : 'font-medium text-blue-600'}`}>
                                            {cell !== null ? cell : (
                                                notes && notes[rIdx] && notes[rIdx][cIdx] && notes[rIdx][cIdx].size > 0 && (
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
                 {gameData.mode === 'Versus' && opponentState && (
                    <div className="mt-4 p-2 bg-gray-200 rounded-lg">
                        <h3 className="text-sm font-semibold text-center">{t.opponent}: {formatTime(opponentState.timer)} - {t.errors}: {opponentState.errors}/3</h3>
                    </div>
                 )}
            </div>

            <div className="mt-4">
                <div className="flex justify-center items-center space-x-2 mb-4">
                    <button onClick={handleHint} className="flex flex-col items-center justify-center text-center p-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex-1" disabled={hints === 0}><Lightbulb className="text-yellow-500"/><span className="text-xs font-semibold mt-1">{t.hint} ({hints})</span></button>
                    <button onClick={handleAiHint} className="flex flex-col items-center justify-center text-center p-2 rounded-lg bg-gray-200 hover:bg-gray-300 flex-1"><BrainCircuit className="text-purple-500" /><span className="text-xs font-semibold mt-1">{t.aiHint}</span></button>
                    <button onClick={handleErase} className="flex flex-col items-center justify-center text-center p-2 rounded-lg bg-gray-200 hover:bg-gray-300 flex-1"><Eraser /><span className="text-xs font-semibold mt-1">{t.erase}</span></button>
                    <button onClick={() => setIsNoteMode(!isNoteMode)} className={`flex flex-col items-center justify-center text-center p-2 rounded-lg transition-colors flex-1 ${isNoteMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5"/><polyline points="14 2 14 8 20 8"/><path d="M3 17.5a2.5 2.5 0 0 1 5 0"/><path d="M3 20h5"/></svg><span className="text-xs font-semibold mt-1">{t.notes}</span></button>
                </div>
                <div className="grid grid-cols-9 gap-1 sm:gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (<button key={num} onClick={() => handleNumberInput(num)} disabled={numberCounts[num] >= 9} className="bg-blue-100 hover:bg-blue-200 text-2xl font-bold rounded-lg p-3 aspect-square flex justify-center items-center transition-transform transform hover:scale-105 disabled:bg-gray-200 disabled:text-gray-400 disabled:pointer-events-none">{num}</button>))}
                </div>
            </div>
        </div>
    );
};

export default GameBoard;
