import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  steps: number;
  rank: number;
  isCurrentUser: boolean;
}

export function useHotstepperLeaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's steps for all users (RLS allows viewing leaderboard data)
      const { data: stepsData, error: stepsError } = await supabase
        .from('hotstepper_daily_steps')
        .select('user_id, steps')
        .eq('date', today)
        .order('steps', { ascending: false })
        .limit(50);

      if (stepsError) throw stepsError;

      if (!stepsData || stepsData.length === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      // Get user IDs to fetch their profiles
      const userIds = stepsData.map(s => s.user_id);

      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      if (profilesError) {
        console.warn('Could not fetch all profiles:', profilesError);
      }

      // Create a map of user_id to display_name
      const profileMap = new Map<string, string>();
      profilesData?.forEach(p => {
        profileMap.set(p.user_id, p.display_name || 'Anonymous');
      });

      // Build leaderboard entries
      const entries: LeaderboardEntry[] = stepsData.map((entry, index) => ({
        userId: entry.user_id,
        displayName: profileMap.get(entry.user_id) || 'Anonymous',
        steps: entry.steps || 0,
        rank: index + 1,
        isCurrentUser: entry.user_id === user?.id,
      }));

      setLeaderboard(entries);

      // Find current user's rank
      const userEntry = entries.find(e => e.isCurrentUser);
      setCurrentUserRank(userEntry?.rank || null);

    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    currentUserRank,
    refresh: fetchLeaderboard,
  };
}
