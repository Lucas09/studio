-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Game records table (for statistics only)
CREATE TABLE IF NOT EXISTS game_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id VARCHAR(50) UNIQUE NOT NULL,
    players TEXT[] NOT NULL, -- Array of player IDs
    difficulty VARCHAR(20) NOT NULL,
    mode VARCHAR(20) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    winner VARCHAR(50),
    duration INTEGER NOT NULL, -- in seconds
    total_errors INTEGER DEFAULT 0,
    total_hints INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User statistics table
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_games INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    average_time DECIMAL(10,2) DEFAULT 0,
    best_time INTEGER,
    games_by_difficulty JSONB DEFAULT '{}',
    last_played_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Daily challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL,
    puzzle TEXT NOT NULL, -- 81-character string
    solution TEXT NOT NULL, -- 81-character string
    difficulty VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User daily challenge completions
CREATE TABLE IF NOT EXISTS daily_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_date DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration INTEGER NOT NULL, -- in seconds
    errors INTEGER DEFAULT 0,
    hints INTEGER DEFAULT 0,
    UNIQUE(user_id, challenge_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_records_players ON game_records USING GIN(players);
CREATE INDEX IF NOT EXISTS idx_game_records_completed_at ON game_records(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(date);
CREATE INDEX IF NOT EXISTS idx_daily_completions_user_date ON daily_completions(user_id, challenge_date);

-- Function to update user statistics
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert user stats
    INSERT INTO user_stats (user_id, total_games, wins, average_time, best_time, games_by_difficulty, last_played_at)
    SELECT 
        NEW.winner as user_id,
        1 as total_games,
        1 as wins,
        NEW.duration as average_time,
        NEW.duration as best_time,
        jsonb_build_object(NEW.difficulty, 1) as games_by_difficulty,
        NEW.completed_at as last_played_at
    WHERE NEW.winner IS NOT NULL AND NEW.is_completed = true
    ON CONFLICT (user_id) DO UPDATE SET
        total_games = user_stats.total_games + 1,
        wins = user_stats.wins + CASE WHEN NEW.winner = user_stats.user_id THEN 1 ELSE 0 END,
        average_time = (user_stats.average_time * user_stats.total_games + NEW.duration) / (user_stats.total_games + 1),
        best_time = LEAST(COALESCE(user_stats.best_time, NEW.duration), NEW.duration),
        games_by_difficulty = user_stats.games_by_difficulty || jsonb_build_object(NEW.difficulty, COALESCE((user_stats.games_by_difficulty->>NEW.difficulty)::int, 0) + 1),
        last_played_at = NEW.completed_at,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user stats
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT ON game_records
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();
