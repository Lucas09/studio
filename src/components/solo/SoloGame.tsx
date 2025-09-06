'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/lib/game-store';
import { GameBoard } from '@/components/game/GameBoard';
import { GameHeader } from '@/components/game/GameHeader';
import { GameControls } from '@/components/game/GameControls';
import { GameStorage } from '@/lib/storage';

interface SoloGameProps {
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Impossible';
  onBack: () => void;
  className?: string;
}

export const SoloGame: React.FC<SoloGameProps> = ({ 
  difficulty, 
  onBack, 
  className = '' 
}) => {
  const { 
    currentGame, 
    startSoloGame, 
    isLoading, 
    isGenerating,
    loadGame 
  } = useGameStore();

  // Check for existing game on mount
  useEffect(() => {
    const existingGame = GameStorage.loadCurrentGame();
    if (existingGame && existingGame.mode === 'solo' && existingGame.status === 'active') {
      loadGame(existingGame);
    } else {
      startSoloGame(difficulty);
    }
  }, [difficulty, startSoloGame, loadGame]);

  if (isGenerating || isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Generating puzzle...</p>
      </div>
    );
  }

  if (!currentGame) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Failed to start game</h2>
          <button
            onClick={() => startSoloGame(difficulty)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <GameHeader />
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center mb-6">
        <GameBoard />
      </div>

      {/* Controls */}
      <div className="flex-shrink-0">
        <GameControls />
      </div>

      {/* Back Button */}
      <div className="flex-shrink-0 mt-6 text-center">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );
};
