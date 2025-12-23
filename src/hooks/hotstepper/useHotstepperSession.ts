import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SessionData {
  id: string | null;
  isActive: boolean;
  startedAt: Date | null;
  duration: number; // seconds
  steps: number;
  distance: number; // km
  avgSpeed: number;
  maxSpeed: number;
  avgPace: number; // min/km
  routePoints: Array<{ lat: number; lng: number; timestamp: number }>;
  dataSource: 'gps' | 'steps';
}

export function useHotstepperSession() {
  const { user } = useAuth();
  const [session, setSession] = useState<SessionData>({
    id: null,
    isActive: false,
    startedAt: null,
    duration: 0,
    steps: 0,
    distance: 0,
    avgSpeed: 0,
    maxSpeed: 0,
    avgPace: 0,
    routePoints: [],
    dataSource: 'gps',
  });
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = useCallback(async (dataSource: 'gps' | 'steps' = 'gps') => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('hotstepper_sessions')
        .insert({
          user_id: user.id,
          data_source: dataSource,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const startTime = new Date();
      
      setSession({
        id: data.id,
        isActive: true,
        startedAt: startTime,
        duration: 0,
        steps: 0,
        distance: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        avgPace: 0,
        routePoints: [],
        dataSource,
      });

      // Start duration timer
      timerRef.current = setInterval(() => {
        setSession(prev => ({
          ...prev,
          duration: prev.startedAt 
            ? Math.floor((Date.now() - prev.startedAt.getTime()) / 1000)
            : 0,
        }));
      }, 1000);

    } catch (err) {
      console.error('Failed to start session:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateSessionData = useCallback((data: Partial<SessionData>) => {
    setSession(prev => {
      const newSession = { ...prev, ...data };
      
      // Calculate pace (min/km) from speed (km/h)
      if (data.avgSpeed && data.avgSpeed > 0) {
        newSession.avgPace = 60 / data.avgSpeed;
      }

      return newSession;
    });
  }, []);

  const endSession = useCallback(async () => {
    if (!user || !session.id) return;

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('hotstepper_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: session.duration,
          steps: session.steps,
          distance_km: session.distance,
          route_points: session.routePoints,
          avg_speed: session.avgSpeed,
          max_speed: session.maxSpeed,
          avg_pace: session.avgPace,
          is_active: false,
        })
        .eq('id', session.id);

      if (error) throw error;

      // Reset session state
      setSession({
        id: null,
        isActive: false,
        startedAt: null,
        duration: 0,
        steps: 0,
        distance: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        avgPace: 0,
        routePoints: [],
        dataSource: 'gps',
      });

      return session;
    } catch (err) {
      console.error('Failed to end session:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, session]);

  const fetchActiveSession = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('hotstepper_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const startedAt = new Date(data.started_at);
        setSession({
          id: data.id,
          isActive: true,
          startedAt,
          duration: Math.floor((Date.now() - startedAt.getTime()) / 1000),
          steps: data.steps || 0,
          distance: Number(data.distance_km) || 0,
          avgSpeed: Number(data.avg_speed) || 0,
          maxSpeed: Number(data.max_speed) || 0,
          avgPace: Number(data.avg_pace) || 0,
          routePoints: (data.route_points as Array<{ lat: number; lng: number; timestamp: number }>) || [],
          dataSource: data.data_source as 'gps' | 'steps',
        });

        // Start timer for existing session
        timerRef.current = setInterval(() => {
          setSession(prev => ({
            ...prev,
            duration: prev.startedAt 
              ? Math.floor((Date.now() - prev.startedAt.getTime()) / 1000)
              : 0,
          }));
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to fetch active session:', err);
    }
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Check for active session on mount
  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);

  return {
    session,
    isLoading,
    startSession,
    updateSessionData,
    endSession,
  };
}
