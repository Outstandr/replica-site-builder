import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface HealthData {
  steps: number;
  distance: number;
  calories: number;
  activeMinutes: number;
  goal: number;
  goalProgress: number;
}

interface DailyStepsRecord {
  id: string;
  date: string;
  steps: number;
  distance_km: number;
  calories: number;
  active_minutes: number;
}

export function useHotstepperHealth() {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<HealthData>({
    steps: 0,
    distance: 0,
    calories: 0,
    activeMinutes: 0,
    goal: 10000,
    goalProgress: 0,
  });
  const [weeklyData, setWeeklyData] = useState<DailyStepsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayData = useCallback(async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error: fetchError } = await supabase
        .from('hotstepper_daily_steps')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // Fetch user's goal from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_step_goal')
        .eq('user_id', user.id)
        .maybeSingle();

      const goal = profile?.daily_step_goal || 10000;

      if (data) {
        setHealthData({
          steps: data.steps || 0,
          distance: Number(data.distance_km) || 0,
          calories: data.calories || 0,
          activeMinutes: data.active_minutes || 0,
          goal,
          goalProgress: Math.min(((data.steps || 0) / goal) * 100, 100),
        });
      } else {
        setHealthData(prev => ({
          ...prev,
          goal,
          goalProgress: 0,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchWeeklyData = useCallback(async () => {
    if (!user) return;

    try {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data, error: fetchError } = await supabase
        .from('hotstepper_daily_steps')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekAgo.toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (fetchError) throw fetchError;

      setWeeklyData(data || []);
    } catch (err) {
      console.error('Failed to fetch weekly data:', err);
    }
  }, [user]);

  const updateSteps = useCallback(async (steps: number, additionalData?: {
    distance?: number;
    calories?: number;
    activeMinutes?: number;
  }) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate derived metrics if not provided
      const distance = additionalData?.distance ?? steps * 0.0008; // ~0.8m per step
      const calories = additionalData?.calories ?? Math.round(steps * 0.04); // ~0.04 cal per step
      const activeMinutes = additionalData?.activeMinutes ?? Math.round(steps / 100); // ~100 steps per minute

      const { error: upsertError } = await supabase
        .from('hotstepper_daily_steps')
        .upsert({
          user_id: user.id,
          date: today,
          steps,
          distance_km: distance,
          calories,
          active_minutes: activeMinutes,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,date',
        });

      if (upsertError) throw upsertError;

      // Refresh data
      await fetchTodayData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update steps');
    }
  }, [user, fetchTodayData]);

  const addSteps = useCallback(async (stepsToAdd: number) => {
    const newTotal = healthData.steps + stepsToAdd;
    await updateSteps(newTotal);
  }, [healthData.steps, updateSteps]);

  useEffect(() => {
    fetchTodayData();
    fetchWeeklyData();
  }, [fetchTodayData, fetchWeeklyData]);

  return {
    healthData,
    weeklyData,
    isLoading,
    error,
    updateSteps,
    addSteps,
    refresh: fetchTodayData,
  };
}
