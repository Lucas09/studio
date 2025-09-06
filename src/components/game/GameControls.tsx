'use client';

import React from 'react';
import { 
  Lightbulb, 
  Eraser, 
  Pencil, 
  Pause, 
  Play, 
  RotateCcw, 
  Save,
  Settings
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { MobileUtils } from '@/lib/mobile-utils';

interface GameControlsProps {
  className?: string;
}

export const GameControls: React.FC<GameControlsProps> = ({ className = '' }) => {
  const {
    currentGame,
    isNoteMode,
    toggleNoteMode,
    useHint,
    eraseCell,
    pauseGame,
    resumeGame,
    resetGame,
    saveGame,
    selectedCell,
  } = useGameStore();

  if (!currentGame) return null;

  const player = currentGame.players[0];
  if (!player) return null;

  const handleHint = () => {
    MobileUtils.hapticFeedback('medium');
    const hintCell = useHint();
    if (hintCell) {
      // Could show a toast or animation here
      console.log(`Hint: Cell (${hintCell.row}, ${hintCell.col})`);
    }
  };

  const handleErase = () => {
    MobileUtils.hapticFeedback('light');
    if (selectedCell) {
      eraseCell(selectedCell.row, selectedCell.col);
    }
  };

  const handlePauseResume = () => {
    MobileUtils.hapticFeedback('light');
    if (currentGame.status === 'active') {
      pauseGame();
    } else if (currentGame.status === 'paused') {
      resumeGame();
    }
  };

  const handleReset = () => {
    MobileUtils.hapticFeedback('heavy');
    if (confirm('Are you sure you want to reset the game? This will lose all progress.')) {
      resetGame();
    }
  };

  const handleSave = () => {
    MobileUtils.hapticFeedback('light');
    saveGame();
    // Could show a toast here
    console.log('Game saved!');
  };

  const isGameActive = currentGame.status === 'active';
  const isGamePaused = currentGame.status === 'paused';
  const isGameFinished = currentGame.status === 'finished';
  const hasHints = player.hints > 0;
  const hasSelectedCell = selectedCell !== null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Primary Controls */}
      <div className="grid grid-cols-2 gap-2">
        {/* Hint Button */}
        <button
          onClick={handleHint}
          disabled={!isGameActive || !hasHints}
          className={`
            flex items-center justify-center space-x-2 px-3 py-3 rounded-xl font-medium transition-colors touch-manipulation
            ${hasHints && isGameActive
              ? 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
          style={{ minHeight: '44px' }}
        >
          <Lightbulb className="w-4 h-4" />
          <span className="text-sm">💡 ({player.hints})</span>
        </button>

        {/* Erase Button */}
        <button
          onClick={handleErase}
          disabled={!isGameActive || !hasSelectedCell}
          className={`
            flex items-center justify-center space-x-2 px-3 py-3 rounded-xl font-medium transition-colors touch-manipulation
            ${hasSelectedCell && isGameActive
              ? 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
          style={{ minHeight: '44px' }}
        >
          <Eraser className="w-4 h-4" />
          <span className="text-sm">🗑️</span>
        </button>
      </div>

      {/* Secondary Controls */}
      <div className="grid grid-cols-2 gap-2">
        {/* Note Mode Toggle */}
        <button
          onClick={toggleNoteMode}
          disabled={!isGameActive}
          className={`
            flex items-center justify-center space-x-2 px-3 py-3 rounded-xl font-medium transition-colors touch-manipulation
            ${isNoteMode
              ? 'bg-blue-600 text-white'
              : isGameActive
              ? 'bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
          style={{ minHeight: '44px' }}
        >
          <Pencil className="w-4 h-4" />
          <span className="text-sm">📝</span>
        </button>

        {/* Pause/Resume Button */}
        <button
          onClick={handlePauseResume}
          disabled={isGameFinished}
          className={`
            flex items-center justify-center space-x-2 px-3 py-3 rounded-xl font-medium transition-colors touch-manipulation
            ${isGamePaused
              ? 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white'
              : isGameActive
              ? 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
          style={{ minHeight: '44px' }}
        >
          {isGamePaused ? (
            <>
              <Play className="w-4 h-4" />
              <span className="text-sm">▶️</span>
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              <span className="text-sm">⏸️</span>
            </>
          )}
        </button>
      </div>

      {/* Game Management Controls */}
      <div className="grid grid-cols-2 gap-2">
        {/* Reset Button */}
        <button
          onClick={handleReset}
          disabled={!currentGame}
          className="
            flex items-center justify-center space-x-2 px-3 py-3 rounded-xl font-medium transition-colors touch-manipulation
            bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
          "
          style={{ minHeight: '44px' }}
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">🔄</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!currentGame}
          className="
            flex items-center justify-center space-x-2 px-3 py-3 rounded-xl font-medium transition-colors touch-manipulation
            bg-green-500 hover:bg-green-600 active:bg-green-700 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
          "
          style={{ minHeight: '44px' }}
        >
          <Save className="w-4 h-4" />
          <span className="text-sm">💾</span>
        </button>
      </div>

      {/* Game Status Messages */}
      {isGameFinished && (
        <div className="text-center">
          {currentGame.winner ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              <h3 className="font-bold text-lg">Congratulations!</h3>
              <p>You solved the puzzle!</p>
            </div>
          ) : (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <h3 className="font-bold text-lg">Game Over</h3>
              <p>Too many errors. Try again!</p>
            </div>
          )}
        </div>
      )}

      {isGamePaused && (
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
            <h3 className="font-bold text-lg">Game Paused</h3>
            <p>Click Resume to continue playing</p>
          </div>
        </div>
      )}
    </div>
  );
};
