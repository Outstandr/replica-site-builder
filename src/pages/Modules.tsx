import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';
import MobileLayout from '@/components/layout/MobileLayout';
import MobileHeader from '@/components/layout/MobileHeader';
import PageTransition from '@/components/layout/PageTransition';
import SkeletonCard from '@/components/mobile/SkeletonCard';
import ModuleCard, { ModuleStatus } from '@/components/ModuleCard';
import { 
  Mountain,
  Leaf,
  Zap,
  Heart,
  Flower2
} from 'lucide-react';

interface ModuleProgress {
  module_id: string;
  completed: boolean;
  progress_percentage: number;
}

// Soul Reset Garden module structure
const modules = [
  {
    id: 'execution',
    title: 'Reset by Discipline',
    subtitle: 'The Mountain of Execution',
    description: 'Master the art of disciplined action and build unshakeable consistency in your daily practice.',
    icon: Mountain,
    color: '#F97316', // Orange - execution
    lessons: 4,
  },
  {
    id: 'rhythm',
    title: 'The Reset in You',
    subtitle: 'Bamboo of Rhythm',
    description: 'Discover your natural flow and establish rhythms that support sustainable growth and balance.',
    icon: Leaf,
    color: '#22C55E', // Green - rhythm
    lessons: 4,
  },
  {
    id: 'energy',
    title: 'Reset Your Addiction',
    subtitle: 'Water of Energy',
    description: 'Break free from limiting patterns and reclaim your vital energy for transformation.',
    icon: Zap,
    color: '#3B82F6', // Blue - energy
    lessons: 4,
  },
  {
    id: 'systems',
    title: 'Reset the Love in You',
    subtitle: 'Heart of Systems',
    description: 'Cultivate deep emotional intelligence and build systems for conscious loving relationships.',
    icon: Heart,
    color: '#EC4899', // Pink - systems/love
    lessons: 4,
  },
  {
    id: 'transformation',
    title: 'Reset the Trust in You',
    subtitle: 'Lotus of Transformation',
    description: 'Embrace complete identity transformation and embody unwavering trust in your journey.',
    icon: Flower2,
    color: '#A855F7', // Purple - transformation
    lessons: 4,
  },
];

const Modules = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const t = useTranslations();
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({});
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

  const getModuleStatus = (index: number): ModuleStatus => {
    const module = modules[index];
    const moduleProgress = progress[module.id];
    
    if (moduleProgress?.completed) return 'completed';
    
    // Check if previous module is completed (first module is always unlocked)
    if (index === 0) {
      return moduleProgress?.progress_percentage > 0 ? 'in_progress' : 'available';
    }
    
    const prevModule = modules[index - 1];
    const prevCompleted = progress[prevModule.id]?.completed || false;
    
    if (!prevCompleted) return 'locked';
    
    return moduleProgress?.progress_percentage > 0 ? 'in_progress' : 'available';
  };

  if (loading || isLoading) {
    return (
      <MobileLayout>
        <MobileHeader title="RESET Journey" backPath="/dashboard" />
        <div className="px-4 py-6 space-y-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div 
              key={i} 
              className="h-64 rounded-2xl bg-card/50 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Sticky Header with blur */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <MobileHeader 
          title="RESET Journey" 
          backPath="/dashboard" 
          showLogo 
        />
        
        {/* Subtitle section */}
        <div className="px-4 pb-4">
          <p className="text-muted-foreground text-sm">
            Your path through the five pillars of transformation
          </p>
        </div>
      </div>

      <PageTransition>
        <main className="px-4 py-6">
          {/* Module Cards Grid */}
          <div className="space-y-6">
            {modules.map((module, index) => {
              const Icon = module.icon;
              const moduleProgress = progress[module.id];
              const status = getModuleStatus(index);
              const progressPercent = moduleProgress?.progress_percentage || 0;
              const completedLessons = Math.round((progressPercent / 100) * module.lessons);
              
              return (
                <div 
                  key={module.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ModuleCard
                    id={module.id}
                    title={module.title}
                    subtitle={module.subtitle}
                    description={module.description}
                    status={status}
                    progress={progressPercent}
                    color={module.color}
                    icon={<Icon className="w-7 h-7" />}
                    linkTo={`/module/${module.id}`}
                    lessons={module.lessons}
                    completedLessons={completedLessons}
                  />
                </div>
              );
            })}
          </div>

          {/* Bottom padding for safe area */}
          <div className="h-8" />
        </main>
      </PageTransition>
    </MobileLayout>
  );
};

export default Modules;
