import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Game, GameSettings, Difficulty, Cell, Move, GameStats } from '@/types/game';
import { SudokuGenerator } from './sudoku-generator';
import { GameEngine } from './game-engine';
import { GameStorage } from './storage';

interface GameStore {
  // State
  currentGame: Game | null;
  gameSettings: GameSettings;
  selectedCell: Cell | null;
  isNoteMode: boolean;
  gameStats: GameStats | null;
  moves: Move[];
  
  // Loading states
  isLoading: boolean;
  isGenerating: boolean;
  
  // Actions
  startSoloGame: (difficulty: Difficulty) => Promise<void>;
  makeMove: (row: number, col: number, value: number | null) => void;
  selectCell: (cell: Cell | null) => void;
  toggleNoteMode: () => void;
  addNote: (row: number, col: number, value: number) => void;
  removeNote: (row: number, col: number, value: number) => void;
  useHint: () => Cell | null;
  eraseCell: (row: number, col: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  saveGame: () => void;
  loadGame: (game: Game) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  
  // Utility actions
  clearCurrentGame: () => void;
  getGameStats: () => GameStats | null;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentGame: null,
        gameSettings: GameStorage.getDefaultSettings(),
        selectedCell: null,
        isNoteMode: false,
        gameStats: null,
        moves: [],
        isLoading: false,
        isGenerating: false,

        // Start a new solo game
        startSoloGame: async (difficulty: Difficulty) => {
          set({ isGenerating: true, isLoading: true });
          
          try {
            // Generate puzzle
            const { puzzle, solution } = SudokuGenerator.generate(difficulty);
            
            // Create new game
            const newGame: Game = {
              id: GameEngine.generateGameId(),
              mode: 'solo',
              difficulty,
              puzzle,
              solution,
              players: [{
                id: GameEngine.generatePlayerId(),
                board: puzzle.map(row => [...row]), // Copy puzzle as starting board
                notes: SudokuGenerator.createEmptyNotes(),
                errors: 0,
                hints: get().gameSettings.hints,
                timer: 0,
                isActive: true,
              }],
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            set({
              currentGame: newGame,
              selectedCell: null,
              isNoteMode: false,
              moves: [],
              gameStats: null,
              isGenerating: false,
              isLoading: false,
            });
            
            // Save to storage
            GameStorage.saveCurrentGame(newGame);
            
          } catch (error) {
            console.error('Failed to start solo game:', error);
            set({ isGenerating: false, isLoading: false });
            throw error;
          }
        },

        // Make a move
        makeMove: (row: number, col: number, value: number | null) => {
          const state = get();
          const { currentGame, isNoteMode } = state;
          
          if (!currentGame || currentGame.status !== 'active') return;
          
          const player = currentGame.players[0];
          if (!player) return;
          
          // Can't modify given cells
          if (currentGame.puzzle[row][col] !== null) return;
          
          // Handle note mode
          if (isNoteMode && value !== null) {
            get().addNote(row, col, value);
            return;
          }
          
          // Create move record
          const move: Move = {
            row,
            col,
            value,
            isNote: false,
            timestamp: new Date(),
          };
          
          // Update board
          const newBoard = player.board.map(r => [...r]);
          newBoard[row][col] = value;
          
          // Check if move is correct
          const isCorrect = value === null || 
            GameEngine.isCorrectMove(newBoard, currentGame.solution, row, col, value);
          
          // Update player state
          const updatedPlayer = {
            ...player,
            board: newBoard,
            errors: isCorrect ? player.errors : player.errors + 1,
            notes: value !== null ? 
              GameEngine.clearNotesForValue(player.notes, row, col, value) : 
              player.notes,
          };
          
          // Check win condition
          const isWon = GameEngine.checkWinCondition(newBoard, currentGame.solution);
          const isLost = updatedPlayer.errors >= get().gameSettings.maxErrors;
          
          const updatedGame: Game = {
            ...currentGame,
            players: [updatedPlayer],
            status: isWon ? 'finished' : isLost ? 'finished' : 'active',
            winner: isWon ? updatedPlayer.id : isLost ? undefined : undefined,
            updatedAt: new Date(),
          };
          
          // Update moves
          const newMoves = [...state.moves, move];
          
          // Calculate stats
          const stats = GameEngine.calculateStats(
            newMoves,
            get().gameSettings.hints - updatedPlayer.hints,
            updatedPlayer.timer
          );
          
          set({
            currentGame: updatedGame,
            moves: newMoves,
            gameStats: stats,
            selectedCell: null,
          });
          
          // Save to storage
          GameStorage.saveCurrentGame(updatedGame);
        },

        // Select a cell
        selectCell: (cell: Cell | null) => {
          set({ selectedCell: cell });
        },

        // Toggle note mode
        toggleNoteMode: () => {
          set(state => ({ isNoteMode: !state.isNoteMode }));
        },

        // Add a note
        addNote: (row: number, col: number, value: number) => {
          const state = get();
          const { currentGame } = state;
          
          if (!currentGame || currentGame.status !== 'active') return;
          
          const player = currentGame.players[0];
          if (!player) return;
          
          // Can't add notes to given cells
          if (currentGame.puzzle[row][col] !== null) return;
          
          const updatedNotes = GameEngine.toggleNote(player.notes, row, col, value);
          
          const updatedPlayer = {
            ...player,
            notes: updatedNotes,
          };
          
          const updatedGame: Game = {
            ...currentGame,
            players: [updatedPlayer],
            updatedAt: new Date(),
          };
          
          set({ currentGame: updatedGame });
          GameStorage.saveCurrentGame(updatedGame);
        },

        // Remove a note
        removeNote: (row: number, col: number, value: number) => {
          get().addNote(row, col, value); // Toggle removes if exists
        },

        // Use a hint
        useHint: () => {
          const state = get();
          const { currentGame } = state;
          
          if (!currentGame || currentGame.status !== 'active') return null;
          
          const player = currentGame.players[0];
          if (!player || player.hints <= 0) return null;
          
          const hintCell = GameEngine.generateHint(player.board, currentGame.solution);
          if (!hintCell) return null;
          
          const correctValue = GameEngine.getCorrectValue(
            currentGame.solution,
            hintCell.row,
            hintCell.col
          );
          
          // Apply the hint
          get().makeMove(hintCell.row, hintCell.col, correctValue);
          
          // Decrease hints
          const updatedPlayer = {
            ...player,
            hints: player.hints - 1,
          };
          
          const updatedGame: Game = {
            ...currentGame,
            players: [updatedPlayer],
            updatedAt: new Date(),
          };
          
          set({ currentGame: updatedGame });
          GameStorage.saveCurrentGame(updatedGame);
          
          return hintCell;
        },

        // Erase a cell
        eraseCell: (row: number, col: number) => {
          get().makeMove(row, col, null);
        },

        // Pause game
        pauseGame: () => {
          const state = get();
          const { currentGame } = state;
          
          if (!currentGame || currentGame.status !== 'active') return;
          
          const updatedGame: Game = {
            ...currentGame,
            status: 'paused',
            updatedAt: new Date(),
          };
          
          set({ currentGame: updatedGame });
          GameStorage.saveCurrentGame(updatedGame);
        },

        // Resume game
        resumeGame: () => {
          const state = get();
          const { currentGame } = state;
          
          if (!currentGame || currentGame.status !== 'paused') return;
          
          const updatedGame: Game = {
            ...currentGame,
            status: 'active',
            updatedAt: new Date(),
          };
          
          set({ currentGame: updatedGame });
          GameStorage.saveCurrentGame(updatedGame);
        },

        // Reset game
        resetGame: () => {
          const state = get();
          const { currentGame } = state;
          
          if (!currentGame) return;
          
          const updatedGame: Game = {
            ...currentGame,
            players: currentGame.players.map(player => ({
              ...player,
              board: currentGame.puzzle.map(row => [...row]),
              notes: SudokuGenerator.createEmptyNotes(),
              errors: 0,
              hints: get().gameSettings.hints,
              timer: 0,
            })),
            status: 'active',
            winner: undefined,
            updatedAt: new Date(),
          };
          
          set({
            currentGame: updatedGame,
            selectedCell: null,
            isNoteMode: false,
            moves: [],
            gameStats: null,
          });
          
          GameStorage.saveCurrentGame(updatedGame);
        },

        // Save game
        saveGame: () => {
          const state = get();
          const { currentGame } = state;
          
          if (!currentGame) return;
          
          GameStorage.saveGame(currentGame);
        },

        // Load game
        loadGame: (game: Game) => {
          set({
            currentGame: game,
            selectedCell: null,
            isNoteMode: false,
            moves: [], // Reset moves for loaded game
            gameStats: null,
          });
          
          GameStorage.saveCurrentGame(game);
        },

        // Update settings
        updateSettings: (settings: Partial<GameSettings>) => {
          const newSettings = { ...get().gameSettings, ...settings };
          set({ gameSettings: newSettings });
          GameStorage.saveGameSettings(newSettings);
        },

        // Clear current game
        clearCurrentGame: () => {
          set({
            currentGame: null,
            selectedCell: null,
            isNoteMode: false,
            moves: [],
            gameStats: null,
          });
          
          GameStorage.clearCurrentGame();
        },

        // Get game stats
        getGameStats: () => {
          return get().gameStats;
        },
      }),
      {
        name: 'sudoku-game-store',
        partialize: (state) => ({
          gameSettings: state.gameSettings,
        }),
      }
    ),
    {
      name: 'sudoku-game-store',
    }
  )
);
