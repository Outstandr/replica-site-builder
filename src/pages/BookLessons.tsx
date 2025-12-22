import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, BookOpen, CheckCircle, Clock, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookProgress } from "@/hooks/useBookProgress";
import { Button } from "@/components/ui/button";
import LessonCard from "@/components/LessonCard";
import { cn } from "@/lib/utils";

const moduleConfig: Record<string, { title: string; color: string }> = {
  rhythm: { title: "Rhythm", color: "hsl(var(--reset-rhythm))" },
  energy: { title: "Energy", color: "hsl(var(--reset-energy))" },
  systems: { title: "Systems", color: "hsl(var(--reset-systems))" },
  execution: { title: "Execution", color: "hsl(var(--reset-execution))" },
  transformation: { title: "Transformation", color: "hsl(var(--reset-transformation))" },
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{ 
          backgroundColor: `${config.color}10`,
          borderColor: `${config.color}30`
        }}
      >
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <BookOpen className="w-5 h-5" style={{ color: config.color }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: config.color }}>
                  {config.title} Book
                </h1>
                <p className="text-sm text-muted-foreground">
                  {completedLessons}/{totalLessons} chapters • {progressPercentage}% complete
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* Progress card */}
        <div 
          className="mb-8 p-6 rounded-2xl border-2"
          style={{ 
            borderColor: `${config.color}30`,
            background: `linear-gradient(135deg, ${config.color}05, ${config.color}10)`
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-foreground mb-1">Reading Progress</h2>
              <p className="text-sm text-muted-foreground">
                {currentLesson ? `Continue: ${currentLesson.title}` : "All chapters completed!"}
              </p>
            </div>
            <div 
              className="text-3xl font-bold"
              style={{ color: config.color }}
            >
              {progressPercentage}%
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

          {currentLesson && (
            <Button 
              className="mt-4 w-full"
              style={{ backgroundColor: config.color }}
              onClick={() => navigate(`/book/${moduleName}/${currentLesson.id}`)}
            >
              Continue Reading
            </Button>
          )}
        </div>

        {/* Chapter list */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground mb-4">Chapters</h3>
          
          {lessons.map((lesson, index) => {
            const status = getLessonStatus(lesson, index);
            
            return (
              <LessonCard
                key={lesson.id}
                id={lesson.id}
                lessonNumber={lesson.lesson_number}
                title={lesson.title}
                status={status}
                xpReward={50}
                linkTo={`/book/${moduleName}/${lesson.id}`}
              />
            );
          })}
        </div>

        {lessons.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No chapters available yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookLessons;
