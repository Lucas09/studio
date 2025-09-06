import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:9002,http://localhost:3001,https://sudoku-zeta-liard.vercel.app',
  },
  
  database: {
    // For cloud services (Neon, Supabase, etc.), just use the full connection URL
    url: process.env.DATABASE_URL || (() => {
      // Fallback for local development
      const user = process.env.DB_USER || 'postgres';
      const password = process.env.DB_PASSWORD || 'password';
      const host = process.env.DB_HOST || 'localhost';
      const port = process.env.DB_PORT || '5432';
      const name = process.env.DB_NAME || 'sudoku_db';
      return `postgresql://${user}:${password}@${host}:${port}/${name}`;
    })(),
    ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('neon.tech'),
  },
  
  redis: {
    // For cloud services (Upstash, Redis Cloud, etc.), just use the full connection URL
    url: process.env.REDIS_URL || (() => {
      // Fallback for local development
      const host = process.env.REDIS_HOST || 'localhost';
      const port = process.env.REDIS_PORT || '6379';
      const password = process.env.REDIS_PASSWORD;
      return password ? `redis://:${password}@${host}:${port}` : `redis://${host}:${port}`;
    })(),
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  game: {
    maxActiveGames: 1000,
    gameExpirationHours: 24,
    maxPlayersPerGame: 2,
  },
};
