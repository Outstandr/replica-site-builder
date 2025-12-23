import { useTranslations } from "@/hooks/useTranslations";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface JourneyCircleProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  completedSteps?: number[];
  activeStep?: number;
}

const JourneyCircle = ({ 
  progress, 
  size = 240, 
  strokeWidth = 10,
  className = "",
  completedSteps = [],
  activeStep = 0
}: JourneyCircleProps) => {
  const translations = useTranslations();
  const radius = (size - strokeWidth - 40) / 2; // Extra space for nodes
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const modules = [
    { key: 'R', index: 0, color: 'hsl(var(--reset-rhythm))', label: translations.journey.rhythm },
    { key: 'E', index: 1, color: 'hsl(var(--reset-energy))', label: translations.journey.energy },
    { key: 'S', index: 2, color: 'hsl(var(--reset-systems))', label: translations.journey.systems },
    { key: 'E2', index: 3, color: 'hsl(var(--reset-execution))', label: translations.journey.execution },
    { key: 'T', index: 4, color: 'hsl(var(--reset-transformation))', label: translations.journey.transformation },
  ];

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          className="opacity-20"
        />
        
        {/* Connecting lines between nodes */}
        {modules.map((module, index) => {
          const nextIndex = (index + 1) % modules.length;
          const angle1 = (index / modules.length) * 360 - 90;
          const angle2 = (nextIndex / modules.length) * 360 - 90;
          const rad1 = (angle1 * Math.PI) / 180;
          const rad2 = (angle2 * Math.PI) / 180;
          
          const nodeRadius = radius + 20;
          const x1 = size / 2 + nodeRadius * Math.cos(rad1);
          const y1 = size / 2 + nodeRadius * Math.sin(rad1);
          const x2 = size / 2 + nodeRadius * Math.cos(rad2);
          const y2 = size / 2 + nodeRadius * Math.sin(rad2);
          
          const isConnected = completedSteps.includes(index) && completedSteps.includes(nextIndex);
          
          return (
            <line
              key={`line-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isConnected ? module.color : "hsl(var(--muted))"}
              strokeWidth={2}
              strokeDasharray={isConnected ? "0" : "4,4"}
              opacity={0.4}
            />
          );
        })}
        
        {/* Progress circle with gradient */}
        <defs>
          <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--reset-rhythm))" />
            <stop offset="25%" stopColor="hsl(var(--reset-energy))" />
            <stop offset="50%" stopColor="hsl(var(--reset-systems))" />
            <stop offset="75%" stopColor="hsl(var(--reset-execution))" />
            <stop offset="100%" stopColor="hsl(var(--reset-transformation))" />
          </linearGradient>
          
          {/* Glow filter for active node */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
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
        <span className="text-4xl font-bold text-foreground gradient-text">{Math.round(progress)}%</span>
        <span className="text-sm text-muted-foreground mt-1">Complete</span>
      </div>

      {/* Module nodes around the circle */}
      {modules.map((module, index) => {
        const angle = (index / modules.length) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const nodeRadius = radius + 20;
        const x = size / 2 + nodeRadius * Math.cos(rad);
        const y = size / 2 + nodeRadius * Math.sin(rad);
        
        const isCompleted = completedSteps.includes(index);
        const isActive = activeStep === index;
        
        return (
          <div
            key={module.key}
            className={cn(
              "absolute w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
              isActive && "ring-4 ring-offset-2 ring-offset-background animate-scale-pulse",
              isCompleted ? "shadow-lg" : "shadow-md"
            )}
            style={{
              left: x - 20,
              top: y - 20,
              backgroundColor: isCompleted || isActive ? module.color : 'hsl(var(--muted))',
              color: isCompleted || isActive ? 'white' : 'hsl(var(--muted-foreground))',
              boxShadow: isActive ? `0 0 20px ${module.color}, 0 0 0 4px ${module.color}40` : undefined,
            }}
            title={module.label}
          >
            {isCompleted ? (
              <Check className="w-5 h-5" />
            ) : (
              module.key === 'E2' ? 'E' : module.key
            )}
          </div>
        );
      })}
    </div>
  );
};

export default JourneyCircle;
