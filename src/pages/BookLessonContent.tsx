import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle, BookOpen, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import PageTransition from "@/components/layout/PageTransition";
import EmptyState from "@/components/mobile/EmptyState";

interface BookLesson {
  id: string;
  lesson_number: number;
  title: string;
  content: string | null;
  module_name: string;
}

const moduleConfig: Record<string, { title: string; color: string }> = {
  rhythm: { title: "Rhythm", color: "primary" },
  energy: { title: "Energy", color: "secondary" },
  systems: { title: "Systems", color: "accent" },
  execution: { title: "Execution", color: "primary" },
  transformation: { title: "Transformation", color: "secondary" },
};

const BookLessonContent = () => {
  const { moduleName, lessonId } = useParams<{ moduleName: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [lesson, setLesson] = useState<BookLesson | null>(null);
  const [allLessons, setAllLessons] = useState<BookLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  const config = moduleConfig[moduleName || ""] || moduleConfig.rhythm;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId || !moduleName) return;

      try {
        const { data: lessonData, error: lessonError } = await supabase
          .from("masterclass_lessons")
          .select("id, lesson_number, title, content, module_name")
          .eq("id", lessonId)
          .maybeSingle();

        if (lessonError) throw lessonError;
        setLesson(lessonData);

        const { data: allData, error: allError } = await supabase
          .from("masterclass_lessons")
          .select("id, lesson_number, title, content, module_name")
          .eq("module_name", moduleName)
          .not("content", "is", null)
          .order("lesson_number");

        if (allError) throw allError;
        setAllLessons(allData || []);
      } catch (error) {
        console.error("Error fetching lesson:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, moduleName]);

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleComplete = async () => {
    if (!user || !lessonId) return;

    setIsCompleting(true);
    try {
      const { error } = await supabase
        .from("user_lesson_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,lesson_id",
        });

      if (error) throw error;

      toast({
        title: "Chapter completed! 🎉",
        description: "+50 XP earned",
      });

      if (nextLesson) {
        navigate(`/book/${moduleName}/${nextLesson.id}`);
      } else {
        navigate(`/book/${moduleName}`);
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
      toast({
        title: "Error",
        description: "Failed to mark chapter as complete",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <MobileHeader title="Loading..." backPath={`/book/${moduleName}`} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Sparkles className="w-10 h-10 text-primary animate-pulse" />
        </div>
      </MobileLayout>
    );
  }

  if (!lesson) {
    return (
      <MobileLayout showBottomNav={false}>
        <MobileHeader title="Chapter Not Found" backPath={`/book/${moduleName}`} />
        <div className="px-4 py-12">
          <EmptyState
            icon={BookOpen}
            title="Chapter not found"
            description="This chapter doesn't exist or has been removed."
            action={{
              label: "Back to Book",
              onClick: () => navigate(`/book/${moduleName}`)
            }}
          />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader 
        title={`Chapter ${lesson.lesson_number}`}
        subtitle={`${currentIndex + 1} of ${allLessons.length}`}
        backPath={`/book/${moduleName}`}
        accentColor={`hsl(var(--${config.color}))`}
      />

      <PageTransition>
        <main className="px-4 py-6 pb-32">
          {/* Chapter Title */}
          <div className="mb-8 animate-fade-in-up">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-3"
              style={{ 
                backgroundColor: `hsl(var(--${config.color}) / 0.15)`,
                color: `hsl(var(--${config.color}))`
              }}
            >
              <BookOpen className="w-4 h-4" />
              {config.title} Book
            </div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">{lesson.title}</h1>
          </div>
          
          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {lesson.content?.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4 text-foreground/90 leading-relaxed text-base">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Fixed Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border p-4 safe-area-bottom">
            <div className="max-w-3xl mx-auto space-y-3">
              <Button 
                onClick={handleComplete}
                disabled={isCompleting}
                className="w-full"
                size="lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {isCompleting ? "Completing..." : "Mark as Complete"}
              </Button>

              <div className="flex items-center gap-3">
                {prevLesson ? (
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/book/${moduleName}/${prevLesson.id}`)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                ) : (
                  <div className="flex-1" />
                )}

                {nextLesson && (
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/book/${moduleName}/${nextLesson.id}`)}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </PageTransition>
    </MobileLayout>
  );
};

export default BookLessonContent;