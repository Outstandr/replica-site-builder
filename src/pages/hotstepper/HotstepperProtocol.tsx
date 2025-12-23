import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { HotstepperLayout } from '@/components/hotstepper/HotstepperLayout';

export default function HotstepperProtocol() {
  const navigate = useNavigate();

  return (
    <HotstepperLayout>
      <header className="header-safe px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/hotstepper')} className="p-2 rounded-lg hover:bg-[hsl(210,25%,20%)] press-scale">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold uppercase tracking-wider">Protocol</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="px-4 pb-6">
        <div className="tactical-card rounded-xl p-6">
          <FileText className="w-12 h-12 text-[hsl(186,100%,50%)] mb-4" />
          <h2 className="text-xl font-bold mb-4">The 10K Steps Protocol</h2>
          
          <div className="space-y-4 text-[hsl(210,15%,70%)]">
            <section>
              <h3 className="text-[hsl(186,100%,50%)] font-semibold mb-2">Daily Goal</h3>
              <p>Achieve 10,000 steps every day to maintain your streak and improve your health.</p>
            </section>
            
            <section>
              <h3 className="text-[hsl(186,100%,50%)] font-semibold mb-2">Streaks</h3>
              <p>Build consecutive days of hitting your goal. Longer streaks unlock achievements.</p>
            </section>
            
            <section>
              <h3 className="text-[hsl(186,100%,50%)] font-semibold mb-2">Active Sessions</h3>
              <p>Use GPS tracking for dedicated walking or running sessions to track your routes.</p>
            </section>
            
            <section>
              <h3 className="text-[hsl(186,100%,50%)] font-semibold mb-2">Leaderboard</h3>
              <p>Compete with others and climb the rankings by accumulating more steps.</p>
            </section>
          </div>
        </div>
      </main>
    </HotstepperLayout>
  );
}
