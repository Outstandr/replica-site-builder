import { Link } from "react-router-dom";
import { Lock, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed';

interface ModuleCardProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: ModuleStatus;
  progress?: number;
  color: string;
  icon: React.ReactNode;
  linkTo: string;
  lessons?: number;
  completedLessons?: number;
}

const ModuleCard = ({
  id,
  title,
  subtitle,
  description,
  status,
  progress = 0,
  color,
  icon,
  linkTo,
  lessons = 0,
  completedLessons = 0,
}: ModuleCardProps) => {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';
  const isActive = isInProgress || status === 'available';

  return (
    <div
      className={cn(
        "relative rounded-3xl transition-all duration-500 group",
        isLocked ? "opacity-60 grayscale cursor-not-allowed" : "cursor-pointer",
        isInProgress && "scale-[1.02]",
        !isLocked && "hover:scale-[1.01] active:scale-[0.99]"
      )}
    >
      {/* Outer glow for active/in-progress */}
      {isInProgress && (
        <div 
          className="absolute -inset-1 rounded-3xl opacity-50 blur-xl animate-pulse"
          style={{ backgroundColor: color }}
        />
      )}
      
      {/* Main card container */}
      <div
        className={cn(
          "relative rounded-3xl overflow-hidden",
          isInProgress && "ring-4 ring-offset-2 ring-offset-background",
          isCompleted && "ring-2 ring-offset-1 ring-offset-background"
        )}
        style={{
          // @ts-ignore - ringColor works with Tailwind's ring utilities
          ['--tw-ring-color' as string]: isInProgress || isCompleted ? `${color}80` : undefined,
          boxShadow: isInProgress 
            ? `0 0 40px ${color}40, 0 20px 40px -10px ${color}30`
            : isActive
            ? `0 10px 30px -10px ${color}30`
            : undefined
        }}
      >
        {/* Gradient border effect */}
        <div 
          className={cn(
            "absolute inset-0 rounded-3xl p-[2px]",
            "bg-gradient-to-br from-white/20 via-transparent to-white/10"
          )}
        />
        
        {/* Animated shimmer overlay for in-progress */}
        {isInProgress && (
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-10">
            <div 
              className="absolute inset-0 animate-shimmer opacity-20"
              style={{ 
                background: `linear-gradient(90deg, transparent 0%, ${color}40 50%, transparent 100%)`,
                backgroundSize: '200% 100%'
              }}
            />
          </div>
        )}
        
        {/* Color accent bar at top */}
        <div 
          className={cn(
            "absolute top-0 left-0 right-0 h-1.5 z-20",
            isInProgress && "animate-gradient"
          )}
          style={{ 
            background: isLocked 
              ? 'hsl(var(--muted))' 
              : `linear-gradient(90deg, ${color}, ${color}CC, ${color})`
          }}
        />
        
        {/* Card background */}
        <div className="relative bg-card rounded-3xl">
          {/* Subtle gradient overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03] rounded-3xl"
            style={{ 
              background: `radial-gradient(ellipse at top right, ${color}, transparent 70%)`
            }}
          />
          
          <div className="relative p-6">
            {/* Status badge */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {isCompleted && (
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Complete</span>
                </div>
              )}
              {isInProgress && (
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>In Progress</span>
                </div>
              )}
              {isLocked && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked</span>
                </div>
              )}
            </div>
            
            {/* Icon with animation */}
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300",
                isInProgress && "animate-scale-pulse",
                !isLocked && "group-hover:scale-110 group-hover:rotate-3"
              )}
              style={{ 
                backgroundColor: isLocked ? 'hsl(var(--muted))' : `${color}15`,
                color: isLocked ? 'hsl(var(--muted-foreground))' : color,
                boxShadow: isActive ? `0 8px 20px -5px ${color}40` : undefined
              }}
            >
              {isLocked ? <Lock className="w-7 h-7" /> : icon}
            </div>

            {/* Content */}
            <h3 
              className={cn(
                "text-2xl font-black mb-1.5 transition-colors",
                isLocked ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {title}
            </h3>
            <p 
              className="text-base font-bold mb-3"
              style={{ color: isLocked ? 'hsl(var(--muted-foreground))' : color }}
            >
              {subtitle}
            </p>
            <p 
              className={cn(
                "text-sm leading-relaxed mb-5",
                isLocked ? "text-muted-foreground/70" : "text-foreground/70"
              )}
            >
              {description}
            </p>

            {/* Progress bar */}
            {!isLocked && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground font-medium">
                    {completedLessons} of {lessons} lessons
                  </span>
                  <span 
                    className="font-bold"
                    style={{ color }}
                  >
                    {progress}%
                  </span>
                </div>
                <div 
                  className="h-3 rounded-full overflow-hidden border-2"
                  style={{ 
                    backgroundColor: `${color}10`,
                    borderColor: `${color}30`
                  }}
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                    )}
                    style={{ 
                      width: `${progress}%`, 
                      backgroundColor: color,
                      boxShadow: progress > 0 ? `0 0 12px ${color}` : undefined
                    }}
                  >
                    {/* Shimmer on progress bar */}
                    {progress > 0 && (
                      <div 
                        className="absolute inset-0 animate-shimmer"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                          backgroundSize: '200% 100%'
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action button */}
            {!isLocked ? (
              <Link to={linkTo} className="block">
                <Button 
                  className={cn(
                    "w-full h-14 rounded-2xl font-bold text-base",
                    "flex items-center justify-center gap-3",
                    "transition-all duration-300",
                    "text-white"
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`,
                    boxShadow: isInProgress 
                      ? `0 8px 25px -5px ${color}60` 
                      : `0 4px 15px -3px ${color}40`
                  }}
                >
                  <span>
                    {isCompleted ? 'Review Journey' : isInProgress ? 'Continue Journey' : 'Start Journey'}
                  </span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            ) : (
              <Button 
                disabled 
                className="w-full h-14 rounded-2xl font-bold text-base bg-muted text-muted-foreground flex items-center justify-center gap-3 cursor-not-allowed"
              >
                <Lock className="w-5 h-5" />
                <span>Complete Previous Module</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;
