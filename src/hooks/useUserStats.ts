import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserStats {
  xp: number;
  level: number;
  best_streak: number;
  time_mode_best_score: number;
  multiplayer_wins: number;
  total_correct_answers: number;
  created_at: string;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching stats:', error);
        return;
      }

      if (data) {
        setStats(data);
      } else {
        // Initialize stats if they don't exist
        const { data: newStats, error: insertError } = await supabase
          .from('user_stats')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (!insertError && newStats) {
          setStats(newStats);
        }
      }
    } catch (error) {
      console.error('Error in fetchStats:', error);
    } finally {
      setLoading(false);
    }
  };

  const addXP = async (amount: number) => {
    if (!user) return;

    try {
      await supabase.rpc('add_xp', {
        p_user_id: user.id,
        p_xp_gained: amount
      });

      await fetchStats();
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  const updateBestStreak = async (streak: number) => {
    if (!user) return;

    try {
      await supabase.rpc('update_best_streak', {
        p_user_id: user.id,
        p_streak: streak
      });

      await fetchStats();
    } catch (error) {
      console.error('Error updating best streak:', error);
    }
  };

  const updateTimeModeScore = async (score: number) => {
    if (!user) return;

    try {
      await supabase.rpc('update_time_mode_score', {
        p_user_id: user.id,
        p_score: score
      });

      await fetchStats();
    } catch (error) {
      console.error('Error updating time mode score:', error);
    }
  };

  const incrementMultiplayerWins = async () => {
    if (!user) return;

    try {
      await supabase.rpc('increment_multiplayer_wins', {
        p_user_id: user.id
      });

      await fetchStats();
    } catch (error) {
      console.error('Error incrementing multiplayer wins:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return {
    stats,
    loading,
    addXP,
    updateBestStreak,
    updateTimeModeScore,
    incrementMultiplayerWins,
    refreshStats: fetchStats
  };
};
