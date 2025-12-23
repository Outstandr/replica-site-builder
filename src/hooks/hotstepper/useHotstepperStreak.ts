import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastTargetHitDate: string | null;
  totalDaysCompleted: number;
}

export function useHotstepperStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastTargetHitDate: null,
    totalDaysCompleted: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('hotstepper_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setStreak({
          currentStreak: data.current_streak || 0,
          longestStreak: data.longest_streak || 0,
          lastTargetHitDate: data.last_target_hit_date,
          totalDaysCompleted: data.total_days_completed || 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch streak:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateStreak = useCallback(async (hitTarget: boolean) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Fetch current streak
      const { data: currentData } = await supabase
        .from('hotstepper_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      let newCurrentStreak = 0;
      let newLongestStreak = currentData?.longest_streak || 0;
      let newTotalDays = currentData?.total_days_completed || 0;

      if (hitTarget) {
        // Check if yesterday was the last target hit
        if (currentData?.last_target_hit_date === yesterdayStr) {
          // Continue streak
          newCurrentStreak = (currentData?.current_streak || 0) + 1;
        } else if (currentData?.last_target_hit_date === today) {
          // Already hit today, no change
          newCurrentStreak = currentData?.current_streak || 1;
        } else {
          // Start new streak
          newCurrentStreak = 1;
        }

        // Update longest streak if needed
        if (newCurrentStreak > newLongestStreak) {
          newLongestStreak = newCurrentStreak;
        }

        // Increment total days if this is a new day
        if (currentData?.last_target_hit_date !== today) {
          newTotalDays += 1;
        }

        const { error } = await supabase
          .from('hotstepper_streaks')
          .upsert({
            user_id: user.id,
            current_streak: newCurrentStreak,
            longest_streak: newLongestStreak,
            last_target_hit_date: today,
            total_days_completed: newTotalDays,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (error) throw error;

        setStreak({
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastTargetHitDate: today,
          totalDaysCompleted: newTotalDays,
        });
      }
    } catch (err) {
      console.error('Failed to update streak:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    streak,
    isLoading,
    updateStreak,
    refresh: fetchStreak,
  };
}
