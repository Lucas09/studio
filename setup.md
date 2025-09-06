# SudokuSphere Setup Guide

This guide will help you set up the complete SudokuSphere application with the new REST API backend.

## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- npm or yarn

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set up Cloud Services (Neon + Upstash)

#### A. Set up Neon PostgreSQL (Free Tier)
1. Go to [https://neon.tech](https://neon.tech) and sign up
2. Create a new project called "sudoku-sphere"
3. Copy your connection string from the dashboard
4. It will look like: `postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/sudoku_db`

#### B. Set up Upstash Redis (Free Tier)
1. Go to [https://upstash.com](https://upstash.com) and sign up
2. Create a new Redis database
3. Choose a region close to your users
4. Copy your connection details from the dashboard
5. It will look like: `redis://default:password@redis-xxx.upstash.io:6379`

### 3. Set up Environment Variables
```bash
cp env.example .env
```

Edit `.env` with your cloud configuration:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/sudoku_db

# Redis Configuration (Upstash)
REDIS_URL=redis://default:password@redis-xxx.upstash.io:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### 4. Set up Database
```bash
# Run migrations (this will create tables in your Neon database)
npm run db:migrate
```

### 5. Start Backend Server
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Frontend Setup

### 1. Install Dependencies
```bash
# From project root
npm install
```

### 2. Set up Environment Variables
```bash
cp env.local.example .env.local
```

Edit `.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Development
NODE_ENV=development
```

### 3. Start Frontend Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Verification

### 1. Check Backend Health
Visit `http://localhost:3001/health` - you should see:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

If you see "unhealthy" for either service, check your connection strings in the `.env` file.

### 2. Check Frontend
Visit `http://localhost:3000` - you should see the SudokuSphere app.

### 3. Test Game Creation
1. Click "Start Solo" to create a solo game
2. Click "Co-op" or "Versus" to create a multiplayer game
3. Try joining a game with a game ID

## Architecture Overview

### Backend (REST API)
- **Express.js** server with TypeScript
- **PostgreSQL** for persistent data (game statistics, user data)
- **Redis** for temporary game state (24-hour TTL)
- **Security-first** approach with rate limiting and validation

### Frontend (Next.js)
- **React** with TypeScript
- **Tailwind CSS** for styling
- **REST API integration** with polling for real-time updates
- **Local storage** for solo game persistence

### Data Flow
1. **Active Games**: Stored in Redis (temporary, 24-hour TTL)
2. **Game Statistics**: Stored in PostgreSQL (permanent)
3. **No Full Game State Persistence**: Only metadata saved for security
4. **Real-time Updates**: Via polling every 2 seconds (more secure than WebSockets)

## Security Features

- **Rate Limiting**: Redis-based and Express-based rate limiting
- **Input Validation**: All inputs validated with express-validator
- **CORS Protection**: Configured for specific origins
- **Security Headers**: Helmet middleware for security headers
- **No Sensitive Data**: Game solutions not persisted
- **Request Logging**: Comprehensive logging for monitoring

## API Endpoints

### Games
- `POST /api/games/create` - Create a new game
- `POST /api/games/join` - Join an existing game
- `GET /api/games/:gameId` - Get game state
- `POST /api/games/:gameId/move` - Make a move
- `POST /api/games/:gameId/start` - Start a multiplayer game
- `GET /api/games` - List active games

### Statistics
- `GET /api/stats/user/:userId` - Get user statistics
- `GET /api/stats/user/:userId/games` - Get user game history
- `GET /api/stats/leaderboard` - Get leaderboard
- `GET /api/stats/global` - Get global statistics

### Health
- `GET /health` - Health check endpoint

## Troubleshooting

### Backend Issues
1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **Redis Connection**: Ensure Redis is running and accessible
3. **Port Conflicts**: Change PORT in .env if 3001 is in use

### Frontend Issues
1. **API Connection**: Ensure backend is running and NEXT_PUBLIC_API_URL is correct
2. **CORS Errors**: Check CORS_ORIGIN in backend .env matches frontend URL
3. **Build Errors**: Run `npm run typecheck` to check TypeScript errors

### Common Commands
```bash
# Backend
npm run dev          # Start development server
npm run build        # Build for production
npm run db:migrate   # Run database migrations
npm run typecheck    # Check TypeScript

# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run typecheck    # Check TypeScript
```

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set secure JWT secret
4. Configure CORS origins
5. Enable SSL in database connection

### Frontend
1. Set `NEXT_PUBLIC_API_URL` to production API URL
2. Build with `npm run build`
3. Deploy to Vercel, Netlify, or your preferred platform

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all services are running (PostgreSQL, Redis, Backend)
3. Check environment variables are set correctly
4. Ensure ports are not in use by other applications
