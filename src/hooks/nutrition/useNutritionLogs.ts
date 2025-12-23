import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

export interface MealLog {
  id: string;
  user_id: string;
  meal_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  image_url: string | null;
  created_at: string;
}

export interface CreateMealLogInput {
  meal_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  image_url?: string | null;
}

export function useNutritionLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [todayLogs, setTodayLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (daysBack: number = 30) => {
    if (!user) return;

    try {
      setLoading(true);
      const startDate = subDays(new Date(), daysBack);
      
      const { data, error: fetchError } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setLogs(data || []);
      
      // Filter today's logs
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);
      
      const todayFiltered = (data || []).filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= todayStart && logDate <= todayEnd;
      });
      
      setTodayLogs(todayFiltered);
      setError(null);
    } catch (err) {
      console.error('Error fetching meal logs:', err);
      setError('Failed to fetch meal logs');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createLog = useCallback(async (input: CreateMealLogInput): Promise<MealLog | null> => {
    if (!user) return null;

    try {
      const { data, error: insertError } = await supabase
        .from('meal_logs')
        .insert({
          user_id: user.id,
          meal_name: input.meal_name,
          calories: input.calories,
          protein: input.protein || 0,
          carbs: input.carbs || 0,
          fats: input.fats || 0,
          image_url: input.image_url || null
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Refresh logs
      await fetchLogs();
      
      return data;
    } catch (err) {
      console.error('Error creating meal log:', err);
      setError('Failed to create meal log');
      return null;
    }
  }, [user, fetchLogs]);

  const deleteLog = useCallback(async (logId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: deleteError } = await supabase
        .from('meal_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Refresh logs
      await fetchLogs();
      
      return true;
    } catch (err) {
      console.error('Error deleting meal log:', err);
      setError('Failed to delete meal log');
      return false;
    }
  }, [user, fetchLogs]);

  const updateLog = useCallback(async (logId: string, updates: Partial<CreateMealLogInput>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: updateError } = await supabase
        .from('meal_logs')
        .update(updates)
        .eq('id', logId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Refresh logs
      await fetchLogs();
      
      return true;
    } catch (err) {
      console.error('Error updating meal log:', err);
      setError('Failed to update meal log');
      return false;
    }
  }, [user, fetchLogs]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    todayLogs,
    loading,
    error,
    createLog,
    deleteLog,
    updateLog,
    refetch: fetchLogs
  };
}
