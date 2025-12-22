import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/hooks/useTranslations';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
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
  Zap
} from 'lucide-react';

interface UserProgress {
  completed_modules: number;
  total_achievements: number;
  streak_days: number;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const t = useTranslations();
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    completed_modules: 0,
    total_achievements: 0,
    streak_days: 0
  });

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
        streak_days: 0 // Calculate from activity later
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
    { title: t.dashboard.journalEntry, icon: Calendar, href: '/journal', color: 'reset-s' },
    { title: t.dashboard.achievements, icon: Trophy, href: '/achievements', color: 'reset-e' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-reset-r" />
            <span className="text-xl font-bold bg-gradient-reset bg-clip-text text-transparent">
              RESET
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/profile">
              <div className="w-8 h-8 rounded-full bg-gradient-reset flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:ring-2 hover:ring-reset-r/50 transition-all">
                {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome section */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/profile">
              <div className="w-16 h-16 rounded-full bg-gradient-reset flex items-center justify-center text-white text-2xl font-bold cursor-pointer hover:ring-4 hover:ring-reset-r/30 transition-all">
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
            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4 text-center">
              <Flame className="w-8 h-8 text-reset-r mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{progress.streak_days}</p>
              <p className="text-sm text-muted-foreground">{t.dashboard.streakDays}</p>
            </div>
            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4 text-center">
              <BookOpen className="w-8 h-8 text-reset-s mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{progress.completed_modules}</p>
              <p className="text-sm text-muted-foreground">{t.dashboard.lessonsComplete}</p>
            </div>
            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4 text-center">
              <Star className="w-8 h-8 text-reset-e mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{progress.total_achievements}</p>
              <p className="text-sm text-muted-foreground">{t.dashboard.achievements}</p>
            </div>
          </div>
        </section>

        {/* RESET Journey Progress */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">{t.dashboard.yourJourney}</h2>
          <div className="space-y-4">
            {resetSteps.map((step) => (
              <Link
                key={step.letter}
                to="/modules"
                className="block bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4 hover:border-border transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${step.color}/20 flex items-center justify-center`}>
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
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">{t.dashboard.quickActions}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.href}
                className={`bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6 hover:border-${action.color}/50 transition-all group`}
              >
                <action.icon className={`w-10 h-10 text-${action.color} mb-4`} />
                <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  <span>{t.common.continue}</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
