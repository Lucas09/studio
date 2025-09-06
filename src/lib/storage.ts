import { Game, GameSettings } from '@/types/game';

const STORAGE_KEYS = {
  CURRENT_GAME: 'sudoku_current_game',
  GAME_SETTINGS: 'sudoku_game_settings',
  GAME_STATS: 'sudoku_game_stats',
  SAVED_GAMES: 'sudoku_saved_games',
} as const;

export class GameStorage {
  /**
   * Save current game to localStorage
   */
  static saveCurrentGame(game: Game): void {
    try {
      const gameData = {
        ...game,
        createdAt: game.createdAt.toISOString(),
        updatedAt: game.updatedAt.toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(gameData));
    } catch (error) {
      console.error('Failed to save current game:', error);
    }
  }

  /**
   * Load current game from localStorage
   */
  static loadCurrentGame(): Game | null {
    try {
      const gameData = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
      if (!gameData) return null;

      const parsed = JSON.parse(gameData);
      
      // Reconstruct the game with proper Set objects for notes
      const reconstructedGame: Game = {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
        players: parsed.players.map((player: any) => ({
          ...player,
          notes: this.reconstructNotes(player.notes),
        })),
      };
      
      return reconstructedGame;
    } catch (error) {
      console.error('Failed to load current game:', error);
      return null;
    }
  }

  /**
   * Reconstruct notes from JSON data
   */
  private static reconstructNotes(notesData: any): Set<number>[][] {
    if (!notesData || !Array.isArray(notesData)) {
      // Return empty notes if data is invalid
      return Array(9).fill(null).map(() => 
        Array(9).fill(null).map(() => new Set<number>())
      );
    }

    return notesData.map((row: any) => 
      row.map((cell: any) => {
        if (Array.isArray(cell)) {
          return new Set(cell);
        } else if (cell && typeof cell === 'object' && cell.constructor === Object) {
          // Handle case where Set was serialized as object
          return new Set(Object.keys(cell).map(Number));
        } else {
          return new Set<number>();
        }
      })
    );
  }

  /**
   * Clear current game from localStorage
   */
  static clearCurrentGame(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
  }

  /**
   * Save game settings
   */
  static saveGameSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GAME_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save game settings:', error);
    }
  }

  /**
   * Load game settings
   */
  static loadGameSettings(): GameSettings {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.GAME_SETTINGS);
      if (!settings) {
        return this.getDefaultSettings();
      }
      return JSON.parse(settings);
    } catch (error) {
      console.error('Failed to load game settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default game settings
   */
  static getDefaultSettings(): GameSettings {
    return {
      difficulty: 'Medium',
      hints: 3,
      maxErrors: 3,
      timer: true,
    };
  }

  /**
   * Save a game to the saved games list
   */
  static saveGame(game: Game): void {
    try {
      const savedGames = this.getSavedGames();
      const gameData = {
        ...game,
        createdAt: game.createdAt.toISOString(),
        updatedAt: game.updatedAt.toISOString(),
      };
      
      // Remove existing game with same ID if it exists
      const filteredGames = savedGames.filter(g => g.id !== game.id);
      filteredGames.push(gameData);
      
      // Keep only the last 10 saved games
      const recentGames = filteredGames.slice(-10);
      
      localStorage.setItem(STORAGE_KEYS.SAVED_GAMES, JSON.stringify(recentGames));
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  /**
   * Get all saved games
   */
  static getSavedGames(): Game[] {
    try {
      const savedGames = localStorage.getItem(STORAGE_KEYS.SAVED_GAMES);
      if (!savedGames) return [];

      const parsed = JSON.parse(savedGames);
      return parsed.map((game: any) => ({
        ...game,
        createdAt: new Date(game.createdAt),
        updatedAt: new Date(game.updatedAt),
        players: game.players.map((player: any) => ({
          ...player,
          notes: this.reconstructNotes(player.notes),
        })),
      }));
    } catch (error) {
      console.error('Failed to load saved games:', error);
      return [];
    }
  }

  /**
   * Delete a saved game
   */
  static deleteSavedGame(gameId: string): void {
    try {
      const savedGames = this.getSavedGames();
      const filteredGames = savedGames.filter(g => g.id !== gameId);
      localStorage.setItem(STORAGE_KEYS.SAVED_GAMES, JSON.stringify(filteredGames));
    } catch (error) {
      console.error('Failed to delete saved game:', error);
    }
  }

  /**
   * Clear all saved games
   */
  static clearSavedGames(): void {
    localStorage.removeItem(STORAGE_KEYS.SAVED_GAMES);
  }

  /**
   * Check if there's a current game in progress
   */
  static hasCurrentGame(): boolean {
    const game = this.loadCurrentGame();
    return game !== null && game.status === 'active';
  }

  /**
   * Check if there are any saved games
   */
  static hasSavedGames(): boolean {
    return this.getSavedGames().length > 0;
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): {
    currentGame: boolean;
    savedGamesCount: number;
    totalSize: number;
  } {
    const currentGame = this.hasCurrentGame();
    const savedGames = this.getSavedGames();
    
    let totalSize = 0;
    try {
      for (const key in localStorage) {
        if (key.startsWith('sudoku_')) {
          totalSize += localStorage[key].length;
        }
      }
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
    }

    return {
      currentGame,
      savedGamesCount: savedGames.length,
      totalSize,
    };
  }

  /**
   * Clear all game data
   */
  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Export game data for backup
   */
  static exportGameData(): string {
    try {
      const data = {
        currentGame: this.loadCurrentGame(),
        savedGames: this.getSavedGames(),
        settings: this.loadGameSettings(),
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export game data:', error);
      throw new Error('Failed to export game data');
    }
  }

  /**
   * Import game data from backup
   */
  static importGameData(data: string): void {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.currentGame) {
        // Reconstruct the game with proper Set objects
        const reconstructedGame: Game = {
          ...parsed.currentGame,
          createdAt: new Date(parsed.currentGame.createdAt),
          updatedAt: new Date(parsed.currentGame.updatedAt),
          players: parsed.currentGame.players.map((player: any) => ({
            ...player,
            notes: this.reconstructNotes(player.notes),
          })),
        };
        this.saveCurrentGame(reconstructedGame);
      }
      
      if (parsed.savedGames && Array.isArray(parsed.savedGames)) {
        // Reconstruct all saved games with proper Set objects
        const reconstructedGames = parsed.savedGames.map((game: any) => ({
          ...game,
          createdAt: new Date(game.createdAt),
          updatedAt: new Date(game.updatedAt),
          players: game.players.map((player: any) => ({
            ...player,
            notes: this.reconstructNotes(player.notes),
          })),
        }));
        localStorage.setItem(STORAGE_KEYS.SAVED_GAMES, JSON.stringify(reconstructedGames));
      }
      
      if (parsed.settings) {
        this.saveGameSettings(parsed.settings);
      }
    } catch (error) {
      console.error('Failed to import game data:', error);
      throw new Error('Invalid game data format');
    }
  }
}
