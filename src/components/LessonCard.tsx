import { Link } from "react-router-dom";
import { Lock, CheckCircle, Play, Clock, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

interface LessonCardProps {
  id: string;
  lessonNumber: number;
  title: string;
  description?: string;
  status: LessonStatus;
  duration?: number;
  xpReward?: number;
  linkTo: string;
  hasQuiz?: boolean;
  quizScore?: number;
  className?: string;
}

const LessonCard = ({
  id,
  lessonNumber,
  title,
  description,
  status,
  duration,
  xpReward = 100,
  linkTo,
  hasQuiz,
  quizScore,
  className,
}: LessonCardProps) => {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  const content = (
    <div
      className={cn(
        "relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
        "bg-card border-2 shadow-soft",
        isLocked && "opacity-60 cursor-not-allowed",
        !isLocked && "hover:shadow-medium hover:border-primary/30 cursor-pointer",
        isCompleted && "border-accent/50 bg-accent/5",
        isInProgress && "border-primary/50 bg-primary/5",
        !isLocked && !isCompleted && !isInProgress && "border-border",
        className
      )}
    >
      {/* Lesson number badge */}
      <div
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
          isLocked && "bg-muted text-muted-foreground",
          isCompleted && "bg-accent text-accent-foreground",
          isInProgress && "bg-primary text-primary-foreground",
          !isLocked && !isCompleted && !isInProgress && "bg-primary/20 text-primary"
        )}
      >
        {isLocked ? (
          <Lock className="w-5 h-5" />
        ) : isCompleted ? (
          <CheckCircle className="w-5 h-5" />
        ) : isInProgress ? (
          <Play className="w-5 h-5" />
        ) : (
          lessonNumber
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground truncate">{title}</h4>
        {description && (
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        )}
        
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {duration} min
            </span>
          )}
          {xpReward && (
            <span className="flex items-center gap-1 text-gold">
              <Star className="w-3 h-3" />
              +{xpReward} XP
            </span>
          )}
          {hasQuiz && isCompleted && quizScore !== undefined && (
            <span className="flex items-center gap-1 text-accent">
              <Trophy className="w-3 h-3" />
              Quiz: {quizScore}%
            </span>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex-shrink-0">
        {isCompleted && (
          <div className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
            Completed
          </div>
        )}
        {isInProgress && (
          <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
            Continue
          </div>
        )}
        {!isLocked && !isCompleted && !isInProgress && (
          <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
            Start
          </div>
        )}
      </div>
    </div>
  );

  if (isLocked) {
    return content;
  }

  return <Link to={linkTo}>{content}</Link>;
};

export default LessonCard;
