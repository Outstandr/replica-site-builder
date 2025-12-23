import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { healthService, getSimulatedSteps, setSimulatedSteps } from '@/services/healthService';

interface PedometerData {
  steps: number;
  distance: number;  // in km
  calories: number;
  activeMinutes: number;
}

interface UsePedometerOptions {
  goal?: number;
  autoStart?: boolean;
  updateInterval?: number; // ms
}

export function usePedometer(options: UsePedometerOptions = {}) {
  const { goal = 10000, autoStart = true, updateInterval = 5000 } = options;
  
  const [data, setData] = useState<PedometerData>({
    steps: 0,
    distance: 0,
    calories: 0,
    activeMinutes: 0,
  });
  const [isTracking, setIsTracking] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<number | null>(null);
  const platform = Capacitor.getPlatform();

  // Calculate goal progress
  const goalProgress = Math.min((data.steps / goal) * 100, 100);
  const stepsRemaining = Math.max(goal - data.steps, 0);

  // Fetch current step data
  const fetchSteps = useCallback(async () => {
    try {
      const healthData = await healthService.queryDailySteps();
      setData({
        steps: healthData.steps,
        distance: healthData.distance,
        calories: healthData.calories,
        activeMinutes: healthData.activeMinutes,
      });
    } catch (err) {
      console.error('[usePedometer] Fetch error:', err);
    }
  }, []);

  // Start tracking
  const startTracking = useCallback(async () => {
    if (isTracking) return;
    
    setError(null);
    
    try {
      // Request permissions
      const permStatus = await healthService.requestPermissions();
      if (permStatus !== 'granted') {
        setError('Health permissions denied');
        return;
      }

      // Start background tracking
      await healthService.startBackgroundTracking();
      setIsTracking(true);
      setIsSimulated(platform === 'web');

      // Initial fetch
      await fetchSteps();

      // Set up polling interval for updates
      intervalRef.current = window.setInterval(fetchSteps, updateInterval);
      
      console.log('[usePedometer] Tracking started');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start tracking';
      setError(message);
      console.error('[usePedometer] Start error:', message);
    }
  }, [isTracking, fetchSteps, platform, updateInterval]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    if (!isTracking) return;
    
    try {
      await healthService.stopBackgroundTracking();
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      setIsTracking(false);
      console.log('[usePedometer] Tracking stopped');
    } catch (err) {
      console.error('[usePedometer] Stop error:', err);
    }
  }, [isTracking]);

  // Manual step update (for testing/simulation)
  const addSteps = useCallback((stepsToAdd: number) => {
    if (platform === 'web') {
      const current = getSimulatedSteps();
      setSimulatedSteps(current + stepsToAdd);
      fetchSteps();
    }
  }, [platform, fetchSteps]);

  // Auto-start on mount if enabled
  useEffect(() => {
    if (autoStart) {
      startTracking();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoStart]); // Only run on mount, not when startTracking changes

  return {
    // Data
    steps: data.steps,
    distance: data.distance,
    calories: data.calories,
    activeMinutes: data.activeMinutes,
    
    // Goal
    goal,
    goalProgress,
    stepsRemaining,
    
    // State
    isTracking,
    isSimulated,
    error,
    platform,
    
    // Actions
    startTracking,
    stopTracking,
    addSteps,
    refresh: fetchSteps,
  };
}
