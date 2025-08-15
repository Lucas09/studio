"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SudokuGenerator, type Difficulty } from '@/lib/sudoku';
import SudokuBoard from '@/components/game/sudoku-board';
import Numpad from '@/components/game/numpad';
import GameHeader from '@/components/game/game-header';
import GameOverDialog from '@/components/game/game-over-dialog';
import { getAdaptiveHint } from '@/ai/flows/adaptive-hints';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Home, RotateCw, Lightbulb } from 'lucide-react';

type Grid = (number | null)[][];
type Notes = Record<string, Set<number>>;

export default function PlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const difficulty = (searchParams.get('difficulty') || 'easy') as Difficulty;

  const [puzzle, setPuzzle] = useState<Grid | null>(null);
  const [solution, setSolution] = useState<Grid | null>(null);
  const [grid, setGrid] = useState<Grid | null>(null);
  const [notes, setNotes] = useState<Notes>({});
  const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);
  const [lives, setLives] = useState(3);
  const [seconds, setSeconds] = useState(0);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [hint, setHint] = useState<{ text: string, reasoning?: string } | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [isHintDialogOpen, setIsHintDialogOpen] = useState(false);
  
  const [shakeCell, setShakeCell] = useState<{ row: number, col: number } | null>(null);


  const generateNewGame = useCallback((diff: Difficulty) => {
    const generator = new SudokuGenerator();
    const { puzzle: newPuzzle, solution: newSolution } = generator.generate(diff);
    setPuzzle(newPuzzle);
    setSolution(newSolution);
    setGrid(newPuzzle.map(row => [...row]));
    setSelectedCell(null);
    setLives(3);
    setSeconds(0);
    setIsGameOver(false);
    setIsWin(false);
    setNotes({});
  }, []);

  useEffect(() => {
    setIsClient(true);
    generateNewGame(difficulty);
  }, [difficulty, generateNewGame]);

  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver]);

  const handleCellClick = (row: number, col: number) => {
    if (puzzle && puzzle[row][col] === null) {
      setSelectedCell({ row, col });
    } else {
      setSelectedCell(null);
    }
  };
  
  const handleNumberInput = (num: number) => {
    if (!selectedCell || !grid || !solution) return;
  
    const { row, col } = selectedCell;
    if (puzzle && puzzle[row][col] !== null) return;
  
    const newGrid = grid.map(r => [...r]);
    const key = `${row}-${col}`;
  
    if (isNotesMode) {
      const newNotes = { ...notes };
      if (!newNotes[key]) newNotes[key] = new Set();
      if (newNotes[key].has(num)) {
        newNotes[key].delete(num);
      } else {
        newNotes[key].add(num);
      }
      setNotes(newNotes);
      newGrid[row][col] = null; // Clear number if placing a note
    } else {
      newGrid[row][col] = num;
      if (notes[key]) {
          const newNotes = {...notes};
          delete newNotes[key];
          setNotes(newNotes);
      }
      
      if (newGrid[row][col] !== solution[row][col]) {
        setLives(l => l - 1);
        setShakeCell({row, col});
        setTimeout(() => setShakeCell(null), 500);
        if (lives - 1 <= 0) {
          setIsGameOver(true);
          setIsWin(false);
        }
      } else {
        // Check for win condition
        let isSolved = true;
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            if (newGrid[i][j] === null || newGrid[i][j] !== solution[i][j]) {
              isSolved = false;
              break;
            }
          }
          if (!isSolved) break;
        }
        if (isSolved) {
          setIsGameOver(true);
          setIsWin(true);
        }
      }
    }
    setGrid(newGrid);
  };
  

  const handleErase = () => {
    if (!selectedCell || !grid) return;
    const { row, col } = selectedCell;
    if (puzzle && puzzle[row][col] !== null) return;

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = null;
    setGrid(newGrid);

    const newNotes = { ...notes };
    const key = `${row}-${col}`;
    if (newNotes[key]) {
      delete newNotes[key];
      setNotes(newNotes);
    }
  };

  const handleGetHint = async () => {
    if (!grid) return;
    setIsHintLoading(true);

    const puzzleString = grid.map(row => row.map(cell => cell === null ? '.' : cell).join('')).join('\n');
    const filledCells = grid.flat().filter(c => c !== null).length;
    const totalCells = 81;
    const initialEmptyCells = puzzle?.flat().filter(c => c === null).length || 45;
    const progress = (filledCells - (totalCells - initialEmptyCells)) / initialEmptyCells;
    
    try {
      const result = await getAdaptiveHint({
        puzzle: puzzleString,
        difficulty: difficulty,
        skillLevel: 5, // Placeholder skill level
        progress: Math.max(0, Math.min(1, progress)),
      });
      setHint({ text: result.hint, reasoning: result.reasoning });
    } catch (error) {
      console.error("Error getting hint:", error);
      setHint({ text: "Sorry, I couldn't generate a hint right now.", reasoning: "There was a problem with the AI service." });
    } finally {
      setIsHintLoading(false);
      setIsHintDialogOpen(true);
    }
  };

  const initialEmptyCount = useMemo(() => puzzle?.flat().filter(c => c === null).length ?? 0, [puzzle]);

  if (!isClient || !grid || !puzzle || !solution) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <GameHeader difficulty={difficulty} lives={lives} seconds={seconds} />
        
        <main className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 my-4">
          <SudokuBoard
            grid={grid}
            puzzle={puzzle}
            notes={notes}
            onCellClick={handleCellClick}
            selectedCell={selectedCell}
            solution={solution}
            isNotesMode={isNotesMode}
            shakeCell={shakeCell}
          />
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            <Numpad
              onNumberClick={handleNumberInput}
              onEraseClick={handleErase}
              onNotesClick={() => setIsNotesMode(!isNotesMode)}
              isNotesMode={isNotesMode}
            />
            <div className="grid grid-cols-2 gap-2">
               <Button variant="outline" onClick={handleGetHint} disabled={isHintLoading}>
                {isHintLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lightbulb className="w-4 h-4 mr-2" />}
                Hint
              </Button>
              <Button variant="outline" onClick={() => generateNewGame(difficulty)}>
                <RotateCw className="w-4 h-4 mr-2" />
                Restart
              </Button>
            </div>
             <Button onClick={() => router.push('/')}>
              <Home className="w-4 h-4 mr-2" />
              Main Menu
            </Button>
          </div>
        </main>
      </div>

      <GameOverDialog
        isOpen={isGameOver}
        onClose={() => setIsGameOver(false)}
        isWin={isWin}
        time={seconds}
        onNewGame={() => generateNewGame(difficulty)}
      />

      <AlertDialog open={isHintDialogOpen} onOpenChange={setIsHintDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>💡 Here's a hint for you!</AlertDialogTitle>
            <AlertDialogDescription className="text-lg py-4">{hint?.text}</AlertDialogDescription>
          </AlertDialogHeader>
          {hint?.reasoning && (
             <Card className="bg-secondary/50">
               <CardHeader className="p-4">
                <CardTitle className="text-sm">Reasoning</CardTitle>
                <CardDescription>{hint.reasoning}</CardDescription>
               </CardHeader>
             </Card>
          )}
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsHintDialogOpen(false)}>Got it!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
