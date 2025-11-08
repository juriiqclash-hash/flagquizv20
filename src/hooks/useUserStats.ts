import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserStats {
  xp: number;
  level: number;
  best_streak: number; // from leaderboards
  time_mode_best_score: number; // from leaderboards
  multiplayer_wins: number;
  total_correct_answers: number;
  created_at: string;
  daily_streak: number;
  last_played_date: string | null;
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

      let userStatsData = data;
      if (!data) {
        // Initialize stats if they don't exist
        const { data: newStats, error: insertError } = await supabase
          .from('user_stats')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (!insertError && newStats) {
          userStatsData = newStats;
        }
      }

      if (userStatsData) {
        // Load best streak from leaderboards
        const { data: streakData } = await supabase
          .from('leaderboards')
          .select('score')
          .eq('user_id', user.id)
          .eq('game_mode', 'streak')
          .order('score', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Load best time from leaderboards
        const { data: timedData } = await supabase
          .from('leaderboards')
          .select('score')
          .eq('user_id', user.id)
          .eq('game_mode', 'timed')
          .order('score', { ascending: true })
          .limit(1)
          .maybeSingle();

        setStats({
          ...userStatsData,
          best_streak: streakData?.score || 0,
          time_mode_best_score: timedData?.score || 0,
        });
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
      // Increment the counter in user_stats
      await supabase.rpc('increment_multiplayer_wins', {
        p_user_id: user.id
      });

      // Get current win count
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('multiplayer_wins')
        .eq('user_id', user.id)
        .single();

      if (statsData) {
        // Update leaderboard with new win count
        await supabase.rpc('upsert_leaderboard_score', {
          p_user_id: user.id,
          p_game_mode: 'multiplayer',
          p_score: statsData.multiplayer_wins
        });
      }

      await fetchStats();
    } catch (error) {
      console.error('Error incrementing multiplayer wins:', error);
    }
  };

  const updateDailyStreak = async () => {
    if (!user) return;

    try {
      await supabase.rpc('update_daily_streak', {
        p_user_id: user.id
      });

      await fetchStats();
    } catch (error) {
      console.error('Error updating daily streak:', error);
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
    updateDailyStreak,
    refreshStats: fetchStats
  };
};
