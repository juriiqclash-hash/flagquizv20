import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Plus, Flame, Clock, Trophy, Medal, Award, Gem, Crown, Star, X, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { ALL_COUNTRIES } from '@/data/countries-full';
import { Input } from './ui/input';
import rankBadges from '@/assets/rank-badges-new.png';

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

const CLANS = [
  { name: 'Agharta', emoji: '🛕' },
  { name: 'Shambhala', emoji: '☀️' },
  { name: 'Atlantis', emoji: '💎' },
  { name: 'Lemuria', emoji: '🌺' },
  { name: 'Mu', emoji: '🌀' },
  { name: 'Hyperborea', emoji: '🩵' },
  { name: 'Avalon', emoji: '🌸' },
  { name: 'Thule', emoji: '🧭' },
  { name: 'El Dorado', emoji: '🪙' },
  { name: 'Agni Order', emoji: '🔥' },
];

const CONTINENTS = [
  { code: 'EU', emoji: '🌍' },
  { code: 'AS', emoji: '🌏' },
  { code: 'AF', emoji: '🌍' },
  { code: 'NA', emoji: '🌎' },
  { code: 'SA', emoji: '🌎' },
  { code: 'OC', emoji: '🌏' },
  { code: 'AN', emoji: '🌐' },
];

type RankTier = {
  name: string;
  icon: React.ComponentType<any>;
  gradient: string;
  minStreak: number;
  minTimeSeconds: number;
  minDuelWins: number;
  minLevel: number;
};

const RANK_TIERS: RankTier[] = [
  { 
    name: 'Legends', 
    icon: Crown, 
    gradient: 'from-purple-600 via-purple-500 to-pink-500',
    minStreak: 1000,
    minTimeSeconds: 480, // <8 minutes
    minDuelWins: 500,
    minLevel: 7
  },
  { 
    name: 'Masters', 
    icon: Star, 
    gradient: 'from-yellow-500 via-yellow-400 to-amber-400',
    minStreak: 100,
    minTimeSeconds: 480, // 8-9 minutes
    minDuelWins: 500,
    minLevel: 6
  },
  { 
    name: 'Diamond', 
    icon: Gem, 
    gradient: 'from-cyan-400 via-blue-400 to-cyan-300',
    minStreak: 60,
    minTimeSeconds: 480, // 8-10 minutes
    minDuelWins: 400,
    minLevel: 5
  },
  { 
    name: 'Platinum', 
    icon: Trophy, 
    gradient: 'from-slate-400 via-slate-300 to-slate-200',
    minStreak: 30,
    minTimeSeconds: 600, // 10-12 minutes
    minDuelWins: 300,
    minLevel: 4
  },
  { 
    name: 'Gold', 
    icon: Medal, 
    gradient: 'from-yellow-600 via-yellow-500 to-yellow-400',
    minStreak: 15,
    minTimeSeconds: 720, // 12-15 minutes
    minDuelWins: 150,
    minLevel: 3
  },
  { 
    name: 'Silver', 
    icon: Award, 
    gradient: 'from-gray-400 via-gray-300 to-gray-400',
    minStreak: 5,
    minTimeSeconds: 900, // 15-20 minutes
    minDuelWins: 50,
    minLevel: 2
  },
  { 
    name: 'Bronze', 
    icon: Award, 
    gradient: 'from-orange-600 via-orange-500 to-orange-400',
    minStreak: 0,
    minTimeSeconds: 1200, // >20 minutes
    minDuelWins: 0,
    minLevel: 1
  },
];

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
  const { bestStreak, bestTimeMode, duelWins } = stats;
  
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

