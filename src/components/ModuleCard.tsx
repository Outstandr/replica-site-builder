import { Link } from "react-router-dom";
import { Lock, CheckCircle, Play, ChevronRight } from "lucide-react";
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
        "relative group rounded-2xl p-6 transition-all duration-300",
        "bg-card border-2 shadow-soft hover:shadow-medium",
        isLocked ? "opacity-60 cursor-not-allowed" : "hover-lift cursor-pointer",
        isCompleted && "border-accent/50",
        isInProgress && "border-primary/50",
        !isLocked && !isCompleted && !isInProgress && "border-border hover:border-primary/30"
      )}
    >
      {/* Status badge */}
      <div className="absolute top-4 right-4">
        {isLocked && (
          <div className="p-2 rounded-full bg-muted">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        {isCompleted && (
          <div className="p-2 rounded-full bg-accent/20">
            <CheckCircle className="w-4 h-4 text-accent" />
          </div>
        )}
        {isInProgress && (
          <div className="p-2 rounded-full bg-primary/20">
            <Play className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>

      {/* Icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-2">{subtitle}</p>
      <p className="text-sm text-muted-foreground/80 mb-4 line-clamp-2">{description}</p>

      {/* Progress bar */}
      {!isLocked && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{completedLessons}/{lessons} lessons</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: color }}
            />
          </div>
        </div>
      )}

      {/* Action button */}
      {!isLocked ? (
        <Link to={linkTo}>
          <Button 
            variant="ghost" 
            className="w-full justify-between group-hover:bg-primary/10"
            style={{ color }}
          >
            <span>{isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      ) : (
        <Button variant="ghost" disabled className="w-full justify-between opacity-50">
          <span>Locked</span>
          <Lock className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default ModuleCard;
