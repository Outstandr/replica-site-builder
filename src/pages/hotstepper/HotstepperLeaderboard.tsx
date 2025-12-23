import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { HotstepperLayout } from '@/components/hotstepper/HotstepperLayout';

const mockLeaderboard = [
  { id: 1, name: 'Alex Chen', steps: 15420, avatar: '🏃' },
  { id: 2, name: 'Maria Silva', steps: 14890, avatar: '🚶‍♀️' },
  { id: 3, name: 'John Doe', steps: 12350, avatar: '🏃‍♂️' },
  { id: 4, name: 'You', steps: 10000, avatar: '⭐', isCurrentUser: true },
  { id: 5, name: 'Sarah Wilson', steps: 9870, avatar: '🏃‍♀️' },
  { id: 6, name: 'Mike Brown', steps: 8540, avatar: '🚶' },
  { id: 7, name: 'Emma Davis', steps: 7230, avatar: '🏃‍♀️' },
];

export default function HotstepperLeaderboard() {
  const navigate = useNavigate();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-[hsl(210,15%,55%)]">{rank}</span>;
  };

  return (
    <HotstepperLayout>
      <header className="header-safe px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/hotstepper')}
            className="p-2 rounded-lg hover:bg-[hsl(210,25%,20%)] press-scale"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold uppercase tracking-wider">Leaderboard</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="px-4 pb-6">
        <div className="tactical-card rounded-xl overflow-hidden">
          {mockLeaderboard.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center gap-4 p-4 border-b border-[hsl(210,25%,20%)] last:border-0 ${
                user.isCurrentUser ? 'bg-[hsl(186,100%,50%)/0.1]' : ''
              }`}
            >
              <div className="w-8 flex justify-center">{getRankIcon(index + 1)}</div>
              <span className="text-2xl">{user.avatar}</span>
              <div className="flex-1">
                <p className={`font-semibold ${user.isCurrentUser ? 'text-[hsl(186,100%,50%)]' : ''}`}>
                  {user.name}
                </p>
              </div>
              <p className="text-lg font-bold tabular-nums">{user.steps.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </main>
    </HotstepperLayout>
  );
}
