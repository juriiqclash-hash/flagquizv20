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
        const { data: stats } = await supabase
          .from('leaderboard')
          .select('best_streak, best_time_mode, duel_wins, level')
          .eq('user_id', participant.user_id)
          .maybeSingle();

        if (stats) {
          const leaderboardStats: LeaderboardStatsInput = {
            bestStreak: stats.best_streak || 0,
            bestTimeMode: stats.best_time_mode || 9999,
            duelWins: stats.duel_wins || 0,
          };

          const rank = calculateRank(leaderboardStats, stats.level || 1);

          statsMap.set(participant.user_id, {
            userId: participant.user_id,
            rankBadge: rank.badge,
            rankName: rank.name,
            rankGradient: rank.gradient,
          });
        } else {
          statsMap.set(participant.user_id, {
            userId: participant.user_id,
            rankBadge: '/bronze.webp',
            rankName: 'Bronze',
            rankGradient: 'from-orange-600 via-orange-500 to-orange-400',
          });
        }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />

      <div className="w-full max-w-7xl relative z-10 flex flex-col items-center justify-center gap-16">
        <div className="text-center space-y-2">
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-wider drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
            GET READY!
          </h2>
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 blur-3xl opacity-60 animate-pulse" />
            <div className="relative text-8xl lg:text-9xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
              {count}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 lg:gap-16 w-full">
          <div className="flex flex-col items-center gap-3 transform hover:scale-105 transition-transform duration-300">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-xl opacity-75 group-hover:opacity-100 animate-pulse" />
              <Avatar className="relative w-32 h-32 lg:w-40 lg:h-40 ring-8 ring-blue-400/50 shadow-[0_0_50px_rgba(59,130,246,0.6)]">
                <AvatarImage src={player1?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-5xl lg:text-6xl">
                  {player1?.username?.charAt(0).toUpperCase() || <User className="w-16 h-16 lg:w-20 lg:h-20" />}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl lg:text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                {player1?.username || 'Spieler 1'}
              </h3>
              {player1Stats && (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 blur-md opacity-60">
                      <img
                        src={player1Stats.rankBadge}
                        alt={player1Stats.rankName}
                        className="w-12 h-12 lg:w-16 lg:h-16 object-contain"
                      />
                    </div>
                    <img
                      src={player1Stats.rankBadge}
                      alt={player1Stats.rankName}
                      className="relative w-12 h-12 lg:w-16 lg:h-16 object-contain drop-shadow-2xl"
                    />
                  </div>
                  <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${player1Stats.rankGradient} text-white font-bold text-sm shadow-lg`}>
                    {player1Stats.rankName}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center px-4 lg:px-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-orange-600 blur-3xl opacity-40 animate-pulse" />
              <span className="relative text-6xl lg:text-8xl font-black bg-gradient-to-r from-yellow-400 via-red-500 to-orange-600 bg-clip-text text-transparent drop-shadow-2xl">
                VS
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 transform hover:scale-105 transition-transform duration-300">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-400 to-orange-400 rounded-full blur-xl opacity-75 group-hover:opacity-100 animate-pulse" />
              <Avatar className="relative w-32 h-32 lg:w-40 lg:h-40 ring-8 ring-red-400/50 shadow-[0_0_50px_rgba(239,68,68,0.6)]">
                <AvatarImage src={player2?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-red-400 to-red-600 text-white text-5xl lg:text-6xl">
                  {player2?.username?.charAt(0).toUpperCase() || <User className="w-16 h-16 lg:w-20 lg:h-20" />}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl lg:text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                {player2?.username || 'Spieler 2'}
              </h3>
              {player2Stats && (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 blur-md opacity-60">
                      <img
                        src={player2Stats.rankBadge}
                        alt={player2Stats.rankName}
                        className="w-12 h-12 lg:w-16 lg:h-16 object-contain"
                      />
                    </div>
                    <img
                      src={player2Stats.rankBadge}
                      alt={player2Stats.rankName}
                      className="relative w-12 h-12 lg:w-16 lg:h-16 object-contain drop-shadow-2xl"
                    />
                  </div>
                  <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${player2Stats.rankGradient} text-white font-bold text-sm shadow-lg`}>
                    {player2Stats.rankName}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
}