import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Flag } from 'lucide-react';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { calculateRank, type LeaderboardStatsInput } from '@/lib/profileRank';

interface MultiplayerCountdownProps {
  onCountdownEnd: () => void;
}

interface PlayerStats {
  userId: string;
  rankBadge: string;
  rankName: string;
  rankGradient: string;
}

export default function MultiplayerCountdown({ onCountdownEnd }: MultiplayerCountdownProps) {
  const [count, setCount] = useState(5);
  const { participants } = useMultiplayer();
  const { user } = useAuth();
  const [playerStats, setPlayerStats] = useState<Map<string, PlayerStats>>(new Map());

  useEffect(() => {
    const loadPlayerStats = async () => {
      const statsMap = new Map<string, PlayerStats>();

      for (const participant of participants) {
        // Load user stats for level
        const { data: userStats } = await supabase
          .from('user_stats')
          .select('level, multiplayer_wins')
          .eq('user_id', participant.user_id)
          .maybeSingle();

        // Load best streak from leaderboards
        const { data: streakData } = await supabase
          .from('leaderboards')
          .select('score')
          .eq('user_id', participant.user_id)
          .eq('game_mode', 'streak')
          .order('score', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Load best time from leaderboards
        const { data: timedData } = await supabase
          .from('leaderboards')
          .select('score')
          .eq('user_id', participant.user_id)
          .eq('game_mode', 'timed')
          .order('score', { ascending: true })
          .limit(1)
          .maybeSingle();

        const leaderboardStats: LeaderboardStatsInput = {
          bestStreak: streakData?.score || 0,
          bestTimeMode: timedData?.score || 9999,
          duelWins: userStats?.multiplayer_wins || 0,
        };

        const rank = calculateRank(leaderboardStats, userStats?.level || 1);

        statsMap.set(participant.user_id, {
          userId: participant.user_id,
          rankBadge: rank.badge,
          rankName: rank.name,
          rankGradient: rank.gradient,
        });
      }

      setPlayerStats(statsMap);
    };

    if (participants.length > 0) {
      loadPlayerStats();
    }
  }, [participants]);

  useEffect(() => {
    if (count === 0) {
      onCountdownEnd();
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onCountdownEnd]);

  const player1 = participants[0];
  const player2 = participants[1];
  const player1Stats = player1 ? playerStats.get(player1.user_id) : null;
  const player2Stats = player2 ? playerStats.get(player2.user_id) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />

      <div className="w-full max-w-[95%] sm:max-w-[90%] relative z-10 flex flex-col items-center justify-center">
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black text-white tracking-wider drop-shadow-[0_0_40px_rgba(255,255,255,0.6)] mb-6 sm:mb-10 md:mb-16">
          GET READY!
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16 xl:gap-20 w-full max-w-full md:max-w-[85%] px-2 sm:px-4">
          <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 w-full md:w-72 lg:w-80 xl:w-96">
            <div className="relative group">
              <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-lg sm:blur-xl opacity-60 animate-pulse" />
              <Avatar className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 xl:w-64 xl:h-64 ring-4 sm:ring-6 ring-blue-400/50 shadow-2xl">
                <AvatarImage src={player1?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl">
                  {player1?.username?.charAt(0).toUpperCase() || <User className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-32 xl:h-32" />}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white drop-shadow-lg text-center">
              {player1?.username || 'Spieler 1'}
            </h3>
            {player1Stats && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 sm:border-2 rounded-2xl sm:rounded-3xl px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 flex items-center gap-2 sm:gap-3 md:gap-5 shadow-xl">
                <img
                  src={player1Stats.rankBadge}
                  alt={player1Stats.rankName}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 object-contain drop-shadow-xl"
                />
                <div className="text-white font-bold text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl">
                  {player1Stats.rankName}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-start gap-2 sm:gap-3 md:gap-6 mt-2 sm:mt-4 md:mt-8">
            <div className="relative text-4xl sm:text-5xl md:text-8xl lg:text-9xl xl:text-[12rem] font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
              {count}
            </div>

            <span className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl xl:text-9xl font-black bg-gradient-to-r from-yellow-400 via-red-500 to-orange-600 bg-clip-text text-transparent drop-shadow-2xl">
              VS
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 w-full md:w-72 lg:w-80 xl:w-96">
            <div className="relative group">
              <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-red-400 to-orange-400 rounded-full blur-lg sm:blur-xl opacity-60 animate-pulse" />
              <Avatar className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 xl:w-64 xl:h-64 ring-4 sm:ring-6 ring-red-400/50 shadow-2xl">
                <AvatarImage src={player2?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-red-400 to-red-600 text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl">
                  {player2?.username?.charAt(0).toUpperCase() || <User className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-32 xl:h-32" />}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white drop-shadow-lg text-center">
              {player2?.username || 'Spieler 2'}
            </h3>
            {player2Stats && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 sm:border-2 rounded-2xl sm:rounded-3xl px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 flex items-center gap-2 sm:gap-3 md:gap-5 shadow-xl">
                <img
                  src={player2Stats.rankBadge}
                  alt={player2Stats.rankName}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 object-contain drop-shadow-xl"
                />
                <div className="text-white font-bold text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl">
                  {player2Stats.rankName}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
}