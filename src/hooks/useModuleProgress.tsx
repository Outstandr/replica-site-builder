import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
  video_progress: number;
  quiz_score: number | null;
  started_at: string | null;
  completed_at: string | null;
}

interface ModuleProgress {
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lessons: LessonProgress[];
  isLoading: boolean;
  error: string | null;
}

export const useModuleProgress = (moduleName: string) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ModuleProgress>({
    totalLessons: 0,
    completedLessons: 0,
    progressPercentage: 0,
    lessons: [],
    isLoading: true,
    error: null,
  });

  const fetchProgress = useCallback(async () => {
    if (!user || !moduleName) {
      setProgress(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // Get all lessons for this module
      const { data: lessons, error: lessonsError } = await supabase
        .from('masterclass_lessons')
        .select('id, lesson_number, title')
        .eq('module_name', moduleName)
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

      const lessonProgress: LessonProgress[] = (lessons || []).map(lesson => {
        const userLessonProgress = progressMap.get(lesson.id);
        return {
          lesson_id: lesson.id,
          completed: userLessonProgress?.completed || false,
          video_progress: userLessonProgress?.video_progress || 0,
          quiz_score: userLessonProgress?.quiz_score || null,
          started_at: userLessonProgress?.started_at || null,
          completed_at: userLessonProgress?.completed_at || null,
        };
      });

      const completedCount = lessonProgress.filter(l => l.completed).length;
      const totalCount = lessonProgress.length;

      setProgress({
        totalLessons: totalCount,
        completedLessons: completedCount,
        progressPercentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        lessons: lessonProgress,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching module progress:', error);
      setProgress(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch progress',
      }));
    }
  }, [user, moduleName]);

  const updateLessonProgress = useCallback(async (
    lessonId: string,
    updates: Partial<{
      video_progress: number;
      completed: boolean;
      quiz_score: number;
    }>
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          ...updates,
          completed_at: updates.completed ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id,lesson_id',
        });

      if (error) throw error;

      // Refresh progress
      await fetchProgress();
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  }, [user, fetchProgress]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    ...progress,
    updateLessonProgress,
    refreshProgress: fetchProgress,
  };
};

export default useModuleProgress;
