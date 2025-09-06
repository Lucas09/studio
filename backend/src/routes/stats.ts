import { Router, Request, Response } from 'express';
import { param, query, validationResult } from 'express-validator';
import { db } from '../database/connection';
import { redisRateLimit } from '../middleware/security';

const router = Router();

// Get user statistics
router.get('/user/:userId', [
  param('userId').isString().isLength({ min: 5, max: 50 }),
  redisRateLimit('user_stats', 10, 60000), // 10 requests per minute
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid user ID',
        details: errors.array(),
      });
    }

    const { userId } = req.params;

    // Get user stats
    const statsResult = await db.query(
      'SELECT * FROM user_stats WHERE user_id = $1',
      [userId]
    );

    if (statsResult.rows.length === 0) {
      // Create initial stats for new user
      await db.query(
        'INSERT INTO user_stats (user_id) VALUES ($1)',
        [userId]
      );
      
      return res.json({
        success: true,
        data: {
          userId,
          totalGames: 0,
          wins: 0,
          averageTime: 0,
          bestTime: null,
          gamesByDifficulty: {},
          lastPlayedAt: null,
        },
      });
    }

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      data: {
        userId: stats.user_id,
        totalGames: stats.total_games,
        wins: stats.wins,
        averageTime: parseFloat(stats.average_time) || 0,
        bestTime: stats.best_time,
        gamesByDifficulty: stats.games_by_difficulty || {},
        lastPlayedAt: stats.last_played_at,
      },
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics',
      message: 'An error occurred while retrieving user statistics',
    });
  }
});

// Get user game history
router.get('/user/:userId/games', [
  param('userId').isString().isLength({ min: 5, max: 50 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  redisRateLimit('user_games', 20, 60000), // 20 requests per minute
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid parameters',
        details: errors.array(),
      });
    }

    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // Get user's game history
    const gamesResult = await db.query(
      `SELECT game_id, players, difficulty, mode, completed_at, winner, duration, total_errors, total_hints, is_completed
       FROM game_records 
       WHERE $1 = ANY(players)
       ORDER BY completed_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const games = gamesResult.rows.map((row: any) => ({
      gameId: row.game_id,
      players: row.players,
      difficulty: row.difficulty,
      mode: row.mode,
      completedAt: row.completed_at,
      winner: row.winner,
      duration: row.duration,
      totalErrors: row.total_errors,
      totalHints: row.total_hints,
      isCompleted: row.is_completed,
      userWon: row.winner === userId,
    }));

    // Get total count for pagination
    const countResult = await db.query(
      'SELECT COUNT(*) FROM game_records WHERE $1 = ANY(players)',
      [userId]
    );
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        games,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      },
    });
  } catch (error) {
    console.error('Error getting user games:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user games',
      message: 'An error occurred while retrieving user game history',
    });
  }
});

// Get leaderboard
router.get('/leaderboard', [
  query('difficulty').optional().isIn(['Easy', 'Medium', 'Hard', 'Very Hard', 'Impossible']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  redisRateLimit('leaderboard', 30, 60000), // 30 requests per minute
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid parameters',
        details: errors.array(),
      });
    }

    const difficulty = req.query.difficulty as string;
    const limit = parseInt(req.query.limit as string) || 10;

    let query = `
      SELECT 
        us.user_id,
        us.total_games,
        us.wins,
        us.average_time,
        us.best_time,
        us.games_by_difficulty,
        us.last_played_at
      FROM user_stats us
      WHERE us.total_games > 0
    `;
    
    const params: any[] = [];
    
    if (difficulty) {
      query += ` AND us.games_by_difficulty ? $1`;
      params.push(difficulty);
    }
    
    query += ` ORDER BY us.wins DESC, us.average_time ASC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(query, params);

    const leaderboard = result.rows.map((row: any, index: number) => ({
      rank: index + 1,
      userId: row.user_id,
      totalGames: row.total_games,
      wins: row.wins,
      winRate: row.total_games > 0 ? (row.wins / row.total_games * 100).toFixed(1) : 0,
      averageTime: parseFloat(row.average_time) || 0,
      bestTime: row.best_time,
      gamesByDifficulty: row.games_by_difficulty || {},
      lastPlayedAt: row.last_played_at,
    }));

    res.json({
      success: true,
      data: {
        leaderboard,
        difficulty: difficulty || 'all',
        totalPlayers: leaderboard.length,
      },
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get leaderboard',
      message: 'An error occurred while retrieving the leaderboard',
    });
  }
});

