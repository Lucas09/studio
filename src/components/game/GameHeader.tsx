'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { GameEngine } from '@/lib/game-engine';

interface GameHeaderProps {
  className?: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ className = '' }) => {
  const { currentGame, gameSettings } = useGameStore();
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!currentGame || currentGame.status !== 'active') return;

    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentGame?.status]);

  if (!currentGame) {
    return (
      <div className={`text-center ${className}`}>
        <h1 className="text-2xl font-bold text-gray-800">Sudoku</h1>
      </div>
    );
  }

  const player = currentGame.players[0];
  if (!player) return null;

  const formatTime = (seconds: number) => {
    return GameEngine.formatTime(seconds);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Hard': return 'text-orange-600';
      case 'Very Hard': return 'text-red-600';
      case 'Impossible': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (currentGame.status) {
      case 'active': return 'Playing';
      case 'paused': return 'Paused';
      case 'finished': return currentGame.winner ? 'Completed!' : 'Game Over';
      default: return 'Waiting';
    }
  };

  const getStatusColor = () => {
    switch (currentGame.status) {
      case 'active': return 'text-green-600';
      case 'paused': return 'text-yellow-600';
      case 'finished': return currentGame.winner ? 'text-green-600' : 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Game Title and Status */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Sudoku</h1>
        <div className="flex items-center justify-center space-x-3 mt-1">
          <span className={`text-base font-semibold ${getDifficultyColor(currentGame.difficulty)}`}>
            {currentGame.difficulty}
          </span>
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {/* Timer */}
        <div className="bg-gray-100 rounded-lg p-2">
          <div className="text-xs text-gray-600 mb-1">⏱️ Time</div>
          <div className="text-sm font-mono font-bold text-gray-800">
            {formatTime(timer)}
          </div>
        </div>

        {/* Errors */}
        <div className="bg-gray-100 rounded-lg p-2">
          <div className="text-xs text-gray-600 mb-1">❌ Errors</div>
          <div className={`text-sm font-bold ${
            player.errors >= gameSettings.maxErrors ? 'text-red-600' : 'text-gray-800'
          }`}>
            {player.errors}/{gameSettings.maxErrors}
          </div>
        </div>

        {/* Hints */}
        <div className="bg-gray-100 rounded-lg p-2">
          <div className="text-xs text-gray-600 mb-1">💡 Hints</div>
          <div className="text-sm font-bold text-gray-800">
            {player.hints}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
          style={{ 
            width: `${((81 - countEmptyCells(player.board)) / 81) * 100}%` 
          }}
        />
      </div>
      
      <div className="text-center text-xs text-gray-600">
        {81 - countEmptyCells(player.board)} / 81 cells filled
      </div>
    </div>
  );
};

// Helper function to count empty cells
const countEmptyCells = (board: (number | null)[][]): number => {
  let count = 0;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        count++;
      }
    }
  }
  return count;
};
