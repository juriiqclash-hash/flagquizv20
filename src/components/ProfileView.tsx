import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Plus, Flame, Clock, Trophy, X, Info, Shield, Paintbrush } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { ALL_COUNTRIES } from '@/data/countries-full';
import { Input } from './ui/input';
import { getXPProgress } from '@/lib/xpSystem';
import { ClanCreator } from './ClanCreator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/data/translations';
import { calculateRank, calculateRankScore, RANK_TIERS } from '@/lib/profileRank';
import { getFlagEmoji } from '@/lib/flagUtils';
import { useSubscription } from '@/hooks/useSubscription';
import { checkCountryChangeLimit, incrementCountryChange } from '@/lib/planLimits';
import { toast } from 'sonner';
import { ProfileCustomization } from './ProfileCustomization';

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
// Rank calculation moved to src/lib/profileRank.ts
export const ProfileView = ({
  open,
  onOpenChange
}: ProfileViewProps) => {
  const {
    user
  } = useAuth();
  const { language } = useLanguage();
  const t = useTranslation(language);
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
  const [userClan, setUserClan] = useState<{ name: string; emoji: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRankInfo, setShowRankInfo] = useState(false);
  const [showClanCreator, setShowClanCreator] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [allClans, setAllClans] = useState<Clan[]>([...DEFAULT_CLANS]);
  const [usernameColor, setUsernameColor] = useState<string>('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState<string>('');
  const [borderStyle, setBorderStyle] = useState<string>('solid');
  const { subscription } = useSubscription();

  useEffect(() => {
    if (open && user) {
      setLoading(true);
      Promise.all([loadProfileData(), loadClans()])
        .finally(() => setLoading(false));
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
      } = await supabase.from('profiles').select('username, avatar_url, created_at, selected_flag, selected_continent, selected_clan, username_color, background_color, profile_border_style').eq('user_id', user.id).single();
      if (profile) {
        setUsername(profile.username || user.email?.split('@')[0] || 'User');
        setAvatarUrl(profile.avatar_url || '');
        setAccountCreated(new Date(profile.created_at).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }));

        // Load customization data
        setUsernameColor(profile.username_color || '#FFFFFF');
        setBackgroundColor(profile.background_color || '');
        setBorderStyle(profile.profile_border_style || 'solid');

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

      // Calculate best position efficiently - single query for all leaderboard data
      const {
        data: allPlayers
      } = await supabase.from('user_stats').select('user_id, xp, level, multiplayer_wins');
      
      const { data: allLeaderboardData } = await supabase
        .from('leaderboards')
        .select('user_id, game_mode, score')
        .in('game_mode', ['streak', 'timed']);

      // Build maps for quick lookup
      const streakMap = new Map<string, number>();
      const timedMap = new Map<string, number>();
      allLeaderboardData?.forEach(entry => {
        if (entry.game_mode === 'streak') {
          const current = streakMap.get(entry.user_id) || 0;
          streakMap.set(entry.user_id, Math.max(current, entry.score));
        } else if (entry.game_mode === 'timed') {
          const current = timedMap.get(entry.user_id) || 9999;
          timedMap.set(entry.user_id, Math.min(current, entry.score));
        }
      });

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

          const playerStats = {
            bestStreak: streakMap.get(player.user_id) || 0,
            bestTimeMode: timedMap.get(player.user_id) || 0,
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

      // Load user's clan membership
      const { data: clanMembership } = await supabase
        .from('clan_members' as any)
        .select('clan_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (clanMembership && (clanMembership as any).clan_id) {
        const { data: clanData } = await supabase
          .from('clans')
          .select('name, emoji')
          .eq('id', (clanMembership as any).clan_id)
          .single();

        if (clanData) {
          setUserClan(clanData as any);
          setProfileData(prev => ({ ...prev, clan: (clanData as any).name }));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };
  const updateProfileField = async (field: keyof ProfileData, value: string | null) => {
    if (!user) return;
    try {
      // Check limits for country changes (flag field)
      if (field === 'flag' && value && subscription) {
        const plan = subscription.plan || 'free';
        const limitCheck = await checkCountryChangeLimit(user.id, plan);

        if (!limitCheck.allowed) {
          toast.error('Limit erreicht', {
            description: limitCheck.message,
          });
          return;
        }
      }

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

      // Increment counter for country changes
      if (field === 'flag' && value) {
        await incrementCountryChange(user.id);
      }

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

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Lade Profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Du musst angemeldet sein, um dein Profil zu sehen.</p>
          <Button onClick={() => onOpenChange(false)}>Zurück</Button>
        </div>
      </div>
    );
  }

  return <>
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${!backgroundColor ? 'bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900' : ''}`}
        style={{
          background: backgroundColor || undefined,
        }}
      >
        {/* Close Button */}
        <button onClick={() => onOpenChange(false)} className="fixed top-4 right-4 z-[110] p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="w-full max-w-7xl flex flex-col h-full max-h-screen pb-8">
          {/* Top Section: Avatar + Username + Level + Progress + Customization */}
          <div className="flex-1 flex items-end mb-3 md:mb-4 md:pl-2">
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
              <div className="flex items-center gap-2 mb-1 md:mb-3">
                <h1 
                  className="text-4xl md:text-7xl font-bold leading-none text-center md:text-left" 
                  style={{ 
                    fontFamily: '"VAG Rounded", sans-serif',
                    color: usernameColor,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  {username}
                </h1>
                {profileData.flag && (
                  <img
                    src={`https://flagcdn.com/w80/${profileData.flag.toLowerCase()}.png`}
                    alt={profileData.flag}
                    className="w-10 h-8 md:w-16 md:h-12 object-cover rounded shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <p className="text-xl md:text-2xl text-gray-300 mb-2 font-medium text-center md:text-left" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>{t.level} {level}</p>


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
                      <img
                        src={`https://flagcdn.com/w80/${profileData.flag.toLowerCase()}.png`}
                        alt={profileData.flag}
                        className="w-12 h-9 md:w-16 md:h-12 object-cover rounded mb-0.5 md:mb-1"
                      />
                      <span className="text-[10px] md:text-xs text-gray-300 font-semibold" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                        {profileData.flag}
                      </span>
                    </>
                  ) : (
                    <Plus className="w-6 md:w-8 h-6 md:h-8 text-gray-200" />
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
                      <span className="text-[10px] md:text-xs text-gray-300 font-semibold" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                        {profileData.continent}
                      </span>
                    </> : <Plus className="w-6 md:w-8 h-6 md:h-8 text-gray-200" />}
                </button>

                {/* Clan Slot */}
                <div className="w-20 h-20 md:w-28 md:h-28 bg-white/40 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-lg flex flex-col items-center justify-center transition-all">
                  {userClan ? (
                    <>
                      <span className="text-2xl md:text-4xl mb-0.5 md:mb-1">
                        {userClan.emoji}
                      </span>
                      <span className="text-[10px] md:text-xs text-gray-300 font-semibold" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                        {userClan.name}
                      </span>
                    </>
                  ) : (
                    <Plus className="w-6 md:w-8 h-6 md:h-8 text-gray-200" />
                  )}
                </div>

                {/* Customization Button (Premium/Ultimate only) */}
                {subscription && (subscription.plan === 'premium' || subscription.plan === 'ultimate') && (
                  <Button
                    onClick={() => setShowCustomization(true)}
                    variant="outline"
                    size="sm"
                    className="mt-3 bg-white/20 backdrop-blur-sm text-white border-white/40 hover:bg-white/30"
                  >
                    <Paintbrush className="w-4 h-4 mr-2" />
                    Profil anpassen
                  </Button>
                )}
              </div>
            </div>
          </div>
          </div>

          {/* Player Stats Header */}
          <h2 className="text-[10px] md:text-sm font-bold text-gray-300 uppercase tracking-[0.2em] md:tracking-[0.25em] mb-2 md:mb-3 text-center md:text-left" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
            PLAYER STATS
          </h2>

          {/* Stats Grid - Mobile: 3 in row, then rank full width. Desktop: 3 narrow + 1 wider */}
          <div className="grid grid-cols-3 md:grid-cols-10 gap-2 md:gap-4 mb-6 md:mb-4">
            {/* Best Streak */}
            <div className="col-span-1 md:col-span-2 bg-white/30 backdrop-blur-sm rounded-xl md:rounded-3xl shadow-lg p-2 md:p-5 flex flex-col items-center justify-center min-h-[70px] md:min-h-[140px]">
              <p className="text-[7px] md:text-xs text-gray-300 uppercase tracking-wide font-bold mb-0.5 md:mb-3 text-center leading-tight" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                {t.highestStreak.toUpperCase()}
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
                {t.bestTime.toUpperCase()}
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
                {t.duelWins.toUpperCase()}
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

         

      {/* Rank Info Dialog */}
      {showRankInfo && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[120]">
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
      {editingSlot === 'flag' && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[120]">
          <div className="bg-white rounded-2xl p-6 max-w-4xl max-h-[80vh] overflow-y-auto w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">{t.selectFlagProfile}</h3>
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
                  <img
                    src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`}
                    alt={country.code}
                    className="w-16 h-12 object-cover rounded mb-2"
                  />
                  <span className="text-xs text-gray-600 font-medium">{country.code}</span>
                </button>)}
            </div>
          </div>
        </div>}

      {editingSlot === 'continent' && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[120]">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">{t.selectContinentProfile}</h3>
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


      {showClanCreator && (
        <ClanCreator
          onClose={() => setShowClanCreator(false)}
          onClanCreated={(clan) => {
            loadClans(); // Reload clans list
            updateProfileField('clan', clan.name); // Auto-select the new clan
          }}
        />
      )}

      {showCustomization && (
        <ProfileCustomization
          userId={user.id}
          currentUsernameColor={usernameColor}
          currentBackgroundColor={backgroundColor}
          currentBorderStyle={borderStyle}
          onClose={() => setShowCustomization(false)}
          onUpdate={() => loadProfileData()}
        />
      )}
    </>;
};
