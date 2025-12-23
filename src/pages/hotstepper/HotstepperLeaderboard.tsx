import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Award, RefreshCw, Users } from 'lucide-react';
import { HotstepperLayout } from '@/components/hotstepper/HotstepperLayout';
import { useHotstepperLeaderboard } from '@/hooks/hotstepper/useHotstepperLeaderboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function HotstepperLeaderboard() {
  const navigate = useNavigate();
  const { leaderboard, loading, error, currentUserRank, refresh } = useHotstepperLeaderboard();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-[hsl(210,15%,55%)]">{rank}</span>;
  };

  const getAvatarEmoji = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return '⭐';
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '🏃';
  };

  return (
    <HotstepperLayout>
      <header className="header-safe px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-[hsl(210,25%,20%)] press-scale"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold uppercase tracking-wider">Leaderboard</h1>
          <button
            onClick={refresh}
            className="p-2 rounded-lg hover:bg-[hsl(210,25%,20%)] press-scale"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Current user rank badge */}
        {currentUserRank && (
          <div className="flex justify-center mb-4">
            <div className="bg-[hsl(186,100%,50%)/0.1] border border-[hsl(186,100%,50%)/0.3] rounded-full px-4 py-2 flex items-center gap-2">
              <span className="text-[hsl(186,100%,50%)] text-sm">Your Rank:</span>
              <span className="text-[hsl(186,100%,50%)] font-bold">#{currentUserRank}</span>
            </div>
          </div>
        )}
      </header>

      <main className="px-4 pb-6">
        {loading ? (
          <div className="tactical-card rounded-xl overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-[hsl(210,25%,20%)] last:border-0">
                <Skeleton className="w-8 h-8 rounded-full bg-[hsl(210,25%,25%)]" />
                <Skeleton className="w-10 h-10 rounded-full bg-[hsl(210,25%,25%)]" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 bg-[hsl(210,25%,25%)]" />
                </div>
                <Skeleton className="h-5 w-16 bg-[hsl(210,25%,25%)]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="tactical-card rounded-xl p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={refresh}
              className="text-[hsl(186,100%,50%)] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="tactical-card rounded-xl p-8 text-center">
            <Users className="w-12 h-12 text-[hsl(210,15%,40%)] mx-auto mb-4" />
            <p className="text-[hsl(210,15%,55%)] mb-2">No activity yet today</p>
            <p className="text-sm text-[hsl(210,15%,45%)]">
              Be the first to log some steps!
            </p>
          </div>
        ) : (
          <div className="tactical-card rounded-xl overflow-hidden">
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-4 border-b border-[hsl(210,25%,20%)] last:border-0 ${
                  entry.isCurrentUser ? 'bg-[hsl(186,100%,50%)/0.1]' : ''
                }`}
              >
                <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
                <span className="text-2xl">{getAvatarEmoji(entry.rank, entry.isCurrentUser)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${entry.isCurrentUser ? 'text-[hsl(186,100%,50%)]' : ''}`}>
                    {entry.isCurrentUser ? 'You' : entry.displayName}
                  </p>
                </div>
                <p className="text-lg font-bold tabular-nums">{entry.steps.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Info text */}
        <p className="text-center text-xs text-[hsl(210,15%,45%)] mt-4">
          Today's step count • Updates in real-time
        </p>
      </main>
    </HotstepperLayout>
  );
}
