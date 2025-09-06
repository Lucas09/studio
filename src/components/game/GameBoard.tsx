'use client';

import React from 'react';
import { Cell } from '@/types/game';
import { useGameStore } from '@/lib/game-store';
import { MobileUtils } from '@/lib/mobile-utils';

interface GameBoardProps {
  className?: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ className = '' }) => {
  const { 
    currentGame, 
    selectedCell, 
    selectCell, 
    makeMove, 
    isNoteMode 
  } = useGameStore();

  if (!currentGame) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <p className="text-gray-500">No game in progress</p>
      </div>
    );
  }

  const player = currentGame.players[0];
  if (!player) return null;

  const handleCellClick = (row: number, col: number) => {
    // Can't select given cells
    if (currentGame.puzzle[row][col] !== null) return;
    
    MobileUtils.hapticFeedback('light');
    selectCell({ row, col });
  };

  const handleNumberInput = (value: number) => {
    if (!selectedCell) return;
    
    MobileUtils.hapticFeedback('light');
    makeMove(selectedCell.row, selectedCell.col, value);
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCell?.row === row && selectedCell?.col === col;
  };

  const isCellInSelectedRow = (row: number) => {
    return selectedCell?.row === row;
  };

  const isCellInSelectedCol = (col: number) => {
    return selectedCell?.col === col;
  };

  const isCellInSelectedBox = (row: number, col: number) => {
    if (!selectedCell) return false;
    
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);
    const selectedBoxRow = Math.floor(selectedCell.row / 3);
    const selectedBoxCol = Math.floor(selectedCell.col / 3);
    
    return boxRow === selectedBoxRow && boxCol === selectedBoxCol;
  };

  const isCellGiven = (row: number, col: number) => {
    return currentGame.puzzle[row][col] !== null;
  };

  const getCellValue = (row: number, col: number) => {
    return player.board[row][col];
  };

  const getCellNotes = (row: number, col: number) => {
    return player.notes[row][col];
  };

  const renderCell = (row: number, col: number) => {
    const value = getCellValue(row, col);
    const notes = getCellNotes(row, col);
    const isGiven = isCellGiven(row, col);
    const isSelected = isCellSelected(row, col);
    const isInSelectedRow = isCellInSelectedRow(row);
    const isInSelectedCol = isCellInSelectedCol(col);
    const isInSelectedBox = isCellInSelectedBox(row, col);
    
    const cellClasses = [
      'aspect-square border border-gray-300 flex items-center justify-center cursor-pointer transition-colors touch-manipulation',
      'active:bg-blue-100',
      isGiven && 'bg-gray-100 font-bold text-gray-800',
      !isGiven && 'bg-white',
      isSelected && 'bg-blue-200 border-blue-400 ring-2 ring-blue-300',
      !isSelected && isInSelectedRow && 'bg-blue-50',
      !isSelected && isInSelectedCol && 'bg-blue-50',
      !isSelected && isInSelectedBox && 'bg-blue-50',
    ].filter(Boolean).join(' ');

    return (
      <div
        key={`${row}-${col}`}
        className={cellClasses}
        onClick={() => handleCellClick(row, col)}
      >
        {value !== null ? (
          <span className={`text-lg font-medium ${isGiven ? 'text-gray-800' : 'text-blue-600'}`}>
            {value}
          </span>
        ) : notes.size > 0 ? (
          <div className="grid grid-cols-3 gap-0.5 text-xs text-gray-500">
            {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
              <div key={num} className="flex items-center justify-center h-2 w-2">
                {notes.has(num) ? num : ''}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  const renderBox = (boxRow: number, boxCol: number) => {
    const boxClasses = [
      'grid grid-cols-3 border-2 border-gray-400',
      boxRow === 2 && 'border-b-4',
      boxCol === 2 && 'border-r-4',
    ].filter(Boolean).join(' ');

    return (
      <div key={`box-${boxRow}-${boxCol}`} className={boxClasses}>
        {Array.from({ length: 9 }, (_, i) => {
          const row = boxRow * 3 + Math.floor(i / 3);
          const col = boxCol * 3 + (i % 3);
          return renderCell(row, col);
        })}
      </div>
    );
  };

  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      {/* Game Board */}
      <div className="grid grid-cols-3 gap-0.5 bg-gray-400 p-0.5 rounded-xl shadow-lg">
        {Array.from({ length: 9 }, (_, i) => {
          const boxRow = Math.floor(i / 3);
          const boxCol = i % 3;
          return renderBox(boxRow, boxCol);
        })}
      </div>
      
      {/* Number Pad */}
      <div className="mt-4 grid grid-cols-9 gap-1.5">
        {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="aspect-square bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-800 font-bold rounded-xl transition-colors touch-manipulation"
            style={{ minHeight: '44px' }} // iOS touch target size
          >
            <span className="text-lg">{num}</span>
          </button>
        ))}
      </div>
      
      {/* Note Mode Indicator */}
      {isNoteMode && (
        <div className="mt-3 text-center">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            📝 Note Mode
          </span>
        </div>
      )}
    </div>
  );
};
