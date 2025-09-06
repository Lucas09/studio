# SudokuSphere Backend API

A secure, scalable backend API for the SudokuSphere game built with Express.js, Redis, and PostgreSQL.

## Features

- **RESTful API** with comprehensive game management
- **Redis** for fast, temporary game state storage
- **PostgreSQL** for persistent game statistics and user data
- **Security-first** approach with rate limiting, input validation, and CORS
- **Real-time game updates** via polling (more secure than WebSockets)
- **Comprehensive statistics** and leaderboards
- **Daily challenges** system
- **Graceful error handling** and logging

## Architecture

### Data Flow
1. **Active Games**: Stored in Redis (24-hour TTL)
2. **Game Statistics**: Stored in PostgreSQL (permanent)
3. **No Full Game State Persistence**: Only metadata saved for security

### Security Features
- Rate limiting (Redis-based and Express-based)
- Input validation with express-validator
- CORS protection
- Helmet security headers
- Request logging and monitoring
- No sensitive data persistence

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis 6+

### Installation

1. **Clone and install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
```bash
cp env.example .env
# Edit .env with your database and Redis credentials
```

3. **Set up the database:**
```bash
# Create PostgreSQL database
createdb sudoku_db

# Run migrations
npm run db:migrate
```

4. **Start Redis:**
```bash
redis-server
```

5. **Start the development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

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
- `GET /api/stats/daily-challenges` - Get daily challenge stats

### Health
- `GET /health` - Health check endpoint

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/sudoku_db

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-secret-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Database Schema

### Tables
- `users` - User accounts and authentication
- `game_records` - Game completion statistics (metadata only)
- `user_stats` - Aggregated user statistics
- `daily_challenges` - Daily puzzle challenges
- `daily_completions` - User daily challenge completions

### Key Design Decisions
- **No full game state storage** - Only completion metadata
- **Automatic statistics updates** - Triggers update user stats
- **Efficient indexing** - Optimized for common queries
- **Data retention** - Games expire after 24 hours in Redis

## Security Considerations

### Rate Limiting
- General API: 100 requests per 15 minutes
- Game actions: 30 requests per minute
- Statistics: 5-30 requests per minute (varies by endpoint)

### Input Validation
- All inputs validated with express-validator
- Game IDs, player IDs, and moves validated
- SQL injection protection via parameterized queries

### Data Protection
- No sensitive game data persisted
- CORS configured for specific origins
- Security headers via Helmet
- Request logging for monitoring

## Performance

### Redis Usage
- Game states stored with 24-hour TTL
- Automatic cleanup of expired games
- Efficient key patterns for fast lookups

### Database Optimization
- Indexed columns for common queries
- JSONB for flexible game statistics
- Triggers for automatic stat updates

### Caching Strategy
- Active games cached in Redis
- Statistics computed on-demand
- No long-term game state caching

## Monitoring

### Health Checks
- Database connectivity
- Redis connectivity
- Service status endpoint

### Logging
- Request/response logging
- Error logging with stack traces
- Performance metrics

### Metrics
- Game completion rates
- Average completion times
- User engagement statistics

## Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with test data
```

### Code Structure
```
src/
├── config/          # Configuration management
├── database/        # Database connection and migrations
├── middleware/      # Security and validation middleware
├── routes/          # API route handlers
├── services/        # Business logic services
├── types/           # TypeScript type definitions
└── server.ts        # Main server file
```

## Production Deployment

### Requirements
- Node.js 18+ runtime
- PostgreSQL 13+ database
- Redis 6+ cache
- SSL/TLS termination
- Load balancer (optional)

### Environment
- Set `NODE_ENV=production`
- Configure production database URL
- Set secure JWT secret
- Configure CORS origins
- Enable SSL in database connection

### Scaling Considerations
- Redis clustering for high availability
- Database read replicas for statistics
- Load balancer for multiple API instances
- CDN for static assets (if any)

## API Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "data": object | null,
  "error": string | null,
  "message": string | null
}
```

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message"
}
```

## Contributing

1. Follow TypeScript best practices
2. Add input validation for all endpoints
3. Include error handling
4. Write comprehensive tests
5. Update documentation

## License

MIT License - see LICENSE file for details
