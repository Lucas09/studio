"use client";

import { cn } from '@/lib/utils';

type Grid = (number | null)[][];
type Notes = Record<string, Set<number>>;

interface SudokuBoardProps {
  grid: Grid;
  puzzle: Grid;
  notes: Notes;
  onCellClick: (row: number, col:number) => void;
  selectedCell: { row: number, col: number } | null;
  solution: Grid;
  shakeCell: { row: number, col: number } | null;
}

export default function SudokuBoard({
  grid,
  puzzle,
  notes,
  onCellClick,
  selectedCell,
  solution,
  shakeCell,
}: SudokuBoardProps) {
  return (
    <div className="aspect-square w-full max-w-lg mx-auto grid grid-cols-9 grid-rows-9 gap-px bg-muted-foreground/50 border-2 border-muted-foreground/50 rounded-md overflow-hidden">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;
          const isInitial = puzzle[rowIndex][colIndex] !== null;
          const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          const isPeer = selectedCell && !isSelected && (selectedCell.row === rowIndex || selectedCell.col === colIndex || (Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) && Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3)));
          const isIncorrect = cell !== null && cell !== solution[rowIndex][colIndex];
          const isShaking = shakeCell?.row === rowIndex && shakeCell?.col === colIndex;
          const isSameValue = selectedCell && grid[selectedCell.row][selectedCell.col] !== null && cell === grid[selectedCell.row][selectedCell.col];

          return (
            <div
              key={key}
              onClick={() => onCellClick(rowIndex, colIndex)}
              className={cn(
                "relative flex items-center justify-center bg-card cursor-pointer group",
                "border-r border-b border-muted/50",
                (colIndex + 1) % 3 === 0 && colIndex !== 8 && "border-r-muted-foreground/50",
                (rowIndex + 1) % 3 === 0 && rowIndex !== 8 && "border-b-muted-foreground/50",
                isPeer && "bg-primary/10",
                isSelected && "bg-primary/30 ring-2 ring-primary z-10",
                isSameValue && "bg-primary/20",
                isShaking && "animate-shake"
              )}
            >
              {cell !== null ? (
                <span
                  className={cn(
                    'text-4xl',
                    isInitial ? 'text-foreground font-medium' : 'text-primary font-semibold',
                    isIncorrect && 'text-destructive'
                  )}
                >
                  {cell}
                </span>
              ) : (
                notes[key] && notes[key].size > 0 && (
                   <div className="grid grid-cols-3 grid-rows-3 w-full h-full text-xs text-muted-foreground p-0.5">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i+1} className="flex items-center justify-center">
                        {notes[key].has(i + 1) ? i + 1 : ''}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
