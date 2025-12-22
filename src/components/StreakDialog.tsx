import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Flame, Calendar, Trophy, Target, Sparkles } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface StreakDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStreak: number;
  longestStreak: number;
  weeklyActivity: boolean[];
}

export const StreakDialog = ({
  open,
  onOpenChange,
  currentStreak,
  longestStreak,
  weeklyActivity,
}: StreakDialogProps) => {
  const t = useTranslations();
  const [animatedStreak, setAnimatedStreak] = useState(0);
  
  useEffect(() => {
    if (open) {
      setAnimatedStreak(0);
      const timer = setTimeout(() => {
        setAnimatedStreak(currentStreak);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, currentStreak]);

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const streakGoal = 7;
  const progressToGoal = Math.min((currentStreak / streakGoal) * 100, 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-2 border-reset-r/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Flame className="w-6 h-6 text-reset-r" />
            <span>{t.streak?.title || 'Your Streak'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Streak Display */}
          <div className="text-center">
            <div 
              className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-reset-r/20 to-reset-e/20 border-4 border-reset-r animate-pulse"
              style={{ boxShadow: '0 0 40px hsl(var(--reset-r) / 0.3)' }}
            >
              <div>
                <span className="text-5xl font-bold text-reset-r">{animatedStreak}</span>
                <p className="text-sm text-muted-foreground">{t.streak?.days || 'days'}</p>
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">{t.streak?.thisWeek || 'This Week'}</p>
            <div className="flex justify-between gap-2">
              {daysOfWeek.map((day, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      weeklyActivity[index] 
                        ? 'bg-reset-r text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {weeklyActivity[index] ? (
                      <Flame className="w-4 h-4" />
                    ) : (
                      <span className="text-xs">{day}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress to Goal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">{t.streak?.weeklyGoal || 'Weekly Goal'}</p>
              <span className="text-sm text-muted-foreground">{currentStreak}/{streakGoal} {t.streak?.days || 'days'}</span>
            </div>
            <Progress value={progressToGoal} className="h-3" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <Trophy className="w-6 h-6 text-reset-e mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{longestStreak}</p>
              <p className="text-xs text-muted-foreground">{t.streak?.longestStreak || 'Longest Streak'}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <Target className="w-6 h-6 text-reset-s mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{streakGoal - currentStreak > 0 ? streakGoal - currentStreak : 0}</p>
              <p className="text-xs text-muted-foreground">{t.streak?.daysToGoal || 'Days to Goal'}</p>
            </div>
          </div>

          {/* Motivation */}
          <div className="bg-gradient-to-r from-reset-r/10 to-reset-e/10 rounded-xl p-4 border border-reset-r/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-reset-r flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                {currentStreak >= streakGoal 
                  ? (t.streak?.goalReached || "Amazing! You've reached your weekly goal. Keep the momentum going!")
                  : (t.streak?.keepGoing || "You're doing great! Keep showing up every day to build your streak.")}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakDialog;
