import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/hooks/useTranslations';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import LionelCoach from '@/components/LionelCoach';
import StreakDialog from '@/components/StreakDialog';
import XPDetailsDialog from '@/components/XPDetailsDialog';
import { 
  BookOpen, 
  Trophy, 
  Calendar, 
  Heart, 
  Brain, 
  Sparkles,
  LogOut,
  ChevronRight,
  Star,
  Flame,
  Target,
  Zap,
  Play
} from 'lucide-react';

interface UserProgress {
  completed_modules: number;
  total_achievements: number;
  streak_days: number;
  total_xp: number;
  level: number;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
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

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch progress stats
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
        streak_days: 3, // Calculate from activity later
        total_xp: (completedCount || 0) * 50 + (achievementCount || 0) * 100,
        level: Math.floor(((completedCount || 0) * 50 + (achievementCount || 0) * 100) / 1000) + 1
      });
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-reset-r">
          <Sparkles className="w-12 h-12" />
        </div>
      </div>
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
    { title: t.dashboard.continueLesson, icon: BookOpen, href: '/modules', color: 'reset-r' },
    { title: t.dashboard.masterclassLibrary, icon: Play, href: '/masterclasses', color: 'reset-e' },
    { title: t.dashboard.journalEntry, icon: Calendar, href: '/journal', color: 'reset-s' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-reset-r/20 to-reset-e/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-gradient-to-br from-reset-s/20 to-reset-t/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-reset-e2/15 to-reset-r/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden md:block">
        <Sparkles className="absolute top-32 left-20 w-4 h-4 text-reset-r/30 animate-scale-pulse" style={{ animationDelay: '0s' }} />
        <Star className="absolute top-48 right-32 w-3 h-3 text-reset-e/30 animate-scale-pulse" style={{ animationDelay: '1s' }} />
        <Heart className="absolute bottom-64 left-1/4 w-4 h-4 text-reset-s/30 animate-scale-pulse" style={{ animationDelay: '2s' }} />
        <Target className="absolute top-1/3 right-20 w-3 h-3 text-reset-t/30 animate-scale-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="zen-container py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-reset-r" />
            <span className="text-xl font-bold bg-gradient-reset bg-clip-text text-transparent">
              RESET
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/profile">
              <div className="w-8 h-8 rounded-full bg-gradient-reset flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:ring-2 hover:ring-reset-r/50 transition-all hover:scale-110">
                {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-reset-r/10">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="zen-container py-8 relative z-10">
        {/* Welcome section */}
        <section className="mb-12 animate-bounce-in">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/profile">
              <div className="w-16 h-16 rounded-full bg-gradient-reset flex items-center justify-center text-white text-2xl font-bold cursor-pointer hover:ring-4 hover:ring-reset-r/30 transition-all hover:scale-110 shadow-lg" style={{ boxShadow: '0 0 30px hsl(var(--reset-r) / 0.3)' }}>
                {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t.dashboard.welcome}, {profile?.display_name || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {/* Streak */}
            <button 
              onClick={() => setStreakDialogOpen(true)}
              className="bg-card/50 backdrop-blur border-2 rounded-xl p-4 text-center hover-lift animate-bounce-in cursor-pointer text-left"
              style={{ 
                borderColor: `hsl(var(--reset-r))`,
                boxShadow: `0 8px 32px hsl(var(--reset-r) / 0.15)`,
              }}
            >
              <Flame className="w-8 h-8 text-reset-r mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{progress.streak_days}</p>
              <p className="text-sm text-muted-foreground">{t.dashboard.streakDays}</p>
            </button>
            
            {/* Lessons */}
            <div 
              className="bg-card/50 backdrop-blur border-2 rounded-xl p-4 text-center hover-lift animate-bounce-in"
              style={{ 
                borderColor: `hsl(var(--reset-s))`,
                boxShadow: `0 8px 32px hsl(var(--reset-s) / 0.15)`,
                animationDelay: `100ms`
              }}
            >
              <BookOpen className="w-8 h-8 text-reset-s mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{progress.completed_modules}</p>
              <p className="text-sm text-muted-foreground">{t.dashboard.lessonsComplete}</p>
            </div>
            
            {/* XP/Achievements */}
            <button 
              onClick={() => setXpDialogOpen(true)}
              className="bg-card/50 backdrop-blur border-2 rounded-xl p-4 text-center hover-lift animate-bounce-in cursor-pointer text-left"
              style={{ 
                borderColor: `hsl(var(--reset-e))`,
                boxShadow: `0 8px 32px hsl(var(--reset-e) / 0.15)`,
                animationDelay: `200ms`
              }}
            >
              <Star className="w-8 h-8 text-reset-e mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{progress.total_xp}</p>
              <p className="text-sm text-muted-foreground">XP</p>
            </button>
          </div>
        </section>

        {/* RESET Journey Progress */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 animate-bounce-in" style={{ animationDelay: '200ms' }}>{t.dashboard.yourJourney}</h2>
          <div className="space-y-4">
            {resetSteps.map((step, index) => (
              <Link
                key={step.letter}
                to="/modules"
                className="block animate-bounce-in"
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <div 
                  className="bg-card/50 backdrop-blur border-2 rounded-xl p-4 hover:scale-[1.02] transition-all group"
                  style={{ 
                    borderColor: `hsl(var(--${step.color}))`,
                    boxShadow: `0 4px 20px hsl(var(--${step.color}) / 0.1)`
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6"
                      style={{ backgroundColor: `hsl(var(--${step.color}) / 0.2)` }}
                    >
                      <step.icon className={`w-6 h-6 text-${step.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-lg font-bold text-${step.color}`}>
                          {step.letter.replace('2', '')}
                        </span>
                        <span className="font-medium text-foreground">{step.title}</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-${step.color} transition-all`}
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6 animate-bounce-in" style={{ animationDelay: '600ms' }}>{t.dashboard.quickActions}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                to={action.href}
                className="animate-bounce-in"
                style={{ animationDelay: `${(index + 8) * 100}ms` }}
              >
                <div 
                  className="bg-card/50 backdrop-blur border-2 rounded-xl p-6 hover:scale-[1.02] transition-all group h-full"
                  style={{ 
                    borderColor: `hsl(var(--${action.color}))`,
                    boxShadow: `0 4px 20px hsl(var(--${action.color}) / 0.1)`
                  }}
                >
                  <action.icon className={`w-10 h-10 text-${action.color} mb-4 group-hover:scale-110 transition-transform`} />
                  <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>{t.common.continue}</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* AI Coach */}
      <LionelCoach 
        userName={profile?.display_name || undefined}
        currentModule="Rhythm"
        progress={Math.round((progress.completed_modules / 5) * 100)}
      />

      {/* Streak Dialog */}
      <StreakDialog
        open={streakDialogOpen}
        onOpenChange={setStreakDialogOpen}
        currentStreak={progress.streak_days}
        longestStreak={7}
        weeklyActivity={weeklyActivity}
      />

      {/* XP Dialog */}
      <XPDetailsDialog
        open={xpDialogOpen}
        onOpenChange={setXpDialogOpen}
        totalXP={progress.total_xp}
        level={progress.level}
        xpToNextLevel={1000 - (progress.total_xp % 1000)}
        recentActivities={[]}
      />
    </div>
  );
};

export default Dashboard;