// Get global statistics
router.get('/global', [
  redisRateLimit('global_stats', 5, 60000), // 5 requests per minute
], async (req: Request, res: Response) => {
  try {
    // Get total games played
    const totalGamesResult = await db.query('SELECT COUNT(*) FROM game_records');
    const totalGames = parseInt(totalGamesResult.rows[0].count);

    // Get total unique players
    const totalPlayersResult = await db.query('SELECT COUNT(DISTINCT unnest(players)) FROM game_records');
    const totalPlayers = parseInt(totalPlayersResult.rows[0].count);

    // Get games by difficulty
    const difficultyStatsResult = await db.query(`
      SELECT difficulty, COUNT(*) as count
      FROM game_records
      GROUP BY difficulty
      ORDER BY count DESC
    `);
    const gamesByDifficulty = difficultyStatsResult.rows.reduce((acc: Record<string, number>, row: any) => {
      acc[row.difficulty] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    // Get games by mode
    const modeStatsResult = await db.query(`
      SELECT mode, COUNT(*) as count
      FROM game_records
      GROUP BY mode
      ORDER BY count DESC
    `);
    const gamesByMode = modeStatsResult.rows.reduce((acc: Record<string, number>, row: any) => {
      acc[row.mode] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    // Get average completion time
    const avgTimeResult = await db.query(`
      SELECT AVG(duration) as avg_duration
      FROM game_records
      WHERE is_completed = true
    `);
    const averageCompletionTime = parseFloat(avgTimeResult.rows[0].avg_duration) || 0;

    // Get games completed today
    const todayGamesResult = await db.query(`
      SELECT COUNT(*) FROM game_records
      WHERE DATE(completed_at) = CURRENT_DATE
    `);
    const gamesCompletedToday = parseInt(todayGamesResult.rows[0].count);

    res.json({
      success: true,
      data: {
        totalGames,
        totalPlayers,
        gamesByDifficulty,
        gamesByMode,
        averageCompletionTime: Math.round(averageCompletionTime),
        gamesCompletedToday,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error('Error getting global stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get global statistics',
      message: 'An error occurred while retrieving global statistics',
    });
  }
});

// Get daily challenge statistics
router.get('/daily-challenges', [
  query('date').optional().isISO8601(),
  redisRateLimit('daily_stats', 10, 60000), // 10 requests per minute
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid date format',
        details: errors.array(),
      });
    }

    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const dateStr = date.toISOString().split('T')[0];

    // Get daily challenge completion stats
    const completionStatsResult = await db.query(`
      SELECT 
        COUNT(*) as total_completions,
        AVG(duration) as avg_duration,
        AVG(errors) as avg_errors,
        AVG(hints) as avg_hints
      FROM daily_completions
      WHERE challenge_date = $1
    `, [dateStr]);

    const stats = completionStatsResult.rows[0];

    res.json({
      success: true,
      data: {
        date: dateStr,
        totalCompletions: parseInt(stats.total_completions) || 0,
        averageDuration: Math.round(parseFloat(stats.avg_duration) || 0),
        averageErrors: Math.round(parseFloat(stats.avg_errors) || 0),
        averageHints: Math.round(parseFloat(stats.avg_hints) || 0),
      },
    });
  } catch (error) {
    console.error('Error getting daily challenge stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get daily challenge statistics',
      message: 'An error occurred while retrieving daily challenge statistics',
    });
  }
});

export default router;
