import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { healthService, getSimulatedSteps } from '@/services/healthService';

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

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds
const SIMULATION_REFRESH_INTERVAL = 3000; // 3 seconds for smooth web simulation

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
  const [isSimulating, setIsSimulating] = useState(false);
  
  const refreshIntervalRef = useRef<number | null>(null);
  const simulationIntervalRef = useRef<number | null>(null);

  // Fetch data from health service (native or simulated)
  const fetchFromHealthService = useCallback(async () => {
    try {
      const data = await healthService.queryDailySteps();
      return data;
    } catch (err) {
      console.error('Health service query failed:', err);
      return null;
    }
  }, []);

  // Sync health data to Supabase
  const syncToSupabase = useCallback(async (steps: number, distance: number, calories: number, activeMinutes: number) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const dataSource = healthService.platform === 'web' ? 'simulation' : healthService.platform;
    
    try {
      await supabase
        .from('hotstepper_daily_steps')
        .upsert({
          user_id: user.id,
          date: today,
          steps,
          distance_km: distance,
          calories,
          active_minutes: activeMinutes,
          data_source: dataSource,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,date',
        });
    } catch (err) {
      console.error('Failed to sync to Supabase:', err);
    }
  }, [user]);

  const fetchTodayData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch user's goal from profile first
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_step_goal')
        .eq('user_id', user.id)
        .maybeSingle();

      const goal = profile?.daily_step_goal || 10000;

      // Try to get data from health service first
      const healthServiceData = await fetchFromHealthService();
      
      if (healthServiceData && healthServiceData.steps > 0) {
        // Use health service data (native or simulated)
        const newData = {
          steps: healthServiceData.steps,
          distance: healthServiceData.distance,
          calories: healthServiceData.calories,
          activeMinutes: healthServiceData.activeMinutes,
          goal,
          goalProgress: Math.min((healthServiceData.steps / goal) * 100, 100),
        };
        
        setHealthData(newData);
        
        // Sync to Supabase in background
        syncToSupabase(newData.steps, newData.distance, newData.calories, newData.activeMinutes);
      } else {
        // Fallback to database
        const today = new Date().toISOString().split('T')[0];
        const { data, error: fetchError } = await supabase
          .from('hotstepper_daily_steps')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();

        if (fetchError) throw fetchError;

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
            steps: 0,
            distance: 0,
            calories: 0,
            activeMinutes: 0,
            goal,
            goalProgress: 0,
          }));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchFromHealthService, syncToSupabase]);

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

  // Start web simulation mode
  const startSimulation = useCallback(async () => {
    if (healthService.platform !== 'web') return;
    
    setIsSimulating(true);
    await healthService.startBackgroundTracking();
    
    // Fast refresh for smooth step updates
    simulationIntervalRef.current = window.setInterval(async () => {
      const simSteps = getSimulatedSteps();
      if (simSteps > 0) {
        const goal = healthData.goal;
        const distance = simSteps * 0.0008;
        const calories = Math.round(simSteps * 0.04);
        const activeMinutes = Math.round(simSteps / 100);
        
        setHealthData(prev => ({
          ...prev,
          steps: simSteps,
          distance,
          calories,
          activeMinutes,
          goalProgress: Math.min((simSteps / goal) * 100, 100),
        }));
      }
    }, SIMULATION_REFRESH_INTERVAL);
  }, [healthData.goal]);

  const stopSimulation = useCallback(async () => {
    setIsSimulating(false);
    await healthService.stopBackgroundTracking();
    
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchTodayData();
    fetchWeeklyData();
    
    // Set up auto-refresh interval (30 seconds for native, handled separately for web)
    if (healthService.platform !== 'web') {
      refreshIntervalRef.current = window.setInterval(() => {
        fetchTodayData();
      }, AUTO_REFRESH_INTERVAL);
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [fetchTodayData, fetchWeeklyData]);

  return {
    healthData,
    weeklyData,
    isLoading,
    error,
    isSimulating,
    updateSteps,
    addSteps,
    refresh: fetchTodayData,
    startSimulation,
    stopSimulation,
    platform: healthService.platform,
  };
}
