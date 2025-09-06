import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { redisService } from '../services/redis';
import { sudokuGenerator } from '../services/sudoku';
import { db } from '../database/connection';
import { GameState, CreateGameRequest, JoinGameRequest, MakeMoveRequest } from '../types';
import { 
  validateGameId, 
  validatePlayerId, 
  validateMove, 
  gameActionRateLimit,
  redisRateLimit 
} from '../middleware/security';

const router = Router();

// Create a new game
router.post('/create', [
  body('difficulty').isIn(['Easy', 'Medium', 'Hard', 'Very Hard', 'Impossible']),
  body('mode').isIn(['Solo', 'Co-op', 'Versus']),
  validatePlayerId,
  gameActionRateLimit,
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid request data',
        details: errors.array(),
      });
    }

    const { difficulty, mode }: CreateGameRequest = req.body;
    const playerId = req.body.playerId;
    const gameId = uuidv4();

    // Generate puzzle
    const { puzzle, solution } = sudokuGenerator.generate(difficulty);

    // Create initial game state
    const gameState: GameState = {
      gameId,
      puzzle,
      solution,
      difficulty,
      mode,
      status: 'waiting',
      players: {
        [playerId]: {
          id: playerId,
          board: puzzle,
          notes: JSON.stringify(sudokuGenerator.createEmptyNotes().map(row => 
            row.map(cell => Array.from(cell))
          )),
          errors: 0,
          timer: 0,
          hints: 3,
          errorCells: [],
        },
      },
      winner: null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    // Save to Redis
    await redisService.setGameState(gameId, gameState);
    await redisService.addActiveGame(gameId, {
      difficulty,
      mode,
      playerCount: 1,
      createdAt: new Date(),
    });
    await redisService.setPlayerSession(playerId, gameId);

    res.status(201).json({
      success: true,
      data: {
        gameId,
        difficulty,
        mode,
        status: 'waiting',
        playerCount: 1,
        maxPlayers: mode === 'Solo' ? 1 : 2,
      },
      message: 'Game created successfully',
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create game',
      message: 'An error occurred while creating the game',
    });
  }
});

// Join an existing game
router.post('/join', [
  body('gameId').isString().isLength({ min: 10, max: 50 }),
  validatePlayerId,
  gameActionRateLimit,
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid request data',
        details: errors.array(),
      });
    }

    const { gameId }: JoinGameRequest = req.body;
    const playerId = req.body.playerId;

    // Get game state
    const gameState = await redisService.getGameState(gameId);
    if (!gameState) {
      return res.status(404).json({
        success: false,
        error: 'Game not found',
        message: 'The requested game does not exist or has expired',
      });
    }

    // Check if game is full
    const playerCount = Object.keys(gameState.players).length;
    const maxPlayers = gameState.mode === 'Solo' ? 1 : 2;
    
    if (playerCount >= maxPlayers) {
      return res.status(400).json({
        success: false,
        error: 'Game is full',
        message: 'This game already has the maximum number of players',
      });
    }

    // Check if player is already in the game
    if (gameState.players[playerId]) {
      return res.status(400).json({
        success: false,
        error: 'Already in game',
        message: 'You are already part of this game',
      });
    }

    // Add player to game
    gameState.players[playerId] = {
      id: playerId,
      board: gameState.puzzle,
      notes: JSON.stringify(sudokuGenerator.createEmptyNotes().map(row => 
        row.map(cell => Array.from(cell))
      )),
      errors: 0,
      timer: 0,
      hints: 3,
      errorCells: [],
    };

    // Update player count
    const newPlayerCount = Object.keys(gameState.players).length;
    
    // Update game state
    await redisService.setGameState(gameId, gameState);
    await redisService.addActiveGame(gameId, {
      difficulty: gameState.difficulty,
      mode: gameState.mode,
      playerCount: newPlayerCount,
      createdAt: gameState.createdAt,
    });
    await redisService.setPlayerSession(playerId, gameId);

    res.json({
      success: true,
      data: {
        gameId,
        difficulty: gameState.difficulty,
        mode: gameState.mode,
        status: gameState.status,
        playerCount: newPlayerCount,
        maxPlayers,
      },
      message: 'Successfully joined game',
    });
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join game',
      message: 'An error occurred while joining the game',
    });
  }
});

