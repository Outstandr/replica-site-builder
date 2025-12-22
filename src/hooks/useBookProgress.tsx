import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface BookLesson {
  id: string;
  lesson_number: number;
  title: string;
  content: string | null;
  completed: boolean;
  started_at: string | null;
  completed_at: string | null;
}

interface BookProgress {
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lessons: BookLesson[];
  currentLesson: BookLesson | null;
  isLoading: boolean;
  error: string | null;
}

export const useBookProgress = (moduleName: string) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<BookProgress>({
    totalLessons: 0,
    completedLessons: 0,
    progressPercentage: 0,
    lessons: [],
    currentLesson: null,
    isLoading: true,
    error: null,
  });

  const fetchProgress = useCallback(async () => {
    if (!user || !moduleName) {
      setProgress(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // Get all book lessons for this module (those with content but no video)
      const { data: lessons, error: lessonsError } = await supabase
        .from('masterclass_lessons')
        .select('id, lesson_number, title, content')
        .eq('module_name', moduleName)
        .not('content', 'is', null)
        .order('lesson_number');

      if (lessonsError) throw lessonsError;

      // Get user's progress for these lessons
      const { data: userProgress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', lessons?.map(l => l.id) || []);

      if (progressError) throw progressError;

      const progressMap = new Map(
        userProgress?.map(p => [p.lesson_id, p]) || []
      );

      const bookLessons: BookLesson[] = (lessons || []).map(lesson => {
        const userLessonProgress = progressMap.get(lesson.id);
        return {
          id: lesson.id,
          lesson_number: lesson.lesson_number,
          title: lesson.title,
          content: lesson.content,
          completed: userLessonProgress?.completed || false,
          started_at: userLessonProgress?.started_at || null,
          completed_at: userLessonProgress?.completed_at || null,
        };
      });

      const completedCount = bookLessons.filter(l => l.completed).length;
      const totalCount = bookLessons.length;
      
      // Find current lesson (first uncompleted or last completed)
      const currentLesson = bookLessons.find(l => !l.completed) || bookLessons[bookLessons.length - 1] || null;

      setProgress({
        totalLessons: totalCount,
        completedLessons: completedCount,
        progressPercentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        lessons: bookLessons,
        currentLesson,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching book progress:', error);
      setProgress(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch progress',
      }));
    }
  }, [user, moduleName]);

  const markLessonComplete = useCallback(async (lessonId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,lesson_id',
        });

      if (error) throw error;

      // Refresh progress
      await fetchProgress();
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  }, [user, fetchProgress]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    ...progress,
    markLessonComplete,
    refreshProgress: fetchProgress,
  };
};

export default useBookProgress;
