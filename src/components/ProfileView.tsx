import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Plus, Flame, Clock, Trophy, X, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { ALL_COUNTRIES } from '@/data/countries-full';
import { Input } from './ui/input';
import { getXPProgress } from '@/lib/xpSystem';
import { ClanCreator } from './ClanCreator';
import bronzeBadge from '@/assets/bronze.webp';
import silverBadge from '@/assets/silber.webp';
import goldBadge from '@/assets/gold.webp';
import platinumBadge from '@/assets/plartinum.webp';
import diamondBadge from '@/assets/diamant.webp';
import legendsBadge from '@/assets/legends.webp';
import mastersBadge from '@/assets/masters.webp';

const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};
interface ProfileViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
interface LeaderboardStats {
  bestStreak: number;
  bestTimeMode: number; // in seconds
  duelWins: number;
  bestPosition: number;
}
interface ProfileData {
  flag?: string;
  continent?: string;
  clan?: string;
}
interface Clan {
  id?: string;
  name: string;
  emoji: string;
  custom?: boolean;
  createdBy?: string;
}

const DEFAULT_CLANS: Clan[] = [{
  name: 'Agharta',
  emoji: '🏯'
}, {
  name: 'Shambhala',
  emoji: '☀️'
}, {
  name: 'Atlantis',
  emoji: '💎'
}, {
  name: 'Lemuria',
  emoji: '🌺'
}, {
  name: 'Mu',
  emoji: '🌀'
}, {
  name: 'Hyperborea',
  emoji: '🩵'
}, {
  name: 'Avalon',
  emoji: '🌸'
}, {
  name: 'Thule',
  emoji: '🧭'
}, {
  name: 'El Dorado',
  emoji: '🪙'
}, {
  name: 'Agni Order',
  emoji: '🔥'
}];
const CONTINENTS = [{
  code: 'EU',
  emoji: '🌍'
}, {
  code: 'AS',
  emoji: '🌏'
}, {
  code: 'AF',
  emoji: '🌍'
}, {
  code: 'NA',
  emoji: '🌎'
}, {
  code: 'SA',
  emoji: '🌎'
}, {
  code: 'OC',
  emoji: '🌏'
}, {
  code: 'AN',
  emoji: '🌐'
}];
type RankTier = {
  name: string;
  badge: string;
  gradient: string;
  minStreak: number;
  minTimeSeconds: number;
  minDuelWins: number;
  minLevel: number;
};
const RANK_TIERS: RankTier[] = [{
  name: 'Legends',
  badge: legendsBadge,
  gradient: 'from-purple-600 via-purple-500 to-pink-500',
  minStreak: 1000,
  minTimeSeconds: 480,
  // <8 minutes
  minDuelWins: 500,
  minLevel: 7
}, {
  name: 'Masters',
  badge: mastersBadge,
  gradient: 'from-blue-600 via-blue-500 to-purple-500',
  minStreak: 100,
  minTimeSeconds: 480,
  // 8-9 minutes
  minDuelWins: 500,
  minLevel: 6
}, {
  name: 'Diamond',
  badge: diamondBadge,
  gradient: 'from-cyan-400 via-blue-400 to-cyan-300',
  minStreak: 60,
  minTimeSeconds: 480,
  // 8-10 minutes
  minDuelWins: 400,
  minLevel: 5
}, {
  name: 'Platinum',
  badge: platinumBadge,
  gradient: 'from-slate-400 via-slate-300 to-slate-200',
  minStreak: 30,
  minTimeSeconds: 600,
  // 10-12 minutes
  minDuelWins: 300,
  minLevel: 4
}, {
  name: 'Gold',
  badge: goldBadge,
  gradient: 'from-yellow-600 via-yellow-500 to-yellow-400',
  minStreak: 15,
  minTimeSeconds: 720,
  // 12-15 minutes
  minDuelWins: 150,
  minLevel: 3
}, {
  name: 'Silver',
  badge: silverBadge,
  gradient: 'from-gray-400 via-gray-300 to-gray-400',
  minStreak: 5,
  minTimeSeconds: 900,
  // 15-20 minutes
  minDuelWins: 50,
  minLevel: 2
}, {
  name: 'Bronze',
  badge: bronzeBadge,
  gradient: 'from-orange-600 via-orange-500 to-orange-400',
  minStreak: 0,
  minTimeSeconds: 1200,
  // >20 minutes
  minDuelWins: 0,
  minLevel: 1
}];

