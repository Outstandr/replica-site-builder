import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';
import MobileLayout from '@/components/layout/MobileLayout';
import MobileHeader from '@/components/layout/MobileHeader';
import PageTransition from '@/components/layout/PageTransition';
import LionelCoach from '@/components/LionelCoach';
import StreakDialog from '@/components/StreakDialog';
import XPDetailsDialog from '@/components/XPDetailsDialog';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import SkeletonCard from '@/components/mobile/SkeletonCard';
import { 
  BookOpen, 
  Brain, 
  Sparkles,
  ChevronRight,
  Star,
  Flame,
  Target,
  Zap,
  Play,
  Heart
} from 'lucide-react';

interface UserProgress {
  completed_modules: number;
  total_achievements: number;
  streak_days: number;
  total_xp: number;
  level: number;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const t = useTranslations();
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    completed_modules: 0,
    total_achievements: 0,
    streak_days: 0,
    total_xp: 0,
    level: 1
  });
  const [streakDialogOpen, setStreakDialogOpen] = useState(false);
  const [xpDialogOpen, setXpDialogOpen] = useState(false);
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>([true, true, true, false, false, false, false]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      const { count: completedCount } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', true);

      const { count: achievementCount } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setProgress({
        completed_modules: completedCount || 0,
        total_achievements: achievementCount || 0,
        streak_days: 3,
        total_xp: (completedCount || 0) * 50 + (achievementCount || 0) * 100,
        level: Math.floor(((completedCount || 0) * 50 + (achievementCount || 0) * 100) / 1000) + 1
      });
      setIsLoading(false);
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-primary animate-pulse" />
        </div>
      </MobileLayout>
    );
  }

  const resetSteps = [
    { letter: 'R', title: t.journey.steps.r.title, color: 'reset-r', icon: Brain, progress: 25 },
    { letter: 'E', title: t.journey.steps.e.title, color: 'reset-e', icon: Heart, progress: 0 },
    { letter: 'S', title: t.journey.steps.s.title, color: 'reset-s', icon: Sparkles, progress: 0 },
    { letter: 'E2', title: t.journey.steps.e2.title, color: 'reset-e2', icon: Zap, progress: 0 },
    { letter: 'T', title: t.journey.steps.t.title, color: 'reset-t', icon: Target, progress: 0 },
  ];

  const quickActions = [
    { title: t.dashboard.continueLesson, icon: BookOpen, href: '/modules', color: 'primary' },
    { title: t.dashboard.masterclassLibrary, icon: Play, href: '/masterclasses', color: 'secondary' },
    { title: t.dashboard.journalEntry, icon: Star, href: '/journal', color: 'accent' },
  ];

  return (
    <MobileLayout>
      <MobileHeader 
        title={t.dashboard.welcome.replace('{name}', '')}
        showLogo
        rightContent={<LanguageSwitcher />}
      />

      <PageTransition>
        <main className="px-4 py-6 space-y-8">
          {/* Welcome Section */}
          <section className="animate-fade-in-up">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/profile">
                <div 
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-glow hover:scale-110 transition-transform active:scale-95"
                >
                  {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground truncate">
                  {t.dashboard.welcome.replace('{name}', profile?.display_name || user?.email?.split('@')[0] || '')}
                </h1>
                <p className="text-muted-foreground text-sm">{t.dashboard.subtitle}</p>
              </div>
            </div>

            {/* Stats Grid */}
            {isLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(i => <SkeletonCard key={i} variant="stat" />)}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => setStreakDialogOpen(true)}
                  className="bg-card/80 backdrop-blur-sm border-2 border-destructive/30 rounded-2xl p-4 text-center hover:scale-105 active:scale-95 transition-all shadow-soft"
                >
                  <Flame className="w-7 h-7 text-destructive mx-auto mb-2" />
                  <p className="text-xl font-bold text-foreground">{progress.streak_days}</p>
                  <p className="text-xs text-muted-foreground">{t.dashboard.streakDays}</p>
                </button>
                
                <div className="bg-card/80 backdrop-blur-sm border-2 border-accent/30 rounded-2xl p-4 text-center shadow-soft">
                  <BookOpen className="w-7 h-7 text-accent mx-auto mb-2" />
                  <p className="text-xl font-bold text-foreground">{progress.completed_modules}</p>
                  <p className="text-xs text-muted-foreground">{t.dashboard.lessonsComplete}</p>
                </div>
                
                <button 
                  onClick={() => setXpDialogOpen(true)}
                  className="bg-card/80 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-4 text-center hover:scale-105 active:scale-95 transition-all shadow-soft"
                >
                  <Star className="w-7 h-7 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold text-foreground">{progress.total_xp}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </button>
              </div>
            )}
          </section>

          {/* RESET Journey Progress */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.dashboard.yourJourney}</h2>
            <div className="space-y-3">
              {resetSteps.map((step, index) => (
                <Link
                  key={step.letter}
                  to="/modules"
                  className="block animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 hover:scale-[1.02] active:scale-[0.98] transition-all group shadow-soft">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-primary">
                            {step.letter.replace('2', '')}
                          </span>
                          <span className="font-medium text-foreground truncate">{step.title}</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all rounded-full"
                            style={{ width: `${step.progress}%` }}
                          />
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">{t.dashboard.quickActions}</h2>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, index) => (
                <Link
                  key={action.title}
                  to={action.href}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${(index + 5) * 100}ms` }}
                >
                  <div className={`bg-card/80 backdrop-blur-sm border-2 border-${action.color}/30 rounded-2xl p-5 hover:scale-[1.02] active:scale-[0.98] transition-all group shadow-soft`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-${action.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <action.icon className={`w-6 h-6 text-${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{t.common.continue}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </PageTransition>

      <LionelCoach 
        userName={profile?.display_name || undefined}
        currentModule="Rhythm"
        progress={Math.round((progress.completed_modules / 5) * 100)}
      />

      <StreakDialog
        open={streakDialogOpen}
        onOpenChange={setStreakDialogOpen}
        currentStreak={progress.streak_days}
        longestStreak={7}
        weeklyActivity={weeklyActivity}
      />

      <XPDetailsDialog
        open={xpDialogOpen}
        onOpenChange={setXpDialogOpen}
        totalXP={progress.total_xp}
        level={progress.level}
        xpToNextLevel={1000 - (progress.total_xp % 1000)}
        recentActivities={[]}
      />
    </MobileLayout>
  );
};

export default Dashboard;