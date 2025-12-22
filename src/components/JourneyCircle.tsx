import { useTranslations } from "@/hooks/useTranslations";

interface JourneyCircleProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const JourneyCircle = ({ 
  progress, 
  size = 200, 
  strokeWidth = 12,
  className = "" 
}: JourneyCircleProps) => {
  const translations = useTranslations();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const modules = [
    { key: 'R', color: 'hsl(var(--reset-rhythm))', label: translations.journey.rhythm },
    { key: 'E', color: 'hsl(var(--reset-energy))', label: translations.journey.energy },
    { key: 'S', color: 'hsl(var(--reset-systems))', label: translations.journey.systems },
    { key: 'E2', color: 'hsl(var(--reset-execution))', label: translations.journey.execution },
    { key: 'T', color: 'hsl(var(--reset-transformation))', label: translations.journey.transformation },
  ];

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          className="opacity-30"
        />
        
        {/* Progress circle with gradient */}
        <defs>
          <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--reset-rhythm))" />
            <stop offset="25%" stopColor="hsl(var(--reset-energy))" />
            <stop offset="50%" stopColor="hsl(var(--reset-systems))" />
            <stop offset="75%" stopColor="hsl(var(--reset-execution))" />
            <stop offset="100%" stopColor="hsl(var(--reset-transformation))" />
          </linearGradient>
        </defs>
        
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#journeyGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-foreground">{Math.round(progress)}%</span>
        <span className="text-sm text-muted-foreground mt-1">Complete</span>
      </div>

      {/* Module indicators around the circle */}
      {modules.map((module, index) => {
        const angle = (index / modules.length) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const indicatorRadius = radius + strokeWidth + 15;
        const x = size / 2 + indicatorRadius * Math.cos(rad);
        const y = size / 2 + indicatorRadius * Math.sin(rad);
        
        return (
          <div
            key={module.key}
            className="absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-transform hover:scale-110"
            style={{
              left: x - 16,
              top: y - 16,
              backgroundColor: module.color,
              color: 'white',
            }}
            title={module.label}
          >
            {module.key === 'E2' ? 'E' : module.key}
          </div>
        );
      })}
    </div>
  );
};

export default JourneyCircle;
