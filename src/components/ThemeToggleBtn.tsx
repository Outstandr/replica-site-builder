import { useTheme } from '@/contexts/ThemeContext';

// Venus (Female) and Mars (Male) SVG icons
const VenusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="12" y1="13" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
    <line x1="9" y1="18" x2="15" y2="18" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const MarsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="10" cy="14" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="14" y1="10" x2="20" y2="4" stroke="currentColor" strokeWidth="2" />
    <line x1="15" y1="4" x2="20" y2="4" stroke="currentColor" strokeWidth="2" />
    <line x1="20" y1="4" x2="20" y2="9" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const ThemeToggleBtn = () => {
  const { theme, toggleTheme } = useTheme();
  const isFemale = theme === 'female';

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 
                 px-4 py-2 rounded-btn
                 bg-app-accent text-white 
                 shadow-lg hover:scale-105 active:scale-95
                 transition-all duration-200"
      aria-label={`Switch to ${isFemale ? 'male' : 'female'} theme`}
    >
      {isFemale ? <VenusIcon className="w-5 h-5" /> : <MarsIcon className="w-5 h-5" />}
      <span className="text-sm font-medium font-body">
        {isFemale ? 'Garden Mode' : 'Tactical Mode'}
      </span>
    </button>
  );
};