// Get game state
router.get('/:gameId', [
  param('gameId').isString().isLength({ min: 10, max: 50 }),
  validateGameId,
], async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const playerId = req.query.playerId as string;

    if (!playerId) {
      return res.status(400).json({
        success: false,
        error: 'Player ID required',
        message: 'Player ID is required to get game state',
      });
    }

    const gameState = await redisService.getGameState(gameId);
    if (!gameState) {
      return res.status(404).json({
        success: false,
        error: 'Game not found',
        message: 'The requested game does not exist or has expired',
      });
    }

    // Check if player is in the game
    if (!gameState.players[playerId]) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You are not part of this game',
      });
    }

    // Return game state (without solution for security)
    const { solution, ...gameData } = gameState;
    res.json({
      success: true,
      data: gameData,
    });
  } catch (error) {
    console.error('Error getting game state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game state',
      message: 'An error occurred while retrieving the game state',
    });
  }
});

// Make a move
router.post('/:gameId/move', [
  param('gameId').isString().isLength({ min: 10, max: 50 }),
  body('row').isInt({ min: 0, max: 8 }),
  body('col').isInt({ min: 0, max: 8 }),
  body('value').custom((value) => {
    if (value !== null && (typeof value !== 'number' || value < 1 || value > 9)) {
      throw new Error('Value must be null or a number between 1 and 9');
    }
    return true;
  }),
  body('isNote').optional().isBoolean(),
  validateGameId,
  validatePlayerId,
  validateMove,
  gameActionRateLimit,
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid move data',
        details: errors.array(),
      });
    }

    const { gameId } = req.params;
    const { row, col, value, isNote = false }: MakeMoveRequest = req.body;
    const playerId = req.body.playerId;

    // Get game state
    const gameState = await redisService.getGameState(gameId);
    if (!gameState) {
      return res.status(404).json({
        success: false,
        error: 'Game not found',
        message: 'The requested game does not exist or has expired',
      });
    }

    // Check if player is in the game
    const player = gameState.players[playerId];
    if (!player) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You are not part of this game',
      });
    }

    // Check if game is active
    if (gameState.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Game not active',
        message: 'The game is not currently active',
      });
    }

    // Convert board string to array for manipulation
    const board = sudokuGenerator.stringToBoard(player.board);
    const notes = sudokuGenerator.stringToNotes(player.notes);

    // Check if the cell is a given cell
    const puzzleBoard = sudokuGenerator.stringToBoard(gameState.puzzle);
    if (puzzleBoard[row][col] !== null) {
      return res.status(400).json({
        success: false,
        error: 'Invalid move',
        message: 'Cannot modify a given cell',
      });
    }

    let newErrorCells = [...player.errorCells];
    let newErrors = player.errors;

    if (isNote) {
      // Handle note mode
      if (value !== null) {
        if (notes[row][col].has(value)) {
          notes[row][col].delete(value);
        } else {
          notes[row][col].add(value);
        }
      }
    } else {
      // Handle number input
      if (value !== null) {
        // Check if move is valid
        const solutionBoard = sudokuGenerator.stringToBoard(gameState.solution);
        const isCorrect = solutionBoard[row][col] === value;

        if (isCorrect) {
          board[row][col] = value;
          // Clear notes for this value in row, column, and box
          for (let i = 0; i < 9; i++) {
            notes[row][i].delete(value);
            notes[i][col].delete(value);
          }
          const boxRow = Math.floor(row / 3) * 3;
          const boxCol = Math.floor(col / 3) * 3;
          for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
              notes[r][c].delete(value);
            }
          }
          // Remove from error cells if it was there
          newErrorCells = newErrorCells.filter(cell => !(cell.row === row && cell.col === col));
        } else {
          // Incorrect move
          board[row][col] = value;
          newErrors += 1;
          newErrorCells.push({ row, col });
        }
      } else {
        // Erase cell
        board[row][col] = null;
        notes[row][col].clear();
        newErrorCells = newErrorCells.filter(cell => !(cell.row === row && cell.col === col));
      }
    }

    // Update player state
    const updatedPlayer = {
      ...player,
      board: sudokuGenerator.boardToString(board),
      notes: sudokuGenerator.notesToString(notes),
      errors: newErrors,
      errorCells: newErrorCells,
    };

    gameState.players[playerId] = updatedPlayer;

    // Check win condition
    if (sudokuGenerator.isBoardComplete(board) && sudokuGenerator.isBoardValid(board)) {
      gameState.status = 'finished';
      gameState.winner = playerId;
      
      // Save game record to database
      await saveGameRecord(gameState, playerId);
    } else if (newErrors >= 3) {
      gameState.status = 'finished';
      gameState.winner = null;
      
      // Save game record to database
      await saveGameRecord(gameState, playerId);
    }

    // Update game state in Redis
    await redisService.setGameState(gameId, gameState);

    res.json({
      success: true,
      data: {
        gameState: {
          ...gameState,
          solution: undefined, // Don't send solution to client
        },
        moveResult: {
          isValid: value === null || sudokuGenerator.stringToBoard(gameState.solution)[row][col] === value,
          isComplete: gameState.status === 'finished',
          winner: gameState.winner,
        },
      },
      message: 'Move processed successfully',
    });
  } catch (error) {
    console.error('Error making move:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to make move',
      message: 'An error occurred while processing the move',
    });
  }
});

