import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { config } from './config';
import { db } from './database/connection';
import { redisService } from './services/redis';
import {
  securityHeaders,
  corsOptions,
  requestLogger,
  errorHandler,
  notFoundHandler,
} from './middleware/security';

// Import routes
import gamesRouter from './routes/games';
import statsRouter from './routes/stats';

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await db.healthCheck();
    const redisHealth = await redisService.healthCheck();
    
    const isHealthy = dbHealth && redisHealth;
    
    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      corsFixed: true,
      version: '2.0',
      services: {
        database: dbHealth ? 'healthy' : 'unhealthy',
        redis: redisHealth ? 'healthy' : 'unhealthy',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// API routes
app.use('/api/games', gamesRouter);
app.use('/api/stats', statsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SudokuSphere API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      games: '/api/games',
      stats: '/api/stats',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await redisService.disconnect();
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await redisService.disconnect();
  await db.close();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Connect to Redis
    await redisService.connect();
    console.log('Connected to Redis');

    // Test database connection
    const dbHealthy = await db.healthCheck();
    if (!dbHealthy) {
      throw new Error('Database connection failed');
    }
    console.log('Connected to PostgreSQL');

    // Start cleanup interval for expired games
    setInterval(async () => {
      try {
        const cleaned = await redisService.cleanupExpiredGames();
        if (cleaned > 0) {
          console.log(`Cleaned up ${cleaned} expired game entries`);
        }
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }, 60 * 60 * 1000); // Run every hour

    // Start the server
    const server = app.listen(config.server.port, () => {
      console.log(`🚀 SudokuSphere API server running on port ${config.server.port}`);
      console.log(`📊 Environment: ${config.server.nodeEnv}`);
      console.log(`🔗 CORS Origin: ${config.server.corsOrigin}`);
      console.log(`📈 Health Check: http://localhost:${config.server.port}/health`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof config.server.port === 'string'
        ? 'Pipe ' + config.server.port
        : 'Port ' + config.server.port;

      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
