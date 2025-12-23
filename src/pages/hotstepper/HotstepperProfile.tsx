import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Target, Bell, Shield, LogOut } from 'lucide-react';
import { HotstepperLayout } from '@/components/hotstepper/HotstepperLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useHotstepperStreak } from '@/hooks/hotstepper';

export default function HotstepperProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { streak } = useHotstepperStreak();

  const menuItems = [
    { icon: Target, label: 'Goals', path: '/hotstepper/goals' },
    { icon: Bell, label: 'Notifications', path: '/hotstepper/notifications' },
    { icon: Shield, label: 'Privacy', path: '/hotstepper/privacy' },
    { icon: Settings, label: 'Settings', path: '/hotstepper/settings' },
  ];

  return (
    <HotstepperLayout>
      <header className="header-safe px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/hotstepper')} className="p-2 rounded-lg hover:bg-[hsl(210,25%,20%)] press-scale">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold uppercase tracking-wider">Profile</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="px-4 pb-6 space-y-4">
        {/* User Info */}
        <div className="tactical-card rounded-xl p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[hsl(186,100%,50%)/0.2] flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🏃</span>
          </div>
          <h2 className="text-xl font-bold">{user?.email?.split('@')[0] || 'Stepper'}</h2>
          <p className="text-sm text-[hsl(210,15%,55%)]">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="tactical-card rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-[hsl(186,100%,50%)]">{streak.currentStreak}</p>
            <p className="tactical-label">Current Streak</p>
          </div>
          <div className="tactical-card rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{streak.longestStreak}</p>
            <p className="tactical-label">Best Streak</p>
          </div>
        </div>

        {/* Menu */}
        <div className="tactical-card rounded-xl overflow-hidden">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-4 p-4 border-b border-[hsl(210,25%,20%)] last:border-0 hover:bg-[hsl(210,25%,18%)] press-scale"
            >
              <item.icon className="w-5 h-5 text-[hsl(186,100%,50%)]" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Back to Main App */}
        <button
          onClick={() => navigate('/modules')}
          className="w-full tactical-card rounded-xl p-4 flex items-center justify-center gap-2 text-[hsl(186,100%,50%)] font-semibold press-scale"
        >
          <LogOut className="w-5 h-5" />
          Back to Soul Reset Garden
        </button>
      </main>
    </HotstepperLayout>
  );
}
