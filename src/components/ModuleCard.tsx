import { Link } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
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
        isLocked ? "opacity-60 cursor-not-allowed" : "hover-lift cursor-pointer",
        "bg-gradient-to-br from-cyan-400 via-cyan-300 to-cyan-400"
      )}
    >
      <div className="relative rounded-[14px] bg-card p-6 h-full">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
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
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{description}</p>

        {/* Action button */}
        {!isLocked ? (
          <Link to={linkTo} className="block">
            <Button 
              className={cn(
                "w-full h-12 rounded-full font-semibold text-white",
                "bg-gradient-to-r from-primary via-purple-500 to-primary",
                "hover:opacity-90 transition-opacity",
                "flex items-center justify-center gap-2"
              )}
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
            <span>Locked</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ModuleCard;
