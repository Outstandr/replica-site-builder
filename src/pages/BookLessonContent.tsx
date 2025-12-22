import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BookLesson {
  id: string;
  lesson_number: number;
  title: string;
  content: string | null;
  module_name: string;
}

const BookLessonContent = () => {
  const { moduleName, lessonId } = useParams<{ moduleName: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [lesson, setLesson] = useState<BookLesson | null>(null);
  const [allLessons, setAllLessons] = useState<BookLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId || !moduleName) return;

      try {
        // Fetch current lesson
        const { data: lessonData, error: lessonError } = await supabase
          .from("masterclass_lessons")
          .select("id, lesson_number, title, content, module_name")
          .eq("id", lessonId)
          .maybeSingle();

        if (lessonError) throw lessonError;
        setLesson(lessonData);

        // Fetch all lessons for navigation
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
        title: "Chapter completed!",
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Chapter not found</p>
          <Button className="mt-4" onClick={() => navigate(`/book/${moduleName}`)}>
            Back to Book
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/book/${moduleName}`)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Chapter {lesson.lesson_number} of {allLessons.length}
              </p>
            </div>

            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">{lesson.title}</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {lesson.content?.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4 text-foreground/90 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Complete button */}
        <div className="mt-12 pt-8 border-t border-border">
          <Button 
            onClick={handleComplete}
            disabled={isCompleting}
            className="w-full py-6 text-lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {isCompleting ? "Completing..." : "Mark as Complete"}
          </Button>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {prevLesson ? (
            <Button 
              variant="outline"
              onClick={() => navigate(`/book/${moduleName}/${prevLesson.id}`)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          ) : (
            <div />
          )}

          {nextLesson && (
            <Button 
              variant="outline"
              onClick={() => navigate(`/book/${moduleName}/${nextLesson.id}`)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookLessonContent;
