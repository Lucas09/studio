"use client";

import { cn } from '@/lib/utils';

type Grid = (number | null)[][];
type Notes = Record<string, Set<number>>;

interface SudokuBoardProps {
  grid: Grid;
  puzzle: Grid;
  notes: Notes;
  onCellClick: (row: number, col: number) => void;
  selectedCell: { row: number; col: number } | null;
  solution: Grid;
  isNotesMode: boolean;
  shakeCell: { row: number, col: number } | null;
}

export default function SudokuBoard({
  grid,
  puzzle,
  notes,
  onCellClick,
  selectedCell,
  solution,
  isNotesMode,
  shakeCell
}: SudokuBoardProps) {

  const isRelated = (row: number, col: number) => {
    if (!selectedCell) return false;
    const { row: selRow, col: selCol } = selectedCell;
    const boxRowStart = Math.floor(selRow / 3) * 3;
    const boxColStart = Math.floor(selCol / 3) * 3;
    return (
      row === selRow ||
      col === selCol ||
      (row >= boxRowStart && row < boxRowStart + 3 && col >= boxColStart && col < boxColStart + 3)
    );
  };
  
  const hasSameValue = (value: number | null) => {
    if (!selectedCell || !value) return false;
    const selValue = grid[selectedCell.row][selectedCell.col];
    return selValue === value;
  }

  return (
    <div className="aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-xl bg-card border">
      <div className="sudoku-grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="sudoku-row">
            {row.map((cell, colIndex) => {
              const isInitial = puzzle[rowIndex][colIndex] !== null;
              const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
              const isWrong = cell !== null && cell !== solution[rowIndex][colIndex];
              const isShaking = shakeCell?.row === rowIndex && shakeCell?.col === colIndex;

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  className={cn(
                    'sudoku-cell flex items-center justify-center aspect-square cursor-pointer text-2xl md:text-3xl font-medium transition-colors duration-200',
                    isRelated(rowIndex, colIndex) && 'bg-primary/5 dark:bg-primary/10',
                    hasSameValue(cell) && 'bg-primary/10 dark:bg-primary/20',
                    isSelected ? 'bg-primary/20 dark:bg-primary/30 ring-2 ring-primary z-10' : '',
                    isInitial ? 'text-foreground font-bold' : 'text-primary',
                    isWrong && !isNotesMode && 'text-destructive bg-destructive/10',
                    isShaking && 'animate-shake'
                  )}
                >
                  {cell !== null ? (
                    cell
                  ) : notes[`${rowIndex}-${colIndex}`] ? (
                    <div className="grid grid-cols-3 grid-rows-3 w-full h-full text-xs p-0.5">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-center">
                          {notes[`${rowIndex}-${colIndex}`].has(i + 1) ? i + 1 : ''}
                        </div>
                      ))}
                    </div>
                  ) : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
