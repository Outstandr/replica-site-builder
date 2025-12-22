import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Star, Zap, BookOpen, Trophy, Target, ChevronRight } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface XPActivity {
  id: string;
  type: 'lesson' | 'quiz' | 'journal' | 'streak' | 'achievement';
  title: string;
  xp: number;
  timestamp: Date;
}

interface XPDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  recentActivities: XPActivity[];
}

export const XPDetailsDialog = ({
  open,
  onOpenChange,
  totalXP,
  level,
  xpToNextLevel,
  recentActivities,
}: XPDetailsDialogProps) => {
  const t = useTranslations();
  const [animatedXP, setAnimatedXP] = useState(0);
  
  const xpForCurrentLevel = 1000; // XP needed per level
  const currentLevelProgress = ((xpForCurrentLevel - xpToNextLevel) / xpForCurrentLevel) * 100;

  useEffect(() => {
    if (open) {
      setAnimatedXP(0);
      const timer = setTimeout(() => {
        setAnimatedXP(totalXP);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, totalXP]);

  const getActivityIcon = (type: XPActivity['type']) => {
    switch (type) {
      case 'lesson': return BookOpen;
      case 'quiz': return Target;
      case 'journal': return Zap;
      case 'streak': return Star;
      case 'achievement': return Trophy;
      default: return Star;
    }
  };

  const getActivityColor = (type: XPActivity['type']) => {
    switch (type) {
      case 'lesson': return 'reset-r';
      case 'quiz': return 'reset-e';
      case 'journal': return 'reset-s';
      case 'streak': return 'reset-e2';
      case 'achievement': return 'reset-t';
      default: return 'reset-r';
    }
  };

  const xpBreakdown = [
    { label: t.xp?.lessonsCompleted || 'Lessons Completed', xp: 450, color: 'reset-r' },
    { label: t.xp?.quizzesPassed || 'Quizzes Passed', xp: 300, color: 'reset-e' },
    { label: t.xp?.journalEntries || 'Journal Entries', xp: 150, color: 'reset-s' },
    { label: t.xp?.streakBonuses || 'Streak Bonuses', xp: 100, color: 'reset-e2' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-2 border-reset-e/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Star className="w-6 h-6 text-reset-e" />
            <span>{t.xp?.title || 'Experience Points'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Total XP and Level */}
          <div className="text-center">
            <div className="inline-flex flex-col items-center">
              <div 
                className="w-24 h-24 rounded-full bg-gradient-to-br from-reset-e/20 to-reset-t/20 border-4 border-reset-e flex items-center justify-center mb-3"
                style={{ boxShadow: '0 0 40px hsl(var(--reset-e) / 0.3)' }}
              >
                <span className="text-3xl font-bold text-reset-e">{level}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t.xp?.level || 'Level'}</p>
            </div>
          </div>

          {/* XP Progress to Next Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">{t.xp?.toNextLevel || 'To Next Level'}</p>
              <span className="text-sm text-reset-e font-bold">{animatedXP} XP</span>
            </div>
            <Progress value={currentLevelProgress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {xpToNextLevel} XP {t.xp?.remaining || 'remaining'}
            </p>
          </div>

          {/* XP Breakdown */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">{t.xp?.breakdown || 'XP Breakdown'}</p>
            <div className="space-y-2">
              {xpBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={`text-sm font-medium text-${item.color}`}>+{item.xp} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">{t.xp?.recentActivity || 'Recent Activity'}</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  const color = getActivityColor(activity.type);
                  return (
                    <div 
                      key={activity.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                    >
                      <div className={`w-8 h-8 rounded-full bg-${color}/20 flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 text-${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-sm font-bold text-${color}`}>+{activity.xp}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t.xp?.noRecentActivity || 'Complete lessons to earn XP!'}
                </p>
              )}
            </div>
          </div>

          {/* XP Tips */}
          <div className="bg-gradient-to-r from-reset-e/10 to-reset-t/10 rounded-xl p-4 border border-reset-e/20">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-reset-e flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">{t.xp?.earnMoreXP || 'Earn More XP'}</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    {t.xp?.tipLesson || 'Complete lessons (+50 XP each)'}
                  </li>
                  <li className="flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    {t.xp?.tipQuiz || 'Pass quizzes (+100 XP)'}
                  </li>
                  <li className="flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    {t.xp?.tipStreak || 'Maintain your streak (+25 XP/day)'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default XPDetailsDialog;
