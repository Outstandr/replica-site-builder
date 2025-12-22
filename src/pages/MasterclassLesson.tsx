import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Play, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/VideoPlayer";
import QuizComponent from "@/components/quiz/QuizComponent";
import InteractiveWrapper from "@/components/interactive/InteractiveWrapper";
import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import SkeletonCard from "@/components/mobile/SkeletonCard";
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
    
    if (progress >= 50 && lesson?.interactive_type && !showInteractive) {
      setShowInteractive(true);
    }
  };

  const handleVideoComplete = () => {
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
      <MobileLayout showBottomNav={false}>
        <MobileHeader 
          title="Loading..." 
          backPath={`/module/${moduleName}`}
        />
        <main className="px-4 py-6 space-y-4">
          <div className="aspect-video rounded-xl bg-muted animate-pulse" />
          <SkeletonCard />
        </main>
      </MobileLayout>
    );
  }

  if (!lesson) {
    return (
      <MobileLayout showBottomNav={false}>
        <MobileHeader 
          title="Lesson Not Found" 
          backPath={`/module/${moduleName}`}
        />
        <main className="px-4 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
            <Play className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-6">This lesson could not be found</p>
          <Button onClick={() => navigate(`/module/${moduleName}`)}>
            Back to Module
          </Button>
        </main>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      <MobileHeader 
        title={lesson.title}
        subtitle={`Lesson ${lesson.lesson_number} of ${allLessons.length}`}
        backPath={`/module/${moduleName}`}
        rightContent={
          <div className="flex items-center gap-1.5 text-sm text-gold">
            <Star className="w-4 h-4" />
            +100 XP
          </div>
        }
      />

      <main className="px-4 py-6">
        {showQuiz ? (
          <div className="animate-fade-in-up">
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
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            {/* Video Player */}
            {lesson.video_url && (
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
            )}

            {/* Interactive Exercise */}
            {showInteractive && lesson.interactive_type && lesson.interactive_config && (
              <InteractiveWrapper
                config={{ 
                  type: lesson.interactive_type,
                  ...lesson.interactive_config 
                }}
                onComplete={handleInteractiveComplete}
              />
            )}

            {/* Lesson description */}
            {lesson.description && (
              <div className="p-5 rounded-xl bg-card/50 border border-border/50">
                <h2 className="text-lg font-bold text-foreground mb-2">About This Lesson</h2>
                <p className="text-muted-foreground">{lesson.description}</p>
              </div>
            )}

            {/* Manual complete button */}
            <Button 
              onClick={() => setShowQuiz(true)} 
              size="lg" 
              className="w-full h-14 text-base"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Complete & Take Quiz
            </Button>
          </div>
        )}
      </main>
    </MobileLayout>
  );
};

export default MasterclassLesson;
