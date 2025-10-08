import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useLeaderboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const saveScore = async (
    gameMode: string,
    score: number,
    details?: any
  ) => {
    if (!user) {
      toast({
        title: 'Anmeldung erforderlich',
        description: 'Du musst angemeldet sein, um deine Punkte zu speichern.',
        variant: 'destructive',
      });
      return false;
    }

    // Handle Speed Rush subcategories based on time limit
    let actualGameMode = gameMode;
    if (gameMode === 'speedrush' && details?.time_limit) {
      const timeLimit = details.time_limit;
      if (timeLimit === 30) actualGameMode = 'speedrush_30s';
      else if (timeLimit === 60) actualGameMode = 'speedrush_1m';
      else if (timeLimit === 300) actualGameMode = 'speedrush_5m';
      else if (timeLimit === 600) actualGameMode = 'speedrush_10m';
    }

    // Only save scores for main leaderboard modes (including speedrush variants)
    const leaderboardModes = ['streak', 'timed', 'speedrush_30s', 'speedrush_1m', 'speedrush_5m', 'speedrush_10m'];
    if (!leaderboardModes.includes(actualGameMode)) {
      return false;
    }

    // Do not save invalid scores
    if (actualGameMode === 'streak' && score <= 0) {
      return false;
    }
    try {
      // Use the new upsert function
      const { data, error } = await supabase.rpc('upsert_leaderboard_score', {
        p_user_id: user.id,
        p_game_mode: actualGameMode,
        p_score: score,
        p_details: details || {}
      });

      if (error) {
        console.error('Error saving score:', error);
        toast({
          title: 'Fehler',
          description: 'Punkte konnten nicht gespeichert werden.',
          variant: 'destructive',
        });
        return false;
      }

      // Only show toast if score was actually saved/updated (except for timed mode which shows custom message)
      if (data === true && actualGameMode !== 'timed') {
        const scoreText = actualGameMode === 'timed' 
          ? `${Math.floor(score / 60)}:${(score % 60).toString().padStart(2, '0')}` 
          : score.toString();
        
        toast({
          title: 'Punkte gespeichert!',
          description: `Dein Score von ${scoreText} wurde zur Bestenliste hinzugefügt.`,
        });
      }
      
      return data === true;
    } catch (error) {
      console.error('Error saving score:', error);
      return false;
    }
  };

  return { saveScore };
};