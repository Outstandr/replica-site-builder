import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggleBtn = () => {
  const { theme, toggleTheme } = useTheme();
  const isWarm = theme === 'warm';

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 
                 px-4 py-2 rounded-full 
                 bg-themeAccent text-white 
                 shadow-lg hover:scale-105 active:scale-95
                 transition-all duration-200"
      aria-label={`Switch to ${isWarm ? 'cool' : 'warm'} mode`}
    >
      {isWarm ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      <span className="text-sm font-medium">
        {isWarm ? 'Warm Mode' : 'Cool Mode'}
      </span>
    </button>
  );
};
