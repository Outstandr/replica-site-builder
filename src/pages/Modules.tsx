import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';
import MobileLayout from '@/components/layout/MobileLayout';
import MobileHeader from '@/components/layout/MobileHeader';
import PageTransition from '@/components/layout/PageTransition';
import SkeletonCard from '@/components/mobile/SkeletonCard';
import { Button } from '@/components/ui/button';
import { 
  Sparkles,
  ChevronRight,
  Lock,
  CheckCircle2,
  PlayCircle,
  Brain,
  Heart,
  Zap,
  Target,
  BookOpen
} from 'lucide-react';

interface ModuleProgress {
  module_id: string;
  completed: boolean;
  progress_percentage: number;
}

const modules = [
  {
    id: 'rhythm',
    letter: 'R',
    title: 'Rhythm',
    subtitle: 'The Reset in You',
    description: 'Build a strong foundation through structure and rhythm.',
    icon: Brain,
    color: 'primary',
    lessons: [
      { id: 'r1', title: 'Introduction to Rhythm', duration: '15 min' },
      { id: 'r2', title: 'Morning Rituals', duration: '20 min' },
      { id: 'r3', title: 'Building Structure', duration: '25 min' },
      { id: 'r4', title: 'Consistency Practice', duration: '30 min' },
    ]
  },
  {
    id: 'energy',
    letter: 'E',
    title: 'Energy',
    subtitle: 'Reset Your Addiction',
    description: 'Break through blockages and reclaim your vital power.',
    icon: Zap,
    color: 'secondary',
    lessons: [
      { id: 'e1', title: 'Understanding Energy', duration: '20 min' },
      { id: 'e2', title: 'Breaking Patterns', duration: '25 min' },
      { id: 'e3', title: 'Vital Force', duration: '20 min' },
      { id: 'e4', title: 'Energy Mastery', duration: '30 min' },
    ]
  },
  {
    id: 'systems',
    letter: 'S',
    title: 'Systems',
    subtitle: 'Reset the Love in You',
    description: 'Emotional growth and conscious connection.',
    icon: Heart,
    color: 'accent',
    lessons: [
      { id: 's1', title: 'Systems of Love', duration: '20 min' },
      { id: 's2', title: 'Emotional Intelligence', duration: '25 min' },
      { id: 's3', title: 'Conscious Connection', duration: '20 min' },
      { id: 's4', title: 'Relationship Mastery', duration: '30 min' },
    ]
  },
  {
    id: 'execution',
    letter: 'E',
    title: 'Execution',
    subtitle: 'Reset by Discipline',
    description: 'Put leadership and consistency into practice.',
    icon: Target,
    color: 'primary',
    lessons: [
      { id: 'ex1', title: 'The Power of Discipline', duration: '20 min' },
      { id: 'ex2', title: 'Action Framework', duration: '25 min' },
      { id: 'ex3', title: 'Leadership Principles', duration: '25 min' },
      { id: 'ex4', title: 'Execution Mastery', duration: '30 min' },
    ]
  },
  {
    id: 'transformation',
    letter: 'T',
    title: 'Transformation',
    subtitle: 'Reset the Trust in You',
    description: 'Identity, mastery, and the embodiment of trust.',
    icon: Sparkles,
    color: 'secondary',
    lessons: [
      { id: 't1', title: 'Identity Shift', duration: '25 min' },
      { id: 't2', title: 'Trust Framework', duration: '25 min' },
      { id: 't3', title: 'Mastery Path', duration: '30 min' },
      { id: 't4', title: 'Complete Transformation', duration: '35 min' },
    ]
  },
];

const Modules = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const t = useTranslations();
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({});
  const [expandedModule, setExpandedModule] = useState<string | null>('rhythm');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (data) {
        const progressMap: Record<string, ModuleProgress> = {};
        data.forEach((p) => {
          if (!p.lesson_id) {
            progressMap[p.module_id] = {
              module_id: p.module_id,
              completed: p.completed || false,
              progress_percentage: p.progress_percentage || 0,
            };
          }
        });
        setProgress(progressMap);
      }
      setIsLoading(false);
    };

    fetchProgress();
  }, [user]);

  const isModuleUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevModule = modules[index - 1];
    return progress[prevModule.id]?.completed || false;
  };

  if (loading || isLoading) {
    return (
      <MobileLayout>
        <MobileHeader title="RESET Modules" backPath="/dashboard" />
        <div className="px-4 py-6 space-y-4">
          {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} variant="module" />)}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <MobileHeader title="RESET Modules" backPath="/dashboard" showLogo />

      <PageTransition>
        <main className="px-4 py-6">
          <div className="space-y-4">
            {modules.map((module, index) => {
              const Icon = module.icon;
              const isUnlocked = isModuleUnlocked(index);
              const moduleProgress = progress[module.id];
              const isExpanded = expandedModule === module.id;
              
              return (
                <div 
                  key={module.id} 
                  className="relative animate-fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Connection Line */}
                  {index < modules.length - 1 && (
                    <div className="absolute left-7 top-[72px] w-0.5 h-6 bg-gradient-to-b from-primary/30 to-transparent" />
                  )}
                  
                  <div
                    className={`bg-card/80 backdrop-blur-sm border-2 rounded-2xl overflow-hidden transition-all shadow-soft ${
                      isUnlocked 
                        ? 'hover:scale-[1.01] active:scale-[0.99]' 
                        : 'opacity-60'
                    }`}
                    style={{ 
                      borderColor: isUnlocked ? `hsl(var(--${module.color}))` : 'hsl(var(--border))',
                    }}
                  >
                    {/* Module Header */}
                    <button 
                      className="w-full p-5 flex items-center gap-4 text-left"
                      onClick={() => isUnlocked && setExpandedModule(isExpanded ? null : module.id)}
                      disabled={!isUnlocked}
                    >
                      <div 
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${isExpanded ? 'scale-110 rotate-3' : ''}`}
                        style={{ backgroundColor: `hsl(var(--${module.color}) / 0.15)` }}
                      >
                        {isUnlocked ? (
                          <Icon className={`w-7 h-7 text-${module.color}`} />
                        ) : (
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-lg font-bold text-${module.color}`}>
                            {module.letter}
                          </span>
                          <span className="font-semibold text-foreground truncate">{module.title}</span>
                          {moduleProgress?.completed && (
                            <CheckCircle2 className="w-5 h-5 text-accent ml-auto shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{module.subtitle}</p>
                        
                        {isUnlocked && (
                          <div className="mt-2 w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-${module.color} rounded-full transition-all`}
                              style={{ width: `${moduleProgress?.progress_percentage || 0}%` }}
                            />
                          </div>
                        )}
                      </div>
                      
                      {isUnlocked && (
                        <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                      )}
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && isUnlocked && (
                      <div className="px-5 pb-5 animate-fade-in">
                        <p className="text-foreground/80 mb-4 text-sm">{module.description}</p>
                        
                        <div className="space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50 hover:bg-background/80 transition-colors group"
                            >
                              <div 
                                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `hsl(var(--${module.color}) / 0.15)` }}
                              >
                                <PlayCircle className={`w-4 h-4 text-${module.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm truncate">
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                              </div>
                              <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                            </div>
                          ))}
                        </div>

                        <Button className="w-full mt-4" size="lg">
                          {moduleProgress?.progress_percentage > 0 ? t.dashboard.resumeModule : t.dashboard.startModule}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </PageTransition>
    </MobileLayout>
  );
};

export default Modules;