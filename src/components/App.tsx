'use client';

import React, { useState, useEffect } from 'react';
import { SoloLobby } from '@/components/solo/SoloLobby';
import { SoloGame } from '@/components/solo/SoloGame';
import { Difficulty } from '@/types/game';
import { MobileUtils } from '@/lib/mobile-utils';

type AppView = 'menu' | 'solo-lobby' | 'solo-game' | 'coop-lobby' | 'versus-lobby';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('menu');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Medium');

  // Initialize mobile optimizations
  useEffect(() => {
    MobileUtils.optimizeForMobile();
    MobileUtils.preventPullToRefresh();
  }, []);

  const handleStartSolo = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setCurrentView('solo-game');
  };

  const handleResumeSolo = () => {
    setCurrentView('solo-game');
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
  };

  const handleBackToLobby = () => {
    setCurrentView('solo-lobby');
  };

  const renderView = () => {
    switch (currentView) {
      case 'menu':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-sm w-full">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-1">Sudoku</h1>
                <p className="text-sm text-gray-600">Choose your game mode</p>
              </div>

              <div className="space-y-3">
                {/* Solo Mode */}
                <button
                  onClick={() => setCurrentView('solo-lobby')}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-3 touch-manipulation"
                  style={{ minHeight: '56px' }}
                >
                  <span className="text-xl">🧩</span>
                  <span>Solo Play</span>
                </button>

                {/* Co-op Mode */}
                <button
                  onClick={() => setCurrentView('coop-lobby')}
                  className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-3 touch-manipulation"
                  style={{ minHeight: '56px' }}
                >
                  <span className="text-xl">👥</span>
                  <span>Co-op Mode</span>
                </button>

                {/* Versus Mode */}
                <button
                  onClick={() => setCurrentView('versus-lobby')}
                  className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-3 touch-manipulation"
                  style={{ minHeight: '56px' }}
                >
                  <span className="text-xl">⚔️</span>
                  <span>Versus Mode</span>
                </button>
              </div>

              {/* Coming Soon Badges */}
              <div className="mt-4 space-y-2">
                <div className="text-center">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    🚧 Co-op & Versus coming soon!
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'solo-lobby':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <SoloLobby
              onStartGame={handleStartSolo}
              onResumeGame={handleResumeSolo}
            />
          </div>
        );

      case 'solo-game':
        return (
          <div className="min-h-screen bg-gray-50 p-3">
            <SoloGame
              difficulty={selectedDifficulty}
              onBack={handleBackToLobby}
            />
          </div>
        );

      case 'coop-lobby':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Co-op Mode</h1>
              <p className="text-gray-600 mb-6">Coming soon!</p>
              <button
                onClick={handleBackToMenu}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        );

      case 'versus-lobby':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Versus Mode</h1>
              <p className="text-gray-600 mb-6">Coming soon!</p>
              <button
                onClick={handleBackToMenu}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderView()}
    </div>
  );
};
