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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(210,28%,12%)]/95 backdrop-blur-xl border-t border-[hsl(210,15%,20%)] safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 min-w-[64px]',
                'active:scale-95',
                active 
                  ? 'text-[hsl(186,100%,50%)]' 
                  : 'text-[hsl(210,15%,55%)] hover:text-[hsl(210,15%,70%)]'
              )}
            >
              <div className={cn(
                'relative p-1.5 rounded-xl transition-all duration-300',
                active && 'bg-[hsl(186,100%,50%)]/10'
              )}>
                <item.icon 
                  className={cn(
                    'w-5 h-5 transition-transform duration-200',
                    active && 'scale-110'
                  )} 
                />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[hsl(186,100%,50%)]" />
                )}
              </div>
              <span className={cn(
                'text-[10px] font-medium transition-all duration-200',
                active ? 'opacity-100' : 'opacity-70'
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