export const ProfileView = ({ open, onOpenChange }: ProfileViewProps) => {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [accountCreated, setAccountCreated] = useState('');
  const [level, setLevel] = useState(0);
  const [xp, setXp] = useState(0);
  const [leaderboardStats, setLeaderboardStats] = useState<LeaderboardStats>({
    bestStreak: 0,
    bestTimeMode: 0,
    duelWins: 0,
    bestPosition: 999,
  });
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [editingSlot, setEditingSlot] = useState<'flag' | 'continent' | 'clan' | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRankInfo, setShowRankInfo] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadProfileData();
    }
  }, [open, user]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url, created_at')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUsername(profile.username || user.email?.split('@')[0] || 'User');
        setAvatarUrl(profile.avatar_url || '');
        setAccountCreated(new Date(profile.created_at).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }));
        
        // Load customization data from local storage temporarily
        const savedData = localStorage.getItem(`profile_data_${user.id}`);
        if (savedData) {
          setProfileData(JSON.parse(savedData));
        }
      }

      // Load XP and level from user_stats
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('xp, level, multiplayer_wins')
        .eq('user_id', user.id)
        .single();

      if (userStats) {
        setLevel(userStats.level || 0);
        setXp(userStats.xp || 0);
      }

      // Load stats from leaderboard
      const { data: streakData } = await supabase
        .from('leaderboards')
        .select('score')
        .eq('user_id', user.id)
        .eq('game_mode', 'streak')
        .order('score', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: timedData } = await supabase
        .from('leaderboards')
        .select('score')
        .eq('user_id', user.id)
        .eq('game_mode', 'timed')
        .order('score', { ascending: true })
        .limit(1)
        .maybeSingle();

      const bestStreak = streakData?.score || 0;
      const bestTimeMode = timedData?.score || 0;
      const duelWins = userStats?.multiplayer_wins || 0;

      // Calculate best position by comparing with all players
      const { data: allPlayers } = await supabase
        .from('user_stats')
        .select('user_id, xp, level, multiplayer_wins');

      let bestPosition = 1;
      const currentScore = calculateRankScore({ bestStreak, bestTimeMode, duelWins, bestPosition: 0 }, level);

      if (allPlayers) {
        for (const player of allPlayers) {
          if (player.user_id === user.id) continue;

          // Get player's streak and time scores
          const { data: playerStreak } = await supabase
            .from('leaderboards')
            .select('score')
            .eq('user_id', player.user_id)
            .eq('game_mode', 'streak')
            .order('score', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { data: playerTime } = await supabase
            .from('leaderboards')
            .select('score')
            .eq('user_id', player.user_id)
            .eq('game_mode', 'timed')
            .order('score', { ascending: true })
            .limit(1)
            .maybeSingle();

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
        bestPosition,
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
      const newData = { ...profileData, [field]: value || undefined };
      setProfileData(newData);
      
      // Save to local storage temporarily until database columns are added
      localStorage.setItem(`profile_data_${user.id}`, JSON.stringify(newData));
      
      setEditingSlot(null);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // XP calculation for level 1-100: each level needs progressively more XP
  const xpForLevel = (lvl: number) => lvl * 100; // XP needed to reach this level
  const totalXPForLevel = (lvl: number) => {
    let total = 0;
    for (let i = 1; i <= lvl; i++) {
      total += xpForLevel(i);
    }
    return total;
  };
  
  const currentLevelTotalXP = totalXPForLevel(level);
  const nextLevelTotalXP = totalXPForLevel(level + 1);
  const levelProgress = level >= 100 ? 100 : ((xp - currentLevelTotalXP) / (nextLevelTotalXP - currentLevelTotalXP)) * 100;
  
  const rank = calculateRank(leaderboardStats, level);

  const formatTime = (seconds: number) => {
    if (seconds === 0 || seconds === 9999) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const RankIcon = rank.icon;
  
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-cyan-100 via-pink-100 to-purple-100 flex items-center justify-center p-6">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="w-full max-w-7xl flex flex-col h-full">
          {/* Top Section: Avatar + Username + Level + Progress + Customization */}
          <div className="flex items-start gap-8 mb-2 pt-2">
            {/* Avatar Column - Larger and centered */}
            <div className="flex flex-col items-center pt-8">
              <Avatar className="h-56 w-56 ring-4 ring-white shadow-2xl">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-7xl bg-blue-500 text-white">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-gray-500 mt-3">Joined {accountCreated}</p>
            </div>

            {/* Right Side: Username, Level Bar, and Customization Slots */}
            <div className="flex-1 pt-2">
              <h1 className="text-5xl font-bold text-gray-800 mb-2 leading-none">
                {username}
              </h1>
              <p className="text-xl text-gray-500 mb-3">Level {level}</p>
              
              {/* XP Progress Bar */}
              <div className="h-5 bg-white/30 backdrop-blur-sm rounded-full overflow-hidden shadow-inner max-w-md mb-6">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.max(2, Math.min(levelProgress, 100))}%` }}
                />
              </div>

              {/* Customization Slots */}
              <div className="flex gap-3">
                {/* Flag Slot */}
                <button
                  onClick={() => {
                    if (profileData.flag) {
                      updateProfileField('flag', null);
                    } else {
                      setEditingSlot('flag');
                    }
                  }}
                  className="w-24 h-24 bg-white/40 backdrop-blur-sm rounded-3xl shadow-md flex items-center justify-center text-4xl hover:shadow-lg transition-all hover:scale-105"
                >
                  {profileData.flag || <Plus className="w-7 h-7 text-gray-500" />}
                </button>

                {/* Continent Slot */}
                <button
                  onClick={() => {
                    if (profileData.continent) {
                      updateProfileField('continent', null);
                    } else {
                      setEditingSlot('continent');
                    }
                  }}
                  className="w-24 h-24 bg-white/40 backdrop-blur-sm rounded-3xl shadow-md flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105"
                >
                  {profileData.continent ? (
                    <>
                      <span className="text-3xl mb-1">
                        {CONTINENTS.find(c => c.code === profileData.continent)?.emoji}
                      </span>
                      <span className="text-[9px] text-gray-600 font-medium">
                        {profileData.continent}
                      </span>
                    </>
                  ) : (
                    <Plus className="w-7 h-7 text-gray-500" />
                  )}
                </button>

                {/* Clan Slot */}
                <button
                  onClick={() => {
                    if (profileData.clan) {
                      updateProfileField('clan', null);
                    } else {
                      setEditingSlot('clan');
                    }
                  }}
                  className="w-24 h-24 bg-white/40 backdrop-blur-sm rounded-3xl shadow-md flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105"
                >
                  {profileData.clan ? (
                    <>
                      <span className="text-3xl mb-1">
                        {CLANS.find(c => c.name === profileData.clan)?.emoji}
                      </span>
                      <span className="text-[9px] text-gray-600 font-medium">
                        {profileData.clan}
                      </span>
                    </>
                  ) : (
                    <Plus className="w-7 h-7 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>


          {/* Player Stats Header */}
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-[0.2em] mb-3 mt-auto">
            PLAYER STATS
          </h2>

          {/* Stats Grid - 3 narrow cards + 1 wider rank card */}
          <div className="grid grid-cols-10 gap-3 pb-4">
            {/* Best Streak */}
            <div className="col-span-2 bg-white/30 backdrop-blur-sm rounded-3xl shadow-md p-4 flex flex-col items-center justify-center min-h-[110px]">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-3">
                BESTE STREAK
              </p>
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <span className="text-3xl font-bold text-gray-800">
                  {leaderboardStats.bestStreak}
                </span>
              </div>
            </div>

            {/* Time Mode */}
            <div className="col-span-2 bg-white/30 backdrop-blur-sm rounded-3xl shadow-md p-4 flex flex-col items-center justify-center min-h-[110px]">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-3">
                ZEITMODUS
              </p>
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-500" />
                <span className="text-3xl font-bold text-gray-800">
                  {formatTime(leaderboardStats.bestTimeMode)}
                </span>
              </div>
            </div>

            {/* Duel Wins */}
            <div className="col-span-2 bg-white/30 backdrop-blur-sm rounded-3xl shadow-md p-4 flex flex-col items-center justify-center min-h-[110px]">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-3">
                DUELLE WINS
              </p>
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="text-3xl font-bold text-gray-800">
                  {leaderboardStats.duelWins}
                </span>
              </div>
            </div>

            {/* Rank Badge - Wider and taller with info icon */}
            <div className="col-span-4 bg-white/30 backdrop-blur-sm rounded-3xl shadow-md p-5 flex items-center gap-4 min-h-[110px] relative">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${rank.gradient} shadow-xl flex-shrink-0`}>
                <RankIcon className="w-14 h-14 text-white" />
              </div>
              <div className="flex flex-col flex-1">
                <p className="text-3xl font-bold text-blue-500 leading-tight">
                  {rank.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Best Position #{leaderboardStats.bestPosition}
                </p>
              </div>
              <button
                onClick={() => setShowRankInfo(true)}
                className="absolute top-3 right-3 p-1.5 bg-white/60 hover:bg-white/80 rounded-full transition-colors"
              >
                <Info className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rank Info Dialog */}
      {showRankInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl">Rank Übersicht</h3>
              <button
                onClick={() => setShowRankInfo(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {RANK_TIERS.map((tier, index) => {
                const TierIcon = tier.icon;
                return (
                  <div 
                    key={tier.name}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${tier.gradient} shadow-lg`}>
                      <TierIcon className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-xl text-gray-800">{tier.name}</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                        <p>Min Streak: {tier.minStreak}</p>
                        <p>Min Duel Wins: {tier.minDuelWins}</p>
                        <p>Max Time: {Math.floor(tier.minTimeSeconds / 60)}:{(tier.minTimeSeconds % 60).toString().padStart(2, '0')}</p>
                        <p>Min Level: {tier.minLevel}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-700">
                <strong>Hinweis:</strong> Dein Rang wird basierend auf dem Durchschnitt deiner besten Streak, deiner schnellsten Zeit und deinen Duel-Siegen berechnet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selection Dialogs */}
      {editingSlot === 'flag' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-3xl max-h-[80vh] overflow-y-auto w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">Wähle dein Land</h3>
              <button
                onClick={() => setEditingSlot(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Input
              placeholder="Land suchen..."
              className="mb-4 bg-white"
              onChange={(e) => {
                const search = e.target.value.toLowerCase();
                const filtered = ALL_COUNTRIES.filter(
                  c => c.name.toLowerCase().includes(search) || c.code.toLowerCase().includes(search)
                );
                // Update filtered list
              }}
            />
            <div className="grid grid-cols-3 gap-2">
              {ALL_COUNTRIES.map(country => (
                <button
                  key={country.code}
                  onClick={() => updateProfileField('flag', country.flag)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <span className="text-2xl">{country.flag}</span>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium text-xs truncate">{country.name}</span>
                    <span className="text-[10px] text-gray-500">{country.code}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {editingSlot === 'continent' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">Wähle deinen Kontinent</h3>
              <button
                onClick={() => setEditingSlot(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {CONTINENTS.map(continent => (
                <button
                  key={continent.code}
                  onClick={() => updateProfileField('continent', continent.code)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">{continent.emoji}</span>
                  <span className="font-medium">{continent.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {editingSlot === 'clan' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">Wähle deinen Clan</h3>
              <button
                onClick={() => setEditingSlot(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CLANS.map(clan => (
                <button
                  key={clan.name}
                  onClick={() => updateProfileField('clan', clan.name)}
                  className="flex items-center gap-3 p-4 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-3xl">{clan.emoji}</span>
                  <span className="font-medium text-lg">{clan.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