// Start game (for multiplayer)
router.post('/:gameId/start', [
  param('gameId').isString().isLength({ min: 10, max: 50 }),
  validateGameId,
  validatePlayerId,
  gameActionRateLimit,
], async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const playerId = req.body.playerId;

    const gameState = await redisService.getGameState(gameId);
    if (!gameState) {
      return res.status(404).json({
        success: false,
        error: 'Game not found',
        message: 'The requested game does not exist or has expired',
      });
    }

    // Check if player is in the game
    if (!gameState.players[playerId]) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You are not part of this game',
      });
    }

    // Check if game is in waiting state
    if (gameState.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        error: 'Game not in waiting state',
        message: 'The game is not in a waiting state',
      });
    }

    // For multiplayer games, require at least 2 players
    if (gameState.mode !== 'Solo' && Object.keys(gameState.players).length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Not enough players',
        message: 'Multiplayer games require at least 2 players',
      });
    }

    // Start the game
    gameState.status = 'active';
    await redisService.setGameState(gameId, gameState);

    res.json({
      success: true,
      data: {
        gameId,
        status: 'active',
      },
      message: 'Game started successfully',
    });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start game',
      message: 'An error occurred while starting the game',
    });
  }
});

// Get active games list
router.get('/', async (req: Request, res: Response) => {
  try {
    const activeGames = await redisService.getActiveGames();
    
    res.json({
      success: true,
      data: {
        activeGames: activeGames.map(game => ({
          gameId: game.gameId,
          difficulty: game.difficulty,
          mode: game.mode,
          playerCount: game.playerCount,
          maxPlayers: game.mode === 'Solo' ? 1 : 2,
          createdAt: game.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error getting active games:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active games',
      message: 'An error occurred while retrieving active games',
    });
  }
});

// Helper function to save game record to database
async function saveGameRecord(gameState: GameState, playerId: string): Promise<void> {
  try {
    const players = Object.keys(gameState.players);
    const totalErrors = Object.values(gameState.players).reduce((sum, player) => sum + player.errors, 0);
    const totalHints = Object.values(gameState.players).reduce((sum, player) => sum + player.hints, 0);
    const duration = Math.max(...Object.values(gameState.players).map(player => player.timer));

    await db.query(
      `INSERT INTO game_records (game_id, players, difficulty, mode, completed_at, winner, duration, total_errors, total_hints, is_completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (game_id) DO UPDATE SET
         completed_at = EXCLUDED.completed_at,
         winner = EXCLUDED.winner,
         duration = EXCLUDED.duration,
         total_errors = EXCLUDED.total_errors,
         total_hints = EXCLUDED.total_hints,
         is_completed = EXCLUDED.is_completed`,
      [
        gameState.gameId,
        players,
        gameState.difficulty,
        gameState.mode,
        new Date(),
        gameState.winner,
        duration,
        totalErrors,
        totalHints,
        gameState.status === 'finished',
      ]
    );

    // Clean up Redis data
    await redisService.removeActiveGame(gameState.gameId);
    for (const player of players) {
      await redisService.removePlayerSession(player);
    }
  } catch (error) {
    console.error('Error saving game record:', error);
    // Don't throw error - game should still complete even if record saving fails
  }
}

export default router;
