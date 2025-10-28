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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Flag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Flaggen-Guesser</h1>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Get ready!</h2>
            <div className="text-8xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse mb-4">
              {count}
            </div>
          </div>

          <div className="flex items-center justify-center gap-12 lg:gap-24 w-full">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-32 h-32 lg:w-40 lg:h-40 ring-4 ring-blue-300/30 shadow-2xl">
                  <AvatarImage src={player1?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-4xl lg:text-5xl">
                    {player1?.username?.charAt(0).toUpperCase() || <User className="w-16 h-16 lg:w-20 lg:h-20" />}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl lg:text-3xl font-bold text-white">
                  {player1?.username || 'Spieler 1'}
                </h3>
                {player1Stats && (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={player1Stats.rankBadge}
                      alt={player1Stats.rankName}
                      className="w-16 h-16 object-contain"
                    />
                    <div className={`px-4 py-1 rounded-full bg-gradient-to-r ${player1Stats.rankGradient} text-white font-semibold text-sm`}>
                      {player1Stats.rankName}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative">
                <span className="text-6xl lg:text-8xl font-black bg-gradient-to-r from-yellow-400 via-red-500 to-orange-600 bg-clip-text text-transparent drop-shadow-2xl">
                  VS
                </span>
                <span className="absolute inset-0 text-6xl lg:text-8xl font-black text-orange-500 blur-sm opacity-50">
                  VS
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-32 h-32 lg:w-40 lg:h-40 ring-4 ring-red-300/30 shadow-2xl">
                  <AvatarImage src={player2?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-red-400 to-red-600 text-white text-4xl lg:text-5xl">
                    {player2?.username?.charAt(0).toUpperCase() || <User className="w-16 h-16 lg:w-20 lg:h-20" />}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl lg:text-3xl font-bold text-white">
                  {player2?.username || 'Spieler 2'}
                </h3>
                {player2Stats && (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={player2Stats.rankBadge}
                      alt={player2Stats.rankName}
                      className="w-16 h-16 object-contain"
                    />
                    <div className={`px-4 py-1 rounded-full bg-gradient-to-r ${player2Stats.rankGradient} text-white font-semibold text-sm`}>
                      {player2Stats.rankName}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}