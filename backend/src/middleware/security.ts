import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { redisService } from '../services/redis';
import { config } from '../config';

// Helmet security middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Rate limiting middleware
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: message || 'Too many requests from this IP, please try again later.',
      });
    },
  });
};

// General rate limiting
export const generalRateLimit = createRateLimit(
  config.rateLimit.windowMs,
  config.rateLimit.maxRequests,
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiting for game actions
export const gameActionRateLimit = createRateLimit(
  60000, // 1 minute
  30, // 30 requests per minute
  'Too many game actions, please slow down.'
);

// IP-based rate limiting using Redis
export const redisRateLimit = (identifier: string, limit: number, windowMs: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = req.ip || req.connection.remoteAddress || 'unknown';
      const key = `${identifier}:${clientId}`;
      
      const result = await redisService.checkRateLimit(key, limit, windowMs);
      
      if (!result.allowed) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many requests, please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        });
      }
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
      });
      
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // If Redis is down, allow the request but log the error
      next();
    }
  };
};

// Input validation middleware
export const validateGameId = (req: Request, res: Response, next: NextFunction) => {
  const { gameId } = req.params;
  
  if (!gameId || typeof gameId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid game ID',
      message: 'Game ID is required and must be a string.',
    });
  }
  
  // Basic validation for game ID format
  if (gameId.length < 10 || gameId.length > 50) {
    return res.status(400).json({
      success: false,
      error: 'Invalid game ID format',
      message: 'Game ID must be between 10 and 50 characters.',
    });
  }
  
  next();
};

// Player ID validation
export const validatePlayerId = (req: Request, res: Response, next: NextFunction) => {
  const { playerId } = req.body || req.params;
  
  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid player ID',
      message: 'Player ID is required and must be a string.',
    });
  }
  
  // Basic validation for player ID format
  if (playerId.length < 5 || playerId.length > 50) {
    return res.status(400).json({
      success: false,
      error: 'Invalid player ID format',
      message: 'Player ID must be between 5 and 50 characters.',
    });
  }
  
  next();
};

// Move validation
export const validateMove = (req: Request, res: Response, next: NextFunction) => {
  const { row, col, value, isNote } = req.body;
  
  if (typeof row !== 'number' || typeof col !== 'number') {
    return res.status(400).json({
      success: false,
      error: 'Invalid move coordinates',
      message: 'Row and column must be numbers.',
    });
  }
  
  if (row < 0 || row > 8 || col < 0 || col > 8) {
    return res.status(400).json({
      success: false,
      error: 'Invalid move coordinates',
      message: 'Row and column must be between 0 and 8.',
    });
  }
  
  if (value !== null && (typeof value !== 'number' || value < 1 || value > 9)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid move value',
      message: 'Value must be null or a number between 1 and 9.',
    });
  }
  
  if (typeof isNote !== 'undefined' && typeof isNote !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'Invalid note flag',
      message: 'isNote must be a boolean if provided.',
    });
  }
  
  next();
};

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = config.server.corsOrigin.split(',').map(o => o.trim());
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    };
    
    if (res.statusCode >= 400) {
      console.warn('HTTP Request', logData);
    } else {
      console.log('HTTP Request', logData);
    }
  });
  
  next();
};

// Error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Unhandled error:', error);
  
  // Don't leak error details in production
  const isDevelopment = config.server.nodeEnv === 'development';
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: isDevelopment ? error.message : 'Something went wrong',
    ...(isDevelopment && { stack: error.stack }),
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.url} not found`,
  });
};
