import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/hooks/useTranslations';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles,
  LogOut,
  ChevronLeft,
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
    description: 'Build a strong foundation through structure and rhythm. Learn to create daily rituals that transform your life.',
    icon: Brain,
    color: 'reset-r',
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
    description: 'Break through blockages and reclaim your vital power. Master your energy and overcome limiting patterns.',
    icon: Zap,
    color: 'reset-e',
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
    description: 'Emotional growth and conscious connection. Create sustainable systems for relationships and self-love.',
    icon: Heart,
    color: 'reset-s',
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
    description: 'Put leadership and consistency into practice. Master the art of disciplined action and achievement.',
    icon: Target,
    color: 'reset-e2',
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
    description: 'Identity, mastery, and the embodiment of trust. Complete your transformation into your highest self.',
    icon: Sparkles,
    color: 'reset-t',
    lessons: [
      { id: 't1', title: 'Identity Shift', duration: '25 min' },
      { id: 't2', title: 'Trust Framework', duration: '25 min' },
      { id: 't3', title: 'Mastery Path', duration: '30 min' },
      { id: 't4', title: 'Complete Transformation', duration: '35 min' },
    ]
  },
];

const Modules = () => {
  const { user, signOut, loading } = useAuth();
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-reset-r">
          <Sparkles className="w-12 h-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            <Sparkles className="w-6 h-6 text-reset-r" />
            <span className="text-xl font-bold bg-gradient-reset bg-clip-text text-transparent">
              RESET Modules
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Module Journey */}
        <div className="space-y-4">
          {modules.map((module, index) => {
            const Icon = module.icon;
            const isUnlocked = isModuleUnlocked(index);
            const moduleProgress = progress[module.id];
            const isExpanded = expandedModule === module.id;
            
            return (
              <div key={module.id} className="relative">
                {/* Connection Line */}
                {index < modules.length - 1 && (
                  <div className="absolute left-[26px] top-[60px] bottom-0 w-0.5 bg-gradient-to-b from-border to-transparent h-8 -mb-4" />
                )}
                
                <div
                  className={`bg-card/50 backdrop-blur border rounded-2xl overflow-hidden transition-all ${
                    isUnlocked 
                      ? 'border-border/50 hover:border-border cursor-pointer' 
                      : 'border-border/20 opacity-60'
                  }`}
                >
                  {/* Module Header */}
                  <div 
                    className="p-6 flex items-center gap-4"
                    onClick={() => isUnlocked && setExpandedModule(isExpanded ? null : module.id)}
                  >
                    <div className={`w-14 h-14 rounded-xl bg-${module.color}/20 flex items-center justify-center shrink-0`}>
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
                        <span className="font-semibold text-foreground">{module.title}</span>
                        {moduleProgress?.completed && (
                          <CheckCircle2 className="w-5 h-5 text-reset-s ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{module.subtitle}</p>
                      
                      {/* Progress Bar */}
                      {isUnlocked && (
                        <div className="mt-3 w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-${module.color} transition-all`}
                            style={{ width: `${moduleProgress?.progress_percentage || 0}%` }}
                          />
                        </div>
                      )}
                    </div>
                    
                    {isUnlocked && (
                      <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    )}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && isUnlocked && (
                    <div className="px-6 pb-6 animate-fade-in">
                      <p className="text-foreground/80 mb-6">{module.description}</p>
                      
                      {/* Lessons */}
                      <div className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer group"
                          >
                            <div className={`w-8 h-8 rounded-full bg-${module.color}/20 flex items-center justify-center`}>
                              <PlayCircle className={`w-4 h-4 text-${module.color}`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground group-hover:text-reset-r transition-colors">
                                {lesson.title}
                              </p>
                              <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                            </div>
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>

                      <Button variant="hero" className="w-full mt-6">
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
    </div>
  );
};

export default Modules;
