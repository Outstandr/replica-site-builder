import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Trophy, Headphones, FileText, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/hotstepper', icon: Home, label: 'Home' },
  { path: '/hotstepper/leaderboard', icon: Trophy, label: 'Board' },
  { path: '/hotstepper/audiobook', icon: Headphones, label: 'Audio' },
  { path: '/hotstepper/protocol', icon: FileText, label: 'Protocol' },
  { path: '/hotstepper/profile', icon: User, label: 'Profile' },
];

export function HotstepperBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/hotstepper') {
      return location.pathname === '/hotstepper' || location.pathname === '/hotstepper/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl press-scale transition-all duration-200 relative min-w-[60px]',
                active 
                  ? 'text-[hsl(186,100%,50%)]' 
                  : 'text-[hsl(210,15%,55%)] hover:text-[hsl(210,15%,70%)]'
              )}
            >
              {active && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[hsl(186,100%,50%)] rounded-full shadow-glow-sm" />
              )}
              {active && (
                <div className="absolute inset-0 bg-[hsl(186,100%,50%)/0.1] rounded-xl" />
              )}
              <item.icon 
                className={cn(
                  'w-5 h-5 relative z-10 transition-transform duration-200',
                  active && 'scale-110'
                )} 
              />
              <span className={cn(
                'text-[10px] font-medium relative z-10 uppercase tracking-wider',
                active && 'font-semibold'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
