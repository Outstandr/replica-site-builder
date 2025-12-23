import { Link } from "react-router-dom";
import { Lock, ArrowRight, CheckCircle } from "lucide-react";
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

  return (
    <div
      className={cn(
        "relative rounded-2xl p-[2px] transition-all duration-300",
        isLocked ? "opacity-50 grayscale cursor-not-allowed" : "hover-lift cursor-pointer",
        isInProgress && "ring-4 ring-offset-2 ring-offset-background shadow-neon",
        isCompleted && "ring-2 ring-accent/50",
        "bg-gradient-to-br from-primary/60 via-secondary/60 to-accent/60"
      )}
      style={{
        boxShadow: isInProgress ? `0 0 30px ${color}40, 0 0 0 4px ${color}40` : undefined,
      }}
    >
      {/* Animated shimmer overlay for in-progress */}
      {isInProgress && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 animate-shimmer opacity-30" />
        </div>
      )}
      
      {/* Color accent bar */}
      <div 
        className={cn(
          "absolute top-0 left-4 right-4 h-1 rounded-b-full",
          isInProgress && "animate-gradient"
        )}
        style={{ backgroundColor: color }}
      />
      
      <div className="relative rounded-[14px] bg-card p-6 h-full">
        {/* Status badge */}
        {isCompleted && (
          <div className="absolute top-4 right-4">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <CheckCircle className="w-5 h-5" style={{ color }} />
            </div>
          </div>
        )}
        
        {/* Icon with animation */}
        <div
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform",
            isInProgress && "animate-scale-pulse"
          )}
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-foreground mb-1">{title}</h3>
        <p 
          className="text-sm font-semibold mb-3"
          style={{ color }}
        >
          {subtitle}
        </p>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">{description}</p>

        {/* Progress bar */}
        {!isLocked && (
          <div className="mb-5">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{completedLessons}/{lessons} lessons</span>
              <span className="font-semibold" style={{ color }}>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${progress}%`, 
                  backgroundColor: color,
                  boxShadow: progress > 0 ? `0 0 8px ${color}` : undefined
                }}
              />
            </div>
          </div>
        )}

        {/* Action button */}
        {!isLocked ? (
          <Link to={linkTo} className="block">
            <Button 
              className={cn(
                "w-full h-12 rounded-full font-semibold text-white",
                "bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%]",
                "hover:bg-[position:100%_0] transition-all duration-500",
                "flex items-center justify-center gap-2",
                isInProgress && "shadow-neon"
              )}
              style={{
                boxShadow: isInProgress ? `0 4px 20px ${color}50` : undefined
              }}
            >
              <span>{isCompleted ? 'Review Journey' : isInProgress ? 'Continue Journey' : 'Start Journey'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <Button 
            disabled 
            className="w-full h-12 rounded-full font-semibold bg-muted text-muted-foreground flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Complete Previous Module</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ModuleCard;