// Calculate rank tier based on duel wins
const getDuelRank = (duelWins: number): number => {
  if (duelWins >= 500) return 7; // Legends or Masters
  if (duelWins >= 400) return 5; // Diamond
  if (duelWins >= 300) return 4; // Platinum
  if (duelWins >= 150) return 3; // Gold
  if (duelWins >= 50) return 2; // Silver
  return 1; // Bronze
};

// Calculate rank tier based on streak
const getStreakRank = (streak: number): number => {
  if (streak >= 1000) return 7; // Legends
  if (streak >= 100) return 6; // Masters
  if (streak >= 60) return 5; // Diamond
  if (streak >= 30) return 4; // Platinum
  if (streak >= 15) return 3; // Gold
  if (streak >= 5) return 2; // Silver
  return 1; // Bronze
};

// Calculate rank tier based on time (in seconds)
const getTimeRank = (timeSeconds: number): number => {
  if (timeSeconds === 0 || timeSeconds === 9999) return 1; // Bronze (no time)
  if (timeSeconds < 480) return 7; // Legends (<8 min)
  if (timeSeconds < 540) return 6; // Masters (8-9 min)
  if (timeSeconds < 600) return 5; // Diamond (8-10 min)
  if (timeSeconds < 720) return 4; // Platinum (10-12 min)
  if (timeSeconds < 900) return 3; // Gold (12-15 min)
  if (timeSeconds < 1200) return 2; // Silver (15-20 min)
  return 1; // Bronze (>20 min)
};
const calculateRank = (stats: LeaderboardStats, level: number): RankTier => {
  const {
    bestStreak,
    bestTimeMode,
    duelWins
  } = stats;

  // Calculate average rank
  const duelRank = getDuelRank(duelWins);
  const streakRank = getStreakRank(bestStreak);
  const timeRank = getTimeRank(bestTimeMode);
  const averageRank = Math.round((duelRank + streakRank + timeRank) / 3);

  // Map average rank to tier (1=Bronze, 2=Silver, 3=Gold, 4=Platinum, 5=Diamond, 6=Masters, 7=Legends)
  const tierIndex = 7 - averageRank; // Reverse because array is ordered from highest to lowest
  return RANK_TIERS[Math.max(0, Math.min(tierIndex, RANK_TIERS.length - 1))];
};
const calculateRankScore = (stats: LeaderboardStats, level: number): number => {
  // Calculate a composite score for ranking players based on average rank
  const duelRank = getDuelRank(stats.duelWins);
  const streakRank = getStreakRank(stats.bestStreak);
  const timeRank = getTimeRank(stats.bestTimeMode);
  return (duelRank + streakRank + timeRank) / 3;
};
export const ProfileView = ({
  open,
  onOpenChange
}: ProfileViewProps) => {
  const {
    user
  } = useAuth();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [accountCreated, setAccountCreated] = useState('');
  const [level, setLevel] = useState(0);
  const [xp, setXp] = useState(0);
  const [leaderboardStats, setLeaderboardStats] = useState<LeaderboardStats>({
    bestStreak: 0,
    bestTimeMode: 0,
    duelWins: 0,
    bestPosition: 999
  });
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [editingSlot, setEditingSlot] = useState<'flag' | 'continent' | 'clan' | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRankInfo, setShowRankInfo] = useState(false);
  const [showClanCreator, setShowClanCreator] = useState(false);
  const [allClans, setAllClans] = useState<Clan[]>([...DEFAULT_CLANS]);
  useEffect(() => {
    if (open && user) {
      loadProfileData();
      loadClans();
    }
  }, [open, user]);

  const loadClans = async () => {
    try {
      const { data: customClans } = await supabase
        .from('clans')
        .select('id, name, emoji, created_by')
        .order('created_at', { ascending: false });

      if (customClans) {
        const clansWithMeta = customClans.map(clan => ({
          id: clan.id,
          name: clan.name,
          emoji: clan.emoji,
          custom: true,
          createdBy: clan.created_by
        }));
        setAllClans([...DEFAULT_CLANS, ...clansWithMeta]);
      }
    } catch (error) {
      console.error('Error loading clans:', error);
    }
  };
  const loadProfileData = async () => {
    if (!user) return;
    try {
      // Load profile
      const {
        data: profile
      } = await supabase.from('profiles').select('username, avatar_url, created_at, selected_flag, selected_continent, selected_clan').eq('user_id', user.id).single();
      if (profile) {
        setUsername(profile.username || user.email?.split('@')[0] || 'User');
        setAvatarUrl(profile.avatar_url || '');
        setAccountCreated(new Date(profile.created_at).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }));

        // Load customization data from Supabase
        setProfileData({
          flag: profile.selected_flag || undefined,
          continent: profile.selected_continent || undefined,
          clan: profile.selected_clan || undefined
        });
      }

      // Load XP and level from user_stats
      const {
        data: userStats
      } = await supabase.from('user_stats').select('xp, level, multiplayer_wins').eq('user_id', user.id).single();
      if (userStats) {
        setLevel(userStats.level || 0);
        setXp(userStats.xp || 0);
      }

      // Load stats from leaderboard
      const {
        data: streakData
      } = await supabase.from('leaderboards').select('score').eq('user_id', user.id).eq('game_mode', 'streak').order('score', {
        ascending: false
      }).limit(1).maybeSingle();
      const {
        data: timedData
      } = await supabase.from('leaderboards').select('score').eq('user_id', user.id).eq('game_mode', 'timed').order('score', {
        ascending: true
      }).limit(1).maybeSingle();
      const bestStreak = streakData?.score || 0;
      const bestTimeMode = timedData?.score || 0;
      const duelWins = userStats?.multiplayer_wins || 0;

      // Calculate best position by comparing with all players
      const {
        data: allPlayers
      } = await supabase.from('user_stats').select('user_id, xp, level, multiplayer_wins');
      let bestPosition = 1;
      const currentScore = calculateRankScore({
        bestStreak,
        bestTimeMode,
        duelWins,
        bestPosition: 0
      }, level);
      if (allPlayers) {
        for (const player of allPlayers) {
          if (player.user_id === user.id) continue;

          // Get player's streak and time scores
          const {
            data: playerStreak
          } = await supabase.from('leaderboards').select('score').eq('user_id', player.user_id).eq('game_mode', 'streak').order('score', {
            ascending: false
          }).limit(1).maybeSingle();
          const {
            data: playerTime
          } = await supabase.from('leaderboards').select('score').eq('user_id', player.user_id).eq('game_mode', 'timed').order('score', {
            ascending: true
          }).limit(1).maybeSingle();
          const playerStats = {
            bestStreak: playerStreak?.score || 0,
            bestTimeMode: playerTime?.score || 0,
            duelWins: player.multiplayer_wins || 0,
            bestPosition: 0
          };
          const playerScore = calculateRankScore(playerStats, player.level || 0);
          if (playerScore > currentScore) {
            bestPosition++;
          }
        }
      }
      setLeaderboardStats({
        bestStreak,
        bestTimeMode,
        duelWins,
        bestPosition
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };
  const updateProfileField = async (field: keyof ProfileData, value: string | null) => {
    if (!user) return;
    try {
      const newData = {
        ...profileData,
        [field]: value || undefined
      };
      setProfileData(newData);

      // Save to Supabase - for flags, save the code not the emoji
      const updateField = `selected_${field}` as 'selected_flag' | 'selected_continent' | 'selected_clan';
      await supabase.from('profiles').update({
        [updateField]: value
      }).eq('user_id', user.id);
      setEditingSlot(null);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  const xpProgress = getXPProgress(xp);
  const levelProgress = xpProgress.progressPercentage;
  const rank = calculateRank(leaderboardStats, level);
  const formatTime = (seconds: number) => {
    if (seconds === 0 || seconds === 9999) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  if (!open) return null;
  return <>
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 flex items-center justify-center p-4">
        {/* Close Button */}
        <button onClick={() => onOpenChange(false)} className="fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="w-full max-w-7xl flex flex-col h-full max-h-screen">
          {/* Top Section: Avatar + Username + Level + Progress + Customization */}
          <div className="flex-1 flex items-center mb-3 md:mb-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-10 w-full">
            {/* Avatar Column - Centered on mobile */}
            <div className="flex flex-col items-center">
              <Avatar className="h-40 w-40 md:h-64 md:w-64 ring-4 md:ring-8 ring-white shadow-2xl">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-6xl md:text-9xl bg-blue-500 text-white">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-gray-300 mt-3 font-medium hidden md:block" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>Joined {accountCreated}</p>
            </div>

            {/* Right Side: Username, Level Bar, and Customization Slots - Centered on mobile */}
            <div className="flex-1 flex flex-col items-center md:items-start w-full">
              <h1 className="text-4xl md:text-7xl font-bold text-white mb-1 md:mb-3 leading-none text-center md:text-left" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                {username}
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-2 font-medium text-center md:text-left" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>Level {level}</p>


              {/* XP Progress Bar */}
              <div className="h-5 md:h-7 bg-white/30 backdrop-blur-sm rounded-full overflow-hidden shadow-inner w-full max-w-md md:max-w-2xl mb-3 md:mb-6">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500 rounded-full" style={{
                width: `${Math.max(2, Math.min(levelProgress, 100))}%`
              }} />
              </div>

              {/* Customization Slots */}
              <div className="flex gap-2 md:gap-3 justify-center md:justify-start">
                {/* Flag Slot */}
                <button onClick={() => {
                if (profileData.flag) {
                  updateProfileField('flag', null);
                } else {
                  setEditingSlot('flag');
                }
              }} className="w-20 h-20 md:w-28 md:h-28 bg-white/40 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-lg flex flex-col items-center justify-center hover:shadow-xl transition-all hover:scale-105">
                  {profileData.flag ? (
                    <>
                      <span className="text-3xl md:text-5xl mb-0.5 md:mb-1" style={{ fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' }}>
                        {getFlagEmoji(profileData.flag)}
                      </span>
                      <span className="text-[10px] md:text-xs text-gray-600 font-semibold" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                        {profileData.flag}
                      </span>
                    </>
                  ) : (
                    <Plus className="w-6 md:w-8 h-6 md:h-8 text-gray-300" />
                  )}
                </button>

                {/* Continent Slot */}
                <button onClick={() => {
                if (profileData.continent) {
                  updateProfileField('continent', null);
                } else {
                  setEditingSlot('continent');
                }
              }} className="w-20 h-20 md:w-28 md:h-28 bg-white/40 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-lg flex flex-col items-center justify-center hover:shadow-xl transition-all hover:scale-105">
                  {profileData.continent ? <>
                      <span className="text-2xl md:text-4xl mb-0.5 md:mb-1">
                        {CONTINENTS.find(c => c.code === profileData.continent)?.emoji}
                      </span>
                      <span className="text-[10px] md:text-xs text-gray-600 font-semibold" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                        {profileData.continent}
                      </span>
                    </> : <Plus className="w-6 md:w-8 h-6 md:h-8 text-gray-300" />}
                </button>

                {/* Clan Slot */}
                <button onClick={() => {
                if (profileData.clan) {
                  updateProfileField('clan', null);
                } else {
                  setEditingSlot('clan');
                }
              }} className="w-20 h-20 md:w-28 md:h-28 bg-white/40 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-lg flex flex-col items-center justify-center hover:shadow-xl transition-all hover:scale-105">
                {profileData.clan ? <>
                      <span className="text-2xl md:text-4xl mb-0.5 md:mb-1">
                        {allClans.find(c => c.name === profileData.clan)?.emoji}
                      </span>
                      <span className="text-[10px] md:text-xs text-gray-600 font-semibold" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                        {profileData.clan}
                      </span>
                    </> : <Plus className="w-6 md:w-8 h-6 md:h-8 text-gray-300" />}
                </button>
              </div>
            </div>
          </div>
          </div>


          {/* Player Stats Header */}
          <h2 className="text-[10px] md:text-sm font-bold text-gray-300 uppercase tracking-[0.2em] md:tracking-[0.25em] mb-2 md:mb-3 text-center md:text-left" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
            PLAYER STATS
          </h2>

          {/* Stats Grid - Mobile: 3 in row, then rank full width. Desktop: 3 narrow + 1 wider */}
          <div className="grid grid-cols-3 md:grid-cols-10 gap-2 md:gap-4">
            {/* Best Streak */}
            <div className="col-span-1 md:col-span-2 bg-white/30 backdrop-blur-sm rounded-xl md:rounded-3xl shadow-lg p-2 md:p-5 flex flex-col items-center justify-center min-h-[70px] md:min-h-[140px]">
              <p className="text-[7px] md:text-xs text-gray-300 uppercase tracking-wide font-bold mb-0.5 md:mb-3 text-center leading-tight" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                STREAK
              </p>
              <div className="flex items-center gap-0.5 md:gap-2">
                <Flame className="w-4 h-4 md:w-8 md:h-8 text-orange-500" />
                <span className="text-base md:text-4xl font-bold text-white" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                  {leaderboardStats.bestStreak}
                </span>
              </div>
            </div>

            {/* Time Mode */}
            <div className="col-span-1 md:col-span-2 bg-white/30 backdrop-blur-sm rounded-xl md:rounded-3xl shadow-lg p-2 md:p-5 flex flex-col items-center justify-center min-h-[70px] md:min-h-[140px]">
              <p className="text-[7px] md:text-xs text-gray-300 uppercase tracking-wide font-bold mb-0.5 md:mb-3 text-center leading-tight" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                ZEIT
              </p>
              <div className="flex items-center gap-0.5 md:gap-2">
                <Clock className="w-4 h-4 md:w-8 md:h-8 text-blue-500" />
                <span className="text-base md:text-4xl font-bold text-white" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                  {formatTime(leaderboardStats.bestTimeMode)}
                </span>
              </div>
            </div>

            {/* Duel Wins */}
            <div className="col-span-1 md:col-span-2 bg-white/30 backdrop-blur-sm rounded-xl md:rounded-3xl shadow-lg p-2 md:p-5 flex flex-col items-center justify-center min-h-[70px] md:min-h-[140px]">
              <p className="text-[7px] md:text-xs text-gray-300 uppercase tracking-wide font-bold mb-0.5 md:mb-3 text-center leading-tight" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                WINS
              </p>
              <div className="flex items-center gap-0.5 md:gap-2">
                <Trophy className="w-4 h-4 md:w-8 md:h-8 text-yellow-500" />
                <span className="text-base md:text-4xl font-bold text-white" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                  {leaderboardStats.duelWins}
                </span>
              </div>
            </div>

            {/* Rank Badge - Full width on mobile, wider on desktop */}
            <div className="col-span-3 md:col-span-4 bg-white/30 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-lg p-3 md:p-6 flex flex-col md:flex-row items-center md:gap-5 min-h-[120px] md:min-h-[140px] relative overflow-hidden">
              <div className="flex-shrink-0 w-16 h-16 md:w-24 md:h-24 flex items-center justify-center relative overflow-visible mb-1 md:mb-0">
                <img
                  src={rank.badge}
                  alt={rank.name}
                  className="absolute w-32 h-32 md:w-56 md:h-56 object-contain scale-125"
                />
              </div>

              <div className="flex flex-col flex-1 md:ml-8 items-center md:items-start">
                <p className="text-2xl md:text-4xl font-bold text-white leading-tight text-center md:text-left" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                  {rank.name}
                </p>
                <p className="text-xs md:text-sm text-gray-300 mt-0.5 md:mt-1 font-medium text-center md:text-left" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                  Best Position #{leaderboardStats.bestPosition}
                </p>
              </div>
              <button onClick={() => setShowRankInfo(true)} className="absolute top-2 right-2 md:top-3 md:right-3 p-1 md:p-2 bg-white/60 hover:bg-white/80 rounded-full transition-colors">
                <Info className="w-3 h-3 md:w-5 md:h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rank Info Dialog */}
      {showRankInfo && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl">Rank Übersicht</h3>
              <button onClick={() => setShowRankInfo(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mb-6">
              {[...RANK_TIERS].reverse().map((tier, index) => {
                const getRankGlowColor = (name: string) => {
                  switch(name) {
                    case 'Bronze': return 'group-hover:drop-shadow-[0_0_20px_rgba(194,120,3,0.8)]';
                    case 'Silver': return 'group-hover:drop-shadow-[0_0_20px_rgba(156,163,175,0.8)]';
                    case 'Gold': return 'group-hover:drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]';
                    case 'Platinum': return 'group-hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]';
                    case 'Diamond': return 'group-hover:drop-shadow-[0_0_20px_rgba(56,189,248,0.8)]';
                    case 'Masters': return 'group-hover:drop-shadow-[0_0_20px_rgba(37,99,235,0.8)]';
                    case 'Legends': return 'group-hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]';
                    default: return '';
                  }
                };

                return <div
                    key={tier.name}
                    className="flex flex-col items-center gap-2 group w-[calc(25%-0.75rem)] md:w-auto"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-all duration-300">
                      <img
                        src={tier.badge}
                        alt={tier.name}
                        className={`w-full h-full object-contain transition-all duration-300 group-hover:scale-125 ${getRankGlowColor(tier.name)}`}
                      />
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-gray-800">{tier.name}</p>
                  </div>;
          })}
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-700 text-center">
                Dein Rang wird basierend auf dem Durchschnitt deiner Scores berechnet.
              </p>
            </div>
          </div>
        </div>}

      {/* Selection Dialogs */}
      {editingSlot === 'flag' && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-4xl max-h-[80vh] overflow-y-auto w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">Wähle dein Land</h3>
              <button onClick={() => setEditingSlot(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <Input placeholder="Land suchen..." className="mb-4 bg-white" onChange={e => {
          const search = e.target.value.toLowerCase();
          const filtered = ALL_COUNTRIES.filter(c => c.name.toLowerCase().includes(search) || c.code.toLowerCase().includes(search));
        }} />
            <div className="grid grid-cols-6 gap-3">
              {ALL_COUNTRIES.map(country => <button key={country.code} onClick={() => updateProfileField('flag', country.code)} className="flex flex-col items-center justify-center p-3 hover:bg-gray-100 rounded-lg transition-all hover:scale-105">
                  <span className="text-5xl mb-2" style={{ fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' }}>{getFlagEmoji(country.code)}</span>
                  <span className="text-xs text-gray-600 font-medium">{country.code}</span>
                </button>)}
            </div>
          </div>
        </div>}

      {editingSlot === 'continent' && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">Wähle deinen Kontinent</h3>
              <button onClick={() => setEditingSlot(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {CONTINENTS.map(continent => <button key={continent.code} onClick={() => updateProfileField('continent', continent.code)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="text-2xl">{continent.emoji}</span>
                  <span className="font-medium">{continent.code}</span>
                </button>)}
            </div>
          </div>
        </div>}

      {editingSlot === 'clan' && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">Wähle deinen Clan</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setShowClanCreator(true);
                  }}
                  className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                  title="Neuen Clan erstellen"
                >
                  <Plus className="w-5 h-5 text-blue-600" />
                </button>
                <button onClick={() => setEditingSlot(null)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {allClans.map(clan => <div key={clan.name} className="relative group">
                  <button 
                    onClick={() => updateProfileField('clan', clan.name)} 
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-3xl">{clan.emoji}</span>
                    <span className="font-medium text-lg">{clan.name}</span>
                  </button>
                  {clan.custom && clan.createdBy === user?.id && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Clan "${clan.name}" wirklich löschen?`)) {
                          const { error } = await supabase
                            .from('clans')
                            .delete()
                            .eq('id', clan.id);

                          if (error) {
                            console.error('Error deleting clan:', error);
                          } else {
                            if (profileData.clan === clan.name) {
                              updateProfileField('clan', null);
                            }
                            loadClans();
                          }
                        }
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                      title="Clan löschen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>)}
            </div>
          </div>
        </div>}

      {showClanCreator && (
        <ClanCreator
          onClose={() => setShowClanCreator(false)}
          onClanCreated={(clan) => {
            loadClans(); // Reload clans list
            updateProfileField('clan', clan.name); // Auto-select the new clan
          }}
        />
      )}
    </>;
};
