import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, Play, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/VideoPlayer";
import QuizComponent from "@/components/quiz/QuizComponent";
import InteractiveWrapper from "@/components/interactive/InteractiveWrapper";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

interface Lesson {
  id: string;
  lesson_number: number;
  title: string;
  description: string | null;
  video_url: string | null;
  video_start_time: number | null;
  video_end_time: number | null;
  interactive_type: string | null;
  interactive_config: Record<string, unknown> | null;
  subtitle_en_url: string | null;
  subtitle_nl_url: string | null;
  subtitle_ru_url: string | null;
  module_name: string;
}

const MasterclassLesson = () => {
  const { moduleName, lessonId } = useParams<{ moduleName: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showInteractive, setShowInteractive] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
          .select("*")
          .eq("id", lessonId)
          .maybeSingle();

        if (lessonError) throw lessonError;
        
        // Transform the data to match our interface
        const transformedLesson: Lesson | null = lessonData ? {
          ...lessonData,
          interactive_config: lessonData.interactive_config as Record<string, unknown> | null
        } : null;
        
        setLesson(transformedLesson);

        const { data: allData, error: allError } = await supabase
          .from("masterclass_lessons")
          .select("*")
          .eq("module_name", moduleName)
          .not("video_url", "is", null)
          .order("lesson_number");

        if (allError) throw allError;
        
        // Transform all lessons
        const transformedLessons: Lesson[] = (allData || []).map(l => ({
          ...l,
          interactive_config: l.interactive_config as Record<string, unknown> | null
        }));
        
        setAllLessons(transformedLessons);
      } catch (error) {
        console.error("Error fetching lesson:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, moduleName]);

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress);
    
    // Show interactive at 50% progress
    if (progress >= 50 && lesson?.interactive_type && !showInteractive) {
      setShowInteractive(true);
    }
  };

  const handleVideoComplete = () => {
    // Check if there's a quiz
    setShowQuiz(true);
  };

  const handleQuizComplete = async (score: number, totalPoints: number) => {
    if (!user || !lessonId) return;

    try {
      await supabase
        .from("user_lesson_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          quiz_score: Math.round((score / totalPoints) * 100),
          video_progress: 100,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,lesson_id",
        });

      toast({
        title: "Lesson completed!",
        description: `You scored ${Math.round((score / totalPoints) * 100)}% on the quiz`,
      });

      if (nextLesson) {
        navigate(`/masterclass/${moduleName}/${nextLesson.id}`);
      } else {
        navigate(`/module/${moduleName}`);
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleInteractiveComplete = async (response: unknown) => {
    if (!user || !lessonId) return;

    try {
      // First check if record exists
      const { data: existing } = await supabase
        .from("user_lesson_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("user_lesson_progress")
          .update({ interactive_responses: response as Json })
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId);
      } else {
        await supabase
          .from("user_lesson_progress")
          .insert([{
            user_id: user.id,
            lesson_id: lessonId,
            interactive_responses: response as Json,
          }]);
      }
    } catch (error) {
      console.error("Error saving interactive response:", error);
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
          <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Lesson not found</p>
          <Button className="mt-4" onClick={() => navigate(`/module/${moduleName}`)}>
            Back to Module
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(`/module/${moduleName}`)}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <p className="text-sm text-muted-foreground">
                  Lesson {lesson.lesson_number} of {allLessons.length}
                </p>
                <h1 className="text-lg font-bold text-foreground">{lesson.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-gold" />
              +100 XP
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {showQuiz ? (
          <QuizComponent
            lessonId={lessonId!}
            onComplete={handleQuizComplete}
            onClose={() => {
              if (nextLesson) {
                navigate(`/masterclass/${moduleName}/${nextLesson.id}`);
              } else {
                navigate(`/module/${moduleName}`);
              }
            }}
          />
        ) : (
          <>
            {/* Video Player */}
            {lesson.video_url && (
              <div className="mb-8">
                <VideoPlayer
                  src={lesson.video_url}
                  startTime={lesson.video_start_time || 0}
                  endTime={lesson.video_end_time || undefined}
                  onProgress={handleVideoProgress}
                  onComplete={handleVideoComplete}
                  subtitles={[
                    ...(lesson.subtitle_en_url ? [{ src: lesson.subtitle_en_url, label: "English", language: "en" }] : []),
                    ...(lesson.subtitle_nl_url ? [{ src: lesson.subtitle_nl_url, label: "Dutch", language: "nl" }] : []),
                    ...(lesson.subtitle_ru_url ? [{ src: lesson.subtitle_ru_url, label: "Russian", language: "ru" }] : []),
                  ]}
                  className="rounded-2xl overflow-hidden shadow-lg"
                />
              </div>
            )}

            {/* Interactive Exercise */}
            {showInteractive && lesson.interactive_type && lesson.interactive_config && (
              <div className="mb-8">
                <InteractiveWrapper
                  config={{ 
                    type: lesson.interactive_type,
                    ...lesson.interactive_config 
                  }}
                  onComplete={handleInteractiveComplete}
                />
              </div>
            )}

            {/* Lesson description */}
            {lesson.description && (
              <div className="mb-8 p-6 rounded-xl bg-card border border-border">
                <h2 className="text-lg font-bold text-foreground mb-2">About This Lesson</h2>
                <p className="text-muted-foreground">{lesson.description}</p>
              </div>
            )}

            {/* Manual complete button (for videos without auto-complete) */}
            <div className="flex justify-center">
              <Button onClick={() => setShowQuiz(true)} size="lg">
                <CheckCircle className="w-5 h-5 mr-2" />
                Complete & Take Quiz
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MasterclassLesson;
