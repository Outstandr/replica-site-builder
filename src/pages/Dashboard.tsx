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
import JourneyCircle from '@/components/JourneyCircle';
import QuickAccessCard from '@/components/QuickAccessCard';
import DailyFocus from '@/components/DailyFocus';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import SkeletonCard from '@/components/mobile/SkeletonCard';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Brain, 
  Sparkles,
  Star,
  Flame,
  Target,
  Zap,
  Play,
  Heart,
  Library,
  PenLine
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
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(0);

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

      const completed = completedCount || 0;
      const achievements = achievementCount || 0;

      // Simulate which steps are completed based on progress
      const stepsCompleted: number[] = [];
      if (completed >= 1) stepsCompleted.push(0);
      if (completed >= 2) stepsCompleted.push(1);
      if (completed >= 3) stepsCompleted.push(2);
      if (completed >= 4) stepsCompleted.push(3);
      if (completed >= 5) stepsCompleted.push(4);
      
      setCompletedSteps(stepsCompleted);
      setActiveStep(stepsCompleted.length);

      setProgress({
        completed_modules: completed,
        total_achievements: achievements,
        streak_days: 3,
        total_xp: completed * 50 + achievements * 100,
        level: Math.floor((completed * 50 + achievements * 100) / 1000) + 1
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

  const journeyProgress = Math.round((completedSteps.length / 5) * 100);

  const quickAccessItems = [
    {
      title: 'Masterclass Library',
      description: 'Expert-led video lessons',
      icon: Play,
      href: '/masterclasses',
      color: 'hsl(var(--secondary))',
      gradient: 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--primary)))'
    },
    {
      title: 'E-Reader',
      description: 'Your wellness reading library',
      icon: Library,
      href: '/modules',
      color: 'hsl(var(--primary))',
      gradient: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))'
    },
    {
      title: 'Journal',
      description: 'Reflect on your journey',
      icon: PenLine,
      href: '/journal',
      color: 'hsl(var(--accent))',
      gradient: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--secondary)))'
    },
  ];

  return (
    <MobileLayout>
      <MobileHeader 
        title="RESET"
        showLogo
        rightContent={<LanguageSwitcher />}
      />

      <PageTransition>
        <main className="px-4 py-6 space-y-8 pb-24">
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

          {/* Journey Circle Section */}
          <section className="animate-fade-in-up animation-delay-100">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground">{t.dashboard.yourJourney}</h2>
              <p className="text-sm text-muted-foreground">Your path from structure to surrender</p>
            </div>
            
            <div className="flex justify-center">
              <JourneyCircle 
                progress={journeyProgress}
                size={240}
                strokeWidth={10}
                completedSteps={completedSteps}
                activeStep={activeStep}
              />
            </div>

            {/* Journey step labels */}
            <div className="flex justify-center gap-2 mt-6 flex-wrap">
              {[
                { key: 'R', label: 'Rhythm', color: 'hsl(var(--reset-rhythm))' },
                { key: 'E', label: 'Energy', color: 'hsl(var(--reset-energy))' },
                { key: 'S', label: 'Systems', color: 'hsl(var(--reset-systems))' },
                { key: 'E2', label: 'Execution', color: 'hsl(var(--reset-execution))' },
                { key: 'T', label: 'Transformation', color: 'hsl(var(--reset-transformation))' },
              ].map((step, index) => (
                <div 
                  key={step.key}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all",
                    completedSteps.includes(index) ? "bg-card shadow-sm" : "opacity-60"
                  )}
                >
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: step.color }}
                  />
                  <span className="text-muted-foreground">{step.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Daily Focus Section */}
          <section className="animate-fade-in-up animation-delay-200">
            <DailyFocus />
          </section>

          {/* Quick Access Section */}
          <section className="animate-fade-in-up animation-delay-300">
            <h2 className="text-xl font-bold text-foreground mb-4">{t.dashboard.quickActions}</h2>
            <div className="space-y-3">
              {quickAccessItems.map((item, index) => (
                <QuickAccessCard
                  key={item.title}
                  {...item}
                  className={cn(
                    "animate-fade-in-up",
                    `animation-delay-${(index + 4) * 100}`
                  )}
                />
              ))}
            </div>
          </section>

          {/* Continue Learning CTA */}
          <section className="animate-fade-in-up animation-delay-500">
            <Link to="/modules" className="block">
              <div 
                className={cn(
                  "relative overflow-hidden rounded-2xl p-6",
                  "bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%]",
                  "hover:bg-[position:100%_0] transition-all duration-700",
                  "group shadow-glow"
                )}
              >
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-primary-foreground mb-1">
                      {t.dashboard.continueLesson}
                    </h3>
                    <p className="text-primary-foreground/80 text-sm">
                      Pick up where you left off
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </Link>
          </section>
        </main>
      </PageTransition>

      <LionelCoach 
        userName={profile?.display_name || undefined}
        currentModule="Rhythm"
        progress={journeyProgress}
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
