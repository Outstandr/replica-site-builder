import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Lock, CheckCircle, Star, Trophy, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/hooks/useTranslations";
import { useModuleProgress } from "@/hooks/useModuleProgress";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import ProgressPath from "@/components/ProgressPath";
import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import SkeletonCard from "@/components/mobile/SkeletonCard";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  lesson_number: number;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  video_url: string | null;
  content: string | null;
}

const moduleConfig: Record<string, { title: string; color: string; bgColor: string }> = {
  rhythm: { title: "Rhythm", color: "hsl(var(--reset-rhythm))", bgColor: "bg-reset-rhythm" },
  energy: { title: "Energy", color: "hsl(var(--reset-energy))", bgColor: "bg-reset-energy" },
  systems: { title: "Systems", color: "hsl(var(--reset-systems))", bgColor: "bg-reset-systems" },
  execution: { title: "Execution", color: "hsl(var(--reset-execution))", bgColor: "bg-reset-execution" },
  transformation: { title: "Transformation", color: "hsl(var(--reset-transformation))", bgColor: "bg-reset-transformation" },
};

const ModuleJourney = () => {
  const { moduleName } = useParams<{ moduleName: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const translations = useTranslations();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { progressPercentage, lessons: lessonProgress, completedLessons, totalLessons } = useModuleProgress(moduleName || "");
  
  const config = moduleConfig[moduleName || ""] || moduleConfig.rhythm;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!moduleName) return;

      try {
        const { data, error } = await supabase
          .from("masterclass_lessons")
          .select("id, lesson_number, title, description, duration_minutes, video_url, content")
          .eq("module_name", moduleName)
          .order("lesson_number");

        if (error) throw error;
        setLessons(data || []);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, [moduleName]);

  const getLessonStatus = (lessonId: string, index: number) => {
    const progress = lessonProgress.find(p => p.lesson_id === lessonId);
    if (progress?.completed) return "completed";
    
    if (index === 0) return "available";
    
    const prevLesson = lessons[index - 1];
    const prevProgress = lessonProgress.find(p => p.lesson_id === prevLesson?.id);
    if (prevProgress?.completed) return "available";
    
    return "locked";
  };

  const pathNodes = lessons.map((lesson, index) => ({
    id: lesson.id,
    lessonNumber: lesson.lesson_number,
    title: lesson.title,
    status: getLessonStatus(lesson.id, index) as "locked" | "available" | "in_progress" | "completed",
    xpReward: 100,
  }));

  const handleNodeClick = (node: { id: string; status: string }) => {
    if (node.status !== "locked") {
      const lesson = lessons.find(l => l.id === node.id);
      if (lesson?.video_url) {
        navigate(`/masterclass/${moduleName}/${node.id}`);
      } else if (lesson?.content) {
        navigate(`/book/${moduleName}/${node.id}`);
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <MobileHeader 
          title={config.title} 
          subtitle="Loading..." 
          backPath="/dashboard"
          accentColor={config.color}
        />
        <main className="px-4 py-6 space-y-4">
          <SkeletonCard variant="module" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <SkeletonCard key={i} variant="lesson" />
            ))}
          </div>
        </main>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader 
        title={config.title} 
        subtitle={`${completedLessons}/${totalLessons} lessons • ${progressPercentage}% complete`}
        backPath="/dashboard"
        accentColor={config.color}
      />

      <main className="px-4 py-6">
        {/* Progress overview */}
        <div 
          className="mb-6 p-5 rounded-2xl border-2 animate-fade-in-up"
          style={{ 
            borderColor: `${config.color}30`,
            background: `linear-gradient(135deg, ${config.color}05, ${config.color}10)`
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <Trophy className="w-6 h-6" style={{ color: config.color }} />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Your Progress</h2>
                <p className="text-sm text-muted-foreground">Keep going!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold" style={{ color: config.color }}>
                {progressPercentage}%
              </p>
            </div>
          </div>
          
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: config.color
              }}
            />
          </div>
        </div>

        {/* Lesson path */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Lesson Journey</h3>
          <ProgressPath 
            nodes={pathNodes} 
            onNodeClick={handleNodeClick}
          />
        </div>

        {/* Lesson cards */}
        <div className="space-y-3">
          {lessons.map((lesson, index) => {
            const status = getLessonStatus(lesson.id, index);
            const isLocked = status === "locked";
            const isCompleted = status === "completed";

            return (
              <div
                key={lesson.id}
                onClick={() => !isLocked && handleNodeClick({ id: lesson.id, status })}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-200 animate-fade-in-up",
                  isLocked ? "opacity-60" : "active:scale-[0.98]",
                  isCompleted && "border-accent/50 bg-accent/5",
                  !isLocked && !isCompleted && "border-border hover:border-primary/30 bg-card/50"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                      isLocked && "bg-muted text-muted-foreground",
                      isCompleted && "bg-accent text-accent-foreground",
                      !isLocked && !isCompleted && "bg-primary/20 text-primary"
                    )}
                  >
                    {isLocked ? <Lock className="w-4 h-4" /> : 
                     isCompleted ? <CheckCircle className="w-5 h-5" /> : 
                     lesson.lesson_number}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{lesson.title}</h4>
                    {lesson.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{lesson.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      {lesson.duration_minutes && (
                        <span>{lesson.duration_minutes} min</span>
                      )}
                      <span className="text-gold flex items-center gap-1">
                        <Star className="w-3 h-3" /> +100 XP
                      </span>
                      {lesson.video_url && <Play className="w-3 h-3" />}
                      {lesson.content && <BookOpen className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </MobileLayout>
  );
};

export default ModuleJourney;
