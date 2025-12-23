import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

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

interface GenderThemeToggleProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export const GenderThemeToggle = ({ className, variant = 'default' }: GenderThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const isFemale = theme === 'female';

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-btn",
          "bg-app-accent text-white",
          "hover:scale-105 active:scale-95 transition-all duration-200",
          "shadow-md",
          className
        )}
        aria-label={`Switch to ${isFemale ? 'male' : 'female'} theme`}
      >
        {isFemale ? (
          <VenusIcon className="w-5 h-5" />
        ) : (
          <MarsIcon className="w-5 h-5" />
        )}
      </button>
    );
  }

  return (
    <div className={cn("flex items-center gap-1 p-1 rounded-btn bg-app-secondary", className)}>
      <button
        onClick={() => !isFemale && toggleTheme()}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-btn transition-all duration-300",
          isFemale 
            ? "bg-app-accent text-white shadow-md" 
            : "text-app-text/60 hover:text-app-text"
        )}
        aria-label="Switch to female theme"
      >
        <VenusIcon className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Garden</span>
      </button>
      <button
        onClick={() => isFemale && toggleTheme()}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-btn transition-all duration-300",
          !isFemale 
            ? "bg-app-accent text-white shadow-md" 
            : "text-app-text/60 hover:text-app-text"
        )}
        aria-label="Switch to male theme"
      >
        <MarsIcon className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Tactical</span>
      </button>
    </div>
  );
};
