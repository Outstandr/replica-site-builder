import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Headphones, Play } from 'lucide-react';
import { HotstepperLayout } from '@/components/hotstepper/HotstepperLayout';

export default function HotstepperAudiobook() {
  const navigate = useNavigate();
  const chapters = [
    { id: 1, title: 'Introduction', duration: '5:30', completed: true },
    { id: 2, title: 'The Power of Movement', duration: '12:45', completed: true },
    { id: 3, title: 'Building Discipline', duration: '15:20', completed: false, current: true },
    { id: 4, title: 'Overcoming Obstacles', duration: '18:10', completed: false },
    { id: 5, title: 'The Daily Practice', duration: '14:55', completed: false },
  ];

  return (
    <HotstepperLayout>
      <header className="header-safe px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-[hsl(210,25%,20%)] press-scale">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold uppercase tracking-wider">Audiobook</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="px-4 pb-6">
        <div className="tactical-card rounded-xl p-6 mb-6 text-center">
          <Headphones className="w-16 h-16 text-[hsl(186,100%,50%)] mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">The Walker's Guide</h2>
          <p className="text-sm text-[hsl(210,15%,55%)]">Listen while you walk</p>
        </div>

        <div className="tactical-card rounded-xl overflow-hidden">
          {chapters.map((ch) => (
            <button
              key={ch.id}
              className={`w-full flex items-center gap-4 p-4 border-b border-[hsl(210,25%,20%)] last:border-0 press-scale ${
                ch.current ? 'bg-[hsl(186,100%,50%)/0.1]' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                ch.completed ? 'bg-green-500' : ch.current ? 'bg-[hsl(186,100%,50%)]' : 'bg-[hsl(210,25%,25%)]'
              }`}>
                {ch.completed ? '✓' : <Play className="w-4 h-4 fill-current" />}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">{ch.title}</p>
                <p className="text-sm text-[hsl(210,15%,55%)]">{ch.duration}</p>
              </div>
            </button>
          ))}
        </div>
      </main>
    </HotstepperLayout>
  );
}
