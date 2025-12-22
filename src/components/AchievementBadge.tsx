import { Trophy, Star, Flame, Book, Target, Award, Zap, Crown, Shield, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export type AchievementType = 
  | 'first_lesson' 
  | 'module_complete' 
  | 'streak_7' 
  | 'streak_30' 
  | 'quiz_perfect' 
  | 'all_modules' 
  | 'book_complete'
  | 'journal_streak'
  | 'xp_1000'
  | 'xp_5000';

interface AchievementBadgeProps {
  type: AchievementType;
  unlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const achievementConfig: Record<AchievementType, {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}> = {
  first_lesson: {
    icon: <Star className="w-full h-full" />,
    label: 'First Steps',
    description: 'Complete your first lesson',
    color: 'text-gold',
    bgColor: 'bg-gold/20',
  },
  module_complete: {
    icon: <Trophy className="w-full h-full" />,
    label: 'Module Master',
    description: 'Complete a full module',
    color: 'text-accent',
    bgColor: 'bg-accent/20',
  },
  streak_7: {
    icon: <Flame className="w-full h-full" />,
    label: 'Week Warrior',
    description: '7 day learning streak',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/20',
  },
  streak_30: {
    icon: <Crown className="w-full h-full" />,
    label: 'Month Master',
    description: '30 day learning streak',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/20',
  },
  quiz_perfect: {
    icon: <Target className="w-full h-full" />,
    label: 'Perfect Score',
    description: 'Get 100% on a quiz',
    color: 'text-primary',
    bgColor: 'bg-primary/20',
  },
  all_modules: {
    icon: <Award className="w-full h-full" />,
    label: 'RESET Master',
    description: 'Complete all modules',
    color: 'text-reset-transformation',
    bgColor: 'bg-reset-transformation/20',
  },
  book_complete: {
    icon: <Book className="w-full h-full" />,
    label: 'Scholar',
    description: 'Complete all book lessons',
    color: 'text-reset-systems',
    bgColor: 'bg-reset-systems/20',
  },
  journal_streak: {
    icon: <Heart className="w-full h-full" />,
    label: 'Reflective Soul',
    description: 'Write 10 journal entries',
    color: 'text-cinnabar',
    bgColor: 'bg-cinnabar/20',
  },
  xp_1000: {
    icon: <Zap className="w-full h-full" />,
    label: 'Rising Star',
    description: 'Earn 1,000 XP',
    color: 'text-gold',
    bgColor: 'bg-gold/20',
  },
  xp_5000: {
    icon: <Shield className="w-full h-full" />,
    label: 'Legendary',
    description: 'Earn 5,000 XP',
    color: 'text-secondary',
    bgColor: 'bg-secondary/20',
  },
};

const AchievementBadge = ({
  type,
  unlocked = false,
  size = 'md',
  showLabel = false,
  className,
}: AchievementBadgeProps) => {
  const config = achievementConfig[type];
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const iconSizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center transition-all duration-300",
          sizeClasses[size],
          iconSizeClasses[size],
          unlocked ? config.bgColor : 'bg-muted',
          unlocked ? config.color : 'text-muted-foreground',
          unlocked && 'shadow-md hover:scale-110',
          !unlocked && 'opacity-50 grayscale'
        )}
        title={config.description}
      >
        {config.icon}
      </div>
      
      {showLabel && (
        <span
          className={cn(
            "text-xs font-medium text-center",
            unlocked ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {config.label}
        </span>
      )}
    </div>
  );
};

export default AchievementBadge;
