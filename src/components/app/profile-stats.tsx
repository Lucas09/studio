"use client";
import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Target, BarChart3, Calendar, Award } from 'lucide-react';
import { useStatsApi } from '@/hooks/use-stats-api';
import { usePlayerId } from '@/hooks/use-player-id';

interface ProfileStatsProps {
  t: any;
  language: 'da' | 'en';
  setLanguage: (lang: 'da' | 'en') => void;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ t, language, setLanguage }) => {
  const playerId = usePlayerId();
  const { getUserStats, getUserGames, getLeaderboard, loading, error } = useStatsApi();
  const [stats, setStats] = useState<any>(null);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'leaderboard'>('stats');

  useEffect(() => {
    if (playerId) {
      loadUserStats();
      loadRecentGames();
      loadLeaderboard();
    }
  }, [playerId]);

  const loadUserStats = async () => {
    if (!playerId) return;
    const userStats = await getUserStats(playerId);
    setStats(userStats);
  };

  const loadRecentGames = async () => {
    if (!playerId) return;
    const games = await getUserGames(playerId, 10, 0);
    setRecentGames(games?.games || []);
  };

  const loadLeaderboard = async () => {
    const leaderboardData = await getLeaderboard(undefined, 10);
    setLeaderboard(leaderboardData?.leaderboard || []);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'da' ? 'da-DK' : 'en-US');
  };

  if (loading && !stats) {
    return (
      <div className="p-6 bg-gray-50 text-gray-800 flex flex-col h-full">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 text-gray-800 flex flex-col h-full">
        <div className="flex justify-center items-center h-full">
          <div className="text-center text-red-600">
            <p>Error loading statistics: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 text-gray-800 flex flex-col h-full">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">{t.statistics}</h1>
      
      {/* Language Selector */}
      <div className="mb-6 flex justify-center">
        <div className="bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setLanguage('da')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              language === 'da' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Dansk
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              language === 'en' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'stats' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <BarChart3 className="inline w-4 h-4 mr-2" />
            {t.statistics}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calendar className="inline w-4 h-4 mr-2" />
            History
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'leaderboard' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Trophy className="inline w-4 h-4 mr-2" />
            Leaderboard
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                Overall Performance
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats?.totalGames || 0}</div>
                  <div className="text-sm text-gray-600">Total Games</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats?.wins || 0}</div>
                  <div className="text-sm text-gray-600">Wins</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats?.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Win Rate</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats?.bestTime ? formatTime(stats.bestTime) : '--:--'}
                  </div>
                  <div className="text-sm text-gray-600">Best Time</div>
                </div>
              </div>
            </div>

            {/* Games by Difficulty */}
            {stats?.gamesByDifficulty && Object.keys(stats.gamesByDifficulty).length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-500" />
                  Games by Difficulty
                </h2>
                <div className="space-y-3">
                  {Object.entries(stats.gamesByDifficulty).map(([difficulty, count]) => (
                    <div key={difficulty} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{difficulty}</span>
                      <span className="text-blue-600 font-bold">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Average Time */}
            {stats?.averageTime && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  Average Completion Time
                </h2>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatTime(Math.round(stats.averageTime))}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {t.avgTime}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Games</h2>
            {recentGames.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No games played yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentGames.map((game) => (
                  <div key={game.gameId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{game.difficulty} - {game.mode}</div>
                      <div className="text-sm text-gray-600">{formatDate(game.completedAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${game.userWon ? 'text-green-600' : 'text-red-600'}`}>
                        {game.userWon ? 'Won' : 'Lost'}
                      </div>
                      <div className="text-sm text-gray-600">{formatTime(game.duration)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Top Players</h2>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No leaderboard data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <div key={player.userId} className={`flex justify-between items-center p-3 rounded-lg ${
                    player.userId === playerId ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">
                          {player.userId === playerId ? 'You' : `Player ${player.userId.slice(-4)}`}
                        </div>
                        <div className="text-sm text-gray-600">{player.totalGames} games</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{player.wins} wins</div>
                      <div className="text-sm text-gray-600">{player.winRate}% win rate</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileStats;
