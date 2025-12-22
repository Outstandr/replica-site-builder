import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookProgress } from "@/hooks/useBookProgress";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import PageTransition from "@/components/layout/PageTransition";
import SkeletonCard from "@/components/mobile/SkeletonCard";
import EmptyState from "@/components/mobile/EmptyState";
import LessonCard from "@/components/LessonCard";

const moduleConfig: Record<string, { title: string; color: string }> = {
  rhythm: { title: "Rhythm", color: "primary" },
  energy: { title: "Energy", color: "secondary" },
  systems: { title: "Systems", color: "accent" },
  execution: { title: "Execution", color: "primary" },
  transformation: { title: "Transformation", color: "secondary" },
};

const BookLessons = () => {
  const { moduleName } = useParams<{ moduleName: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const { 
    lessons, 
    progressPercentage, 
    completedLessons, 
    totalLessons, 
    currentLesson,
    isLoading 
  } = useBookProgress(moduleName || "");
  
  const config = moduleConfig[moduleName || ""] || moduleConfig.rhythm;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const getLessonStatus = (lesson: typeof lessons[0], index: number) => {
    if (lesson.completed) return "completed" as const;
    if (index === 0) return "available" as const;
    if (lessons[index - 1]?.completed) return "available" as const;
    return "locked" as const;
  };

  if (authLoading || isLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <MobileHeader title={`${config.title} Book`} backPath="/dashboard" />
        <div className="px-4 py-6 space-y-4">
          <SkeletonCard variant="module" />
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} variant="lesson" />)}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader 
        title={`${config.title} Book`}
        subtitle={`${completedLessons}/${totalLessons} chapters`}
        backPath="/dashboard"
        accentColor={`hsl(var(--${config.color}))`}
      />

      <PageTransition>
        <main className="px-4 py-6 space-y-6">
          {/* Progress Card */}
          <div 
            className="bg-card/80 backdrop-blur-sm rounded-2xl border-2 p-5 shadow-soft animate-fade-in-up"
            style={{ 
              borderColor: `hsl(var(--${config.color}) / 0.3)`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `hsl(var(--${config.color}) / 0.15)` }}
                >
                  <BookOpen className={`w-6 h-6 text-${config.color}`} />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Reading Progress</h2>
                  <p className="text-sm text-muted-foreground">
                    {currentLesson ? `Continue: ${currentLesson.title}` : "All chapters completed!"}
                  </p>
                </div>
              </div>
              <div 
                className="text-3xl font-bold"
                style={{ color: `hsl(var(--${config.color}))` }}
              >
                {progressPercentage}%
              </div>
            </div>
            
            <div className="h-3 rounded-full bg-muted overflow-hidden mb-4">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${progressPercentage}%`,
                  backgroundColor: `hsl(var(--${config.color}))`
                }}
              />
            </div>

            {currentLesson && (
              <Button 
                className="w-full"
                size="lg"
                onClick={() => navigate(`/book/${moduleName}/${currentLesson.id}`)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Continue Reading
              </Button>
            )}
          </div>

          {/* Chapter List */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4">Chapters</h3>
            
            {lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((lesson, index) => {
                  const status = getLessonStatus(lesson, index);
                  
                  return (
                    <div 
                      key={lesson.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <LessonCard
                        id={lesson.id}
                        lessonNumber={lesson.lesson_number}
                        title={lesson.title}
                        status={status}
                        xpReward={50}
                        linkTo={`/book/${moduleName}/${lesson.id}`}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No chapters available"
                description="Check back soon for new content!"
              />
            )}
          </section>
        </main>
      </PageTransition>
    </MobileLayout>
  );
};

export default BookLessons;