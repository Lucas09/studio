'use client';

import React, { useState } from 'react';
import { Difficulty } from '@/types/game';
import { GameStorage } from '@/lib/storage';

interface SoloLobbyProps {
  onStartGame: (difficulty: Difficulty) => void;
  onResumeGame: () => void;
  className?: string;
}

const difficulties: { value: Difficulty; label: string; description: string; color: string }[] = [
  { 
    value: 'Easy', 
    label: 'Easy', 
    description: '35-40 empty cells', 
    color: 'bg-green-500 hover:bg-green-600' 
  },
  { 
    value: 'Medium', 
    label: 'Medium', 
    description: '45-50 empty cells', 
    color: 'bg-yellow-500 hover:bg-yellow-600' 
  },
  { 
    value: 'Hard', 
    label: 'Hard', 
    description: '50-55 empty cells', 
    color: 'bg-orange-500 hover:bg-orange-600' 
  },
  { 
    value: 'Very Hard', 
    label: 'Very Hard', 
    description: '55-60 empty cells', 
    color: 'bg-red-500 hover:bg-red-600' 
  },
  { 
    value: 'Impossible', 
    label: 'Impossible', 
    description: '60+ empty cells', 
    color: 'bg-purple-500 hover:bg-purple-600' 
  },
];

export const SoloLobby: React.FC<SoloLobbyProps> = ({ 
  onStartGame, 
  onResumeGame, 
  className = '' 
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Medium');
  const hasCurrentGame = GameStorage.hasCurrentGame();

  return (
    <div className={`max-w-sm mx-auto px-4 ${className}`}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Solo Sudoku</h1>
        <p className="text-sm text-gray-600">Play at your own pace</p>
      </div>

      {/* Resume Game */}
      {hasCurrentGame && (
        <div className="mb-6">
          <button
            onClick={onResumeGame}
            className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2 touch-manipulation"
            style={{ minHeight: '48px' }}
          >
            <span className="text-lg">▶️</span>
            <span>Resume Game</span>
          </button>
        </div>
      )}

      {/* Difficulty Selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 text-center">Choose Difficulty</h2>
        
        <div className="space-y-2">
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              onClick={() => setSelectedDifficulty(diff.value)}
              className={`
                w-full p-3 rounded-xl text-white font-medium transition-all duration-200 touch-manipulation
                ${selectedDifficulty === diff.value 
                  ? `${diff.color} ring-2 ring-offset-2 ring-white shadow-lg` 
                  : `${diff.color} opacity-80 hover:opacity-100 active:opacity-90`
                }
              `}
              style={{ minHeight: '48px' }}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="font-bold text-base">{diff.label}</div>
                  <div className="text-xs opacity-90">{diff.description}</div>
                </div>
                {selectedDifficulty === diff.value && (
                  <span className="text-lg">✅</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Start Game Button */}
        <button
          onClick={() => onStartGame(selectedDifficulty)}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-colors mt-4 touch-manipulation"
          style={{ minHeight: '48px' }}
        >
          Start New Game
        </button>
      </div>

      {/* Game Features */}
      <div className="mt-6 p-3 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-800 mb-2 text-sm">Game Features</h3>
        <ul className="space-y-1 text-xs text-gray-600">
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✅</span>
            <span>Auto-save progress</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✅</span>
            <span>3 hints per game</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✅</span>
            <span>Note-taking mode</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✅</span>
            <span>Timer and error tracking</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
