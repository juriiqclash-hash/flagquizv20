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
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 flex items-center justify-center" style={{ padding: '1rem' }}>
        {/* Close Button */}
        <button onClick={() => onOpenChange(false)} className="fixed z-50 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors" style={{ top: '1rem', right: '1rem', padding: '0.5rem' }}>
          <X className="text-gray-600" style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>

        <div className="w-full max-w-7xl flex flex-col h-full max-h-screen">
          {/* Top Section: Avatar + Username + Level + Progress + Customization */}
          <div className="flex-1 flex items-center md:pl-2" style={{ marginBottom: '1rem' }}>
          <div className="flex flex-col md:flex-row items-center md:items-start w-full" style={{ gap: '2.5rem' }}>
            {/* Avatar Column - Centered on mobile */}
            <div className="flex flex-col items-center">
              <Avatar className="ring-white shadow-2xl" style={{ height: '10rem', width: '10rem', ringWidth: '0.5rem' }}>
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-blue-500 text-white" style={{ fontSize: '4rem' }}>
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-gray-300 font-medium hidden md:block" style={{ fontFamily: '"VAG Rounded", sans-serif', fontSize: '0.875rem', marginTop: '0.75rem' }}>Joined {accountCreated}</p>
            </div>

            {/* Right Side: Username, Level Bar, and Customization Slots - Centered on mobile */}
            <div className="flex-1 flex flex-col items-center md:items-start w-full">
              <h1 className="font-bold text-white leading-none text-center md:text-left" style={{ fontFamily: '"VAG Rounded", sans-serif', fontSize: '3rem', marginBottom: '0.75rem' }}>
                {username}
              </h1>
              <p className="text-gray-300 font-medium text-center md:text-left" style={{ fontFamily: '"VAG Rounded", sans-serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Level {level}</p>


              {/* XP Progress Bar */}
              <div className="bg-white/30 backdrop-blur-sm rounded-full overflow-hidden shadow-inner w-full max-w-2xl" style={{ height: '1.75rem', marginBottom: '1.5rem' }}>
                <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500 rounded-full" style={{
                width: `${Math.max(2, Math.min(levelProgress, 100))}%`
              }} />
              </div>

              {/* Customization Slots */}
              <div className="flex justify-center md:justify-start" style={{ gap: '0.75rem' }}>
                {/* Flag Slot */}
                <button onClick={() => {
                if (profileData.flag) {
                  updateProfileField('flag', null);
                } else {
                  setEditingSlot('flag');
                }
              }} className="bg-white/40 backdrop-blur-sm shadow-lg flex flex-col items-center justify-center hover:shadow-xl transition-all hover:scale-105" style={{ width: '7rem', height: '7rem', borderRadius: '1.5rem' }}>
                  {profileData.flag ? (
                    <>
                      <span style={{ fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif', fontSize: '3rem', marginBottom: '0.25rem' }}>
                        {getFlagEmoji(profileData.flag)}
                      </span>
                      <span className="text-gray-600 font-semibold" style={{ fontFamily: '"VAG Rounded", sans-serif', fontSize: '0.75rem' }}>
                        {profileData.flag}
                      </span>
                    </>
                  ) : (
                    <Plus className="text-gray-300" style={{ width: '2rem', height: '2rem' }} />
                  )}
                </button>

                {/* Continent Slot */}
                <button onClick={() => {
                if (profileData.continent) {
                  updateProfileField('continent', null);
                } else {
                  setEditingSlot('continent');
                }
              }} className="bg-white/40 backdrop-blur-sm shadow-lg flex flex-col items-center justify-center hover:shadow-xl transition-all hover:scale-105" style={{ width: '7rem', height: '7rem', borderRadius: '1.5rem' }}>
                  {profileData.continent ? <>
                      <span style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>
                        {CONTINENTS.find(c => c.code === profileData.continent)?.emoji}
                      </span>
                      <span className="text-gray-600 font-semibold" style={{ fontFamily: '"VAG Rounded", sans-serif', fontSize: '0.75rem' }}>
                        {profileData.continent}
                      </span>
                    </> : <Plus className="text-gray-300" style={{ width: '2rem', height: '2rem' }} />}
                </button>

                {/* Clan Slot */}
                <button onClick={() => {
                if (profileData.clan) {
                  updateProfileField('clan', null);
                } else {
                  setEditingSlot('clan');
                }
              }} className="bg-white/40 backdrop-blur-sm shadow-lg flex flex-col items-center justify-center hover:shadow-xl transition-all hover:scale-105" style={{ width: '7rem', height: '7rem', borderRadius: '1.5rem' }}>
                {profileData.clan ? <>
                      <span style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>
                        {allClans.find(c => c.name === profileData.clan)?.emoji}
                      </span>
                      <span className="text-gray-600 font-semibold" style={{ fontFamily: '"VAG Rounded", sans-serif', fontSize: '0.75rem' }}>
                        {profileData.clan}
                      </span>
                    </> : <Plus className="text-gray-300" style={{ width: '2rem', height: '2rem' }} />}
                </button>
              </div>
            </div>
          </div>
          </div>


          {/* Player Stats Header */}
          <h2 className="font-bold text-gray-300 uppercase text-center md:text-left" style={{ fontFamily: '"VAG Rounded", sans-serif', fontSize: '0.875rem', letterSpacing: '0.25em', marginBottom: '0.75rem' }}>
            PLAYER STATS
          </h2>

          {/* Stats Grid - Mobile: 3 in row, then rank full width. Desktop: 3 narrow + 1 wider */}
          <div className="grid grid-cols-3 md:grid-cols-10" style={{ gap: '1rem' }}>
            {/* Best Streak */}
            <div className="col-span-1 md:col-span-2 bg-white/30 backdrop-blur-sm shadow-lg flex flex-col items-center justify-center" style={{ borderRadius: '1.5rem', padding: '1.25rem', minHeight: '8.75rem' }}>
              <p className="text-gray-300 uppercase tracking-wide font-bold text-center leading-tight" style={{ fontFamily: '"VAG Rounded", sans-serif', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                STREAK
              </p>
              <div className="flex items-center" style={{ gap: '0.5rem' }}>
                <Flame className="text-orange-500" style={{ width: '2rem', height: '2rem' }} />
                <span className="font-bold text-white" style={{ fontFamily: '"VAG Rounded", sans-serif', fontSize: '2.5rem' }}>
                  {leaderboardStats.bestStreak}
                </span>
              </div>
            </div>

            {/* Time Mode */}
            <div className="col-span-1 md:col-span-2 bg-white/30 backdrop-blur-sm shadow-lg flex flex-col items-center justify-center" style={{ borderRadius: '1.5rem', padding: '1.25rem', minHeight: '8.75rem' }}>
              <p className="text-gray-300 uppercase tracking-wide font-bold text-center leading-tight" style={{ fontFamily: '"VAG Rounded", sans-serif', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                ZEIT
              </p>
              <div className="flex items-center" style={{ gap: '0.5rem' }}>
                <Clock className="text-blue-500" style={{ width: '2rem', height: '2rem' }} />
                <span className="font-bold text-white" style={{ fontFamily: '"VAG Rounded", sans-serif', fontSize: '2.5rem' }}>
                  {formatTime(leaderboardStats.bestTimeMode)}
                </span>
              </div>
            </div>

            {/* Duel Wins */}
            <div className="col-span-1 md:col-span-2 bg-white/30 backdrop-blur-sm shadow-lg flex flex-col items-center justify-center" style={{ borderRadius: '1.5rem', padding: '1.25rem', minHeight: '8.75rem' }}>
              <p className="text-gray-300 uppercase tracking-wide font-bold text-center leading-tight" style={{ fontFamily: '"VAG Rounded", sans-serif', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                WINS
              </p>
              <div className="flex items-center" style={{ gap: '0.5rem' }}>
                <Trophy className="text-yellow-500" style={{ width: '2rem', height: '2rem' }} />
                <span className="font-bold text-white" style={{ fontFamily: '"VAG Rounded", sans-serif', fontSize: '2.5rem' }}>
                  {leaderboardStats.duelWins}
                </span>
              </div>
            </div>

            {/* Rank Badge - Full width on mobile, wider on desktop */}
            <div className="col-span-3 md:col-span-4 bg-white/30 backdrop-blur-sm shadow-lg flex flex-col md:flex-row items-center relative overflow-hidden" style={{ borderRadius: '1.5rem', padding: '1.5rem', gap: '1.25rem', minHeight: '8.75rem' }}>
              <div className="flex-shrink-0 flex items-center justify-center relative overflow-visible" style={{ width: '6rem', height: '6rem' }}>
                <img
                  src={rank.badge}
                  alt={rank.name}
                  className="absolute object-contain scale-125"
                  style={{ width: '14rem', height: '14rem' }}
                />
              </div>

              <div className="flex flex-col flex-1 items-center md:items-start" style={{ marginLeft: '2rem' }}>
                <p className="font-bold text-white leading-tight text-center md:text-left" style={{ fontFamily: '"VAG Rounded", sans-serif', fontSize: '2.5rem' }}>
                  {rank.name}
                </p>
                <p className="text-gray-300 font-medium text-center md:text-left" style={{ fontFamily: '"VAG Rounded", sans-serif', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  Best Position #{leaderboardStats.bestPosition}
                </p>
              </div>
              <button onClick={() => setShowRankInfo(true)} className="absolute bg-white/60 hover:bg-white/80 rounded-full transition-colors" style={{ top: '0.75rem', right: '0.75rem', padding: '0.5rem' }}>
                <Info className="text-gray-600" style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rank Info Dialog */}
      {showRankInfo && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white max-w-4xl w-full" style={{ borderRadius: '1rem', padding: '1.5rem', margin: '1rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <h3 className="font-bold" style={{ fontSize: '1.5rem' }}>Rank Übersicht</h3>
              <button onClick={() => setShowRankInfo(false)} className="hover:bg-gray-100 rounded-full" style={{ padding: '0.25rem' }}>
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>

            <div className="flex flex-wrap justify-center" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
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
                    className="flex flex-col items-center group w-[calc(25%-0.75rem)] md:w-auto"
                    style={{ gap: '0.5rem' }}
                  >
                    <div className="flex items-center justify-center transition-all duration-300" style={{ width: '6rem', height: '6rem' }}>
                      <img
                        src={tier.badge}
                        alt={tier.name}
                        className={`w-full h-full object-contain transition-all duration-300 group-hover:scale-125 ${getRankGlowColor(tier.name)}`}
                      />
                    </div>
                    <p className="font-semibold text-gray-800" style={{ fontSize: '0.875rem' }}>{tier.name}</p>
                  </div>;
          })}
            </div>

            <div className="bg-blue-50" style={{ padding: '1rem', borderRadius: '0.75rem' }}>
              <p className="text-gray-700 text-center" style={{ fontSize: '0.875rem' }}>
                Dein Rang wird basierend auf dem Durchschnitt deiner Scores berechnet.
              </p>
            </div>
          </div>
        </div>}

      {/* Selection Dialogs */}
      {editingSlot === 'flag' && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white max-w-4xl max-h-[80vh] overflow-y-auto w-full" style={{ borderRadius: '1rem', padding: '1.5rem', margin: '1rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h3 className="font-bold" style={{ fontSize: '1.25rem' }}>Wähle dein Land</h3>
              <button onClick={() => setEditingSlot(null)} className="hover:bg-gray-100 rounded-full" style={{ padding: '0.25rem' }}>
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>
            <Input placeholder="Land suchen..." className="bg-white" style={{ marginBottom: '1rem' }} onChange={e => {
          const search = e.target.value.toLowerCase();
          const filtered = ALL_COUNTRIES.filter(c => c.name.toLowerCase().includes(search) || c.code.toLowerCase().includes(search));
        }} />
            <div className="grid grid-cols-6" style={{ gap: '0.75rem' }}>
              {ALL_COUNTRIES.map(country => <button key={country.code} onClick={() => updateProfileField('flag', country.code)} className="flex flex-col items-center justify-center hover:bg-gray-100 transition-all hover:scale-105" style={{ padding: '0.75rem', borderRadius: '0.5rem' }}>
                  <span style={{ fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif', fontSize: '3rem', marginBottom: '0.5rem' }}>{getFlagEmoji(country.code)}</span>
                  <span className="text-gray-600 font-medium" style={{ fontSize: '0.75rem' }}>{country.code}</span>
                </button>)}
            </div>
          </div>
        </div>}

      {editingSlot === 'continent' && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white max-w-md w-full" style={{ borderRadius: '1rem', padding: '1.5rem', margin: '1rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h3 className="font-bold" style={{ fontSize: '1.25rem' }}>Wähle deinen Kontinent</h3>
              <button onClick={() => setEditingSlot(null)} className="hover:bg-gray-100 rounded-full" style={{ padding: '0.25rem' }}>
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {CONTINENTS.map(continent => <button key={continent.code} onClick={() => updateProfileField('continent', continent.code)} className="w-full flex items-center hover:bg-gray-100 transition-colors" style={{ gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{continent.emoji}</span>
                  <span className="font-medium">{continent.code}</span>
                </button>)}
            </div>
          </div>
        </div>}

      {editingSlot === 'clan' && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto" style={{ borderRadius: '1rem', padding: '1.5rem', margin: '1rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h3 className="font-bold" style={{ fontSize: '1.25rem' }}>Wähle deinen Clan</h3>
              <div className="flex" style={{ gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setShowClanCreator(true);
                  }}
                  className="hover:bg-blue-100 rounded-full transition-colors"
                  title="Neuen Clan erstellen"
                  style={{ padding: '0.5rem' }}
                >
                  <Plus className="text-blue-600" style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
                <button onClick={() => setEditingSlot(null)} className="hover:bg-gray-100 rounded-full" style={{ padding: '0.25rem' }}>
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
              {allClans.map(clan => <div key={clan.name} className="relative group">
                  <button
                    onClick={() => updateProfileField('clan', clan.name)}
                    className="w-full flex items-center hover:bg-gray-100 transition-colors"
                    style={{ gap: '0.75rem', padding: '1rem', borderRadius: '0.5rem' }}
                  >
                    <span style={{ fontSize: '1.875rem' }}>{clan.emoji}</span>
                    <span className="font-medium" style={{ fontSize: '1.125rem' }}>{clan.name}</span>
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
                      className="absolute bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                      title="Clan löschen"
                      style={{ top: '0.5rem', right: '0.5rem', padding: '0.25rem' }}
                    >
                      <X style={{ width: '1rem', height: '1rem' }} />
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
