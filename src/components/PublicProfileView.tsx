import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Flame, Clock, Trophy, X, Info, UserPlus, UserMinus, Check, Plus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getXPProgress } from '@/lib/xpSystem';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/data/translations';
import { calculateRank, calculateRankScore, RANK_TIERS } from '@/lib/profileRank';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};
interface PublicProfileViewProps {
  userId: string | null;
  onClose: () => void;
}
interface LeaderboardStats {
  bestStreak: number;
  bestTimeMode: number;
  duelWins: number;
  bestPosition: number;
}
interface ProfileData {
  flag?: string;
  continent?: string;
  clan?: string;
}
interface Clan {
  name: string;
  emoji: string;
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
export const PublicProfileView = ({
  userId,
  onClose
}: PublicProfileViewProps) => {
  const {
    language
  } = useLanguage();
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
  const [loading, setLoading] = useState(true);
  const [showRankInfo, setShowRankInfo] = useState(false);
  const [showClanView, setShowClanView] = useState(false);
  const [allClans, setAllClans] = useState<Clan[]>([...DEFAULT_CLANS]);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'friends'>('none');
  const [friendRequestId, setFriendRequestId] = useState<string | null>(null);
  const {
    user: currentUser
  } = useAuth();
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (userId) {
      loadProfileData();
      loadClans();
      loadFriendshipStatus();
    }
  }, [userId, currentUser]);
  const loadClans = async () => {
    try {
      const {
        data: customClans
      } = await supabase.from('clans').select('name, emoji').order('created_at', {
        ascending: false
      });
      if (customClans) {
        setAllClans([...DEFAULT_CLANS, ...customClans]);
      }
    } catch (error) {
      console.error('Error loading clans:', error);
    }
  };
  const loadFriendshipStatus = async () => {
    if (!currentUser || !userId || currentUser.id === userId) return;
    try {
      const {
        data: request
      } = await supabase.from('friend_requests').select('*').or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`).maybeSingle();
      if (request) {
        setFriendRequestId(request.id);
        if (request.status === 'accepted') {
          setFriendshipStatus('friends');
        } else if (request.sender_id === currentUser.id) {
          setFriendshipStatus('pending_sent');
        } else {
          setFriendshipStatus('pending_received');
        }
      } else {
        setFriendshipStatus('none');
      }
    } catch (error) {
      console.error('Error loading friendship status:', error);
    }
  };
  const sendFriendRequest = async () => {
    if (!currentUser || !userId) return;
    try {
      const {
        error
      } = await supabase.from('friend_requests').insert({
        sender_id: currentUser.id,
        receiver_id: userId,
        status: 'pending'
      });
      if (error) throw error;
      setFriendshipStatus('pending_sent');
      toast({
        title: 'Freundschaftsanfrage gesendet',
        description: 'Die Anfrage wurde erfolgreich gesendet.'
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: 'Fehler',
        description: 'Die Anfrage konnte nicht gesendet werden.',
        variant: 'destructive'
      });
    }
  };
  const acceptFriendRequest = async () => {
    if (!friendRequestId) return;
    try {
      const {
        error
      } = await supabase.from('friend_requests').update({
        status: 'accepted'
      }).eq('id', friendRequestId);
      if (error) throw error;
      setFriendshipStatus('friends');
      toast({
        title: 'Freundschaft bestätigt',
        description: 'Ihr seid jetzt Freunde!'
      });
      loadFriendshipStatus();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: 'Fehler',
        description: 'Die Anfrage konnte nicht angenommen werden.',
        variant: 'destructive'
      });
    }
  };
  const removeFriend = async () => {
    if (!currentUser || !userId) return;
    try {
      const {
        error
      } = await supabase.from('friendships').delete().or(`and(user_id_1.eq.${Math.min(currentUser.id, userId)},user_id_2.eq.${Math.max(currentUser.id, userId)})`);
      if (error) throw error;
      setFriendshipStatus('none');
      toast({
        title: 'Freundschaft beendet',
        description: 'Die Freundschaft wurde entfernt.'
      });
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: 'Fehler',
        description: 'Die Freundschaft konnte nicht entfernt werden.',
        variant: 'destructive'
      });
    }
  };
  const cancelFriendRequest = async () => {
    if (!friendRequestId) return;
    try {
      const {
        error
      } = await supabase.from('friend_requests').delete().eq('id', friendRequestId);
      if (error) throw error;
      setFriendshipStatus('none');
      setFriendRequestId(null);
      toast({
        title: 'Anfrage zurückgezogen',
        description: 'Die Freundschaftsanfrage wurde abgebrochen.'
      });
    } catch (error) {
      console.error('Error canceling friend request:', error);
    }
  };
  const loadProfileData = async () => {
    if (!userId) return;
    try {
      const {
        data: profile
      } = await supabase.from('profiles').select('username, avatar_url, created_at, selected_flag, selected_continent, selected_clan').eq('user_id', userId).single();
      if (profile) {
        setUsername(profile.username || 'User');
        setAvatarUrl(profile.avatar_url || '');
        setAccountCreated(new Date(profile.created_at).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }));
        setProfileData({
          flag: profile.selected_flag || undefined,
          continent: profile.selected_continent || undefined,
          clan: profile.selected_clan || undefined
        });
      }
      const {
        data: userStats
      } = await supabase.from('user_stats').select('xp, level, multiplayer_wins').eq('user_id', userId).single();
      if (userStats) {
        setLevel(userStats.level || 0);
        setXp(userStats.xp || 0);
      }
      const {
        data: streakData
      } = await supabase.from('leaderboards').select('score').eq('user_id', userId).eq('game_mode', 'streak').order('score', {
        ascending: false
      }).limit(1).maybeSingle();
      const {
        data: timedData
      } = await supabase.from('leaderboards').select('score').eq('user_id', userId).eq('game_mode', 'timed').order('score', {
        ascending: true
      }).limit(1).maybeSingle();
      const bestStreak = streakData?.score || 0;
      const bestTimeMode = timedData?.score || 0;
      const duelWins = userStats?.multiplayer_wins || 0;
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
          if (player.user_id === userId) continue;
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
  const xpProgress = getXPProgress(xp);
  const levelProgress = xpProgress.progressPercentage;
  const rank = calculateRank(leaderboardStats, level);
  const formatTime = (seconds: number) => {
    if (seconds === 0 || seconds === 9999) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  if (!userId) return null;
  return <>
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 flex items-center justify-center p-4">
        <button onClick={onClose} className="fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="w-full max-w-7xl flex flex-col h-full max-h-screen">
          <div className="flex-1 flex items-center mb-3 md:mb-4 md:pl-2">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-10 w-full">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-40 w-40 md:h-64 md:w-64 ring-4 md:ring-8 ring-white shadow-2xl">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-6xl md:text-9xl bg-blue-500 text-white">
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-gray-300 mt-3 font-medium hidden md:block" style={{
                fontFamily: '"VAG Rounded", sans-serif'
              }}>
                  Joined {accountCreated}
                </p>
              </div>

              <div className="flex-1 flex flex-col items-center md:items-start w-full">
                <h1 className="text-4xl md:text-7xl font-bold text-white mb-1 md:mb-3 leading-none text-center md:text-left" style={{
                fontFamily: '"VAG Rounded", sans-serif'
              }}>
                  {username}
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-2 font-medium text-center md:text-left" style={{
                fontFamily: '"VAG Rounded", sans-serif'
              }}>
                  {t.level} {level}
                </p>

                <div className="h-5 md:h-7 bg-white/30 backdrop-blur-sm rounded-full overflow-hidden shadow-inner w-full max-w-md md:max-w-2xl mb-3 md:mb-6">
                  <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500 rounded-full" style={{
                  width: `${Math.max(2, Math.min(levelProgress, 100))}%`
                }} />
                </div>

                <div className="flex gap-2 md:gap-3 justify-center md:justify-start mb-3">
                  {profileData.flag ? <div className="w-20 h-20 md:w-28 md:h-28 bg-white/40 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-lg flex flex-col items-center justify-center">
                      <span className="text-3xl md:text-5xl mb-0.5 md:mb-1" style={{
                    fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
                  }}>
                        {getFlagEmoji(profileData.flag)}
                      </span>
                      <span className="text-[10px] md:text-xs text-gray-600 font-semibold" style={{
                    fontFamily: '"VAG Rounded", sans-serif'
                  }}>
                        {profileData.flag}
                      </span>
                    </div> : <div className="w-20 h-20 md:w-28 md:h-28 bg-white/40 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-lg flex flex-col items-center justify-center">
                      <Plus className="w-6 md:w-8 h-6 md:h-8 text-gray-300" />
                    </div>}

                  {profileData.continent ? <div className="w-20 h-20 md:w-28 md:h-28 bg-white/40 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-lg flex flex-col items-center justify-center">
                      <span className="text-2xl md:text-4xl mb-0.5 md:mb-1">
                        {CONTINENTS.find(c => c.code === profileData.continent)?.emoji}
                      </span>
                      <span className="text-[10px] md:text-xs text-gray-600 font-semibold" style={{
                    fontFamily: '"VAG Rounded", sans-serif'
                  }}>
                        {profileData.continent}
                      </span>
                    </div> : <div className="w-20 h-20 md:w-28 md:h-28 bg-white/40 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-lg flex flex-col items-center justify-center">
                      <Plus className="w-6 md:w-8 h-6 md:h-8 text-gray-300" />
                    </div>}

                  {profileData.clan ? <div className="w-20 h-20 md:w-28 md:h-28 bg-white/40 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-lg flex flex-col items-center justify-center">
                      <span className="text-2xl md:text-4xl mb-0.5 md:mb-1">
                        {allClans.find(c => c.name === profileData.clan)?.emoji}
                      </span>
                      <span className="text-[10px] md:text-xs text-gray-600 font-semibold" style={{
                    fontFamily: '"VAG Rounded", sans-serif'
                  }}>
                        {profileData.clan}
                      </span>
                    </div> : <div className="w-20 h-20 md:w-28 md:h-28 bg-white/40 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-lg flex flex-col items-center justify-center">
                      <Plus className="w-6 md:w-8 h-6 md:h-8 text-gray-300" />
                    </div>}
                </div>

                {currentUser && currentUser.id !== userId && <div className="flex gap-2 justify-center md:justify-start flex-wrap">
                    {friendshipStatus === 'none' && <Button onClick={sendFriendRequest} className="bg-blue-500 hover:bg-blue-600 text-white">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Freund hinzufügen
                      </Button>}
                    {friendshipStatus === 'pending_sent' && <Button onClick={cancelFriendRequest} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                        <Clock className="w-4 h-4 mr-2" />
                        Anfrage gesendet
                      </Button>}
                    {friendshipStatus === 'pending_received' && <Button onClick={acceptFriendRequest} className="bg-green-500 hover:bg-green-600 text-white">
                        <Check className="w-4 h-4 mr-2" />
                        Anfrage annehmen
                      </Button>}
                    {friendshipStatus === 'friends' && <Button onClick={removeFriend} variant="outline" className="bg-red-500/20 border-red-500/40 text-white hover:bg-red-500/30">
                        <UserMinus className="w-4 h-4 mr-2" />
                        Freund entfernen
                      </Button>}
                    <Button onClick={() => setShowClanView(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
                      <Users className="w-4 h-4 mr-2" />
                      Clan anschauen
                    </Button>
                  </div>}
              </div>
            </div>
          </div>

          <h2 className="text-[10px] md:text-sm font-bold text-gray-300 uppercase tracking-[0.2em] md:tracking-[0.25em] mb-2 md:mb-3 text-center md:text-left" style={{
          fontFamily: '"VAG Rounded", sans-serif'
        }}>
            PLAYER STATS
          </h2>

          <div className="grid grid-cols-3 md:grid-cols-10 gap-2 md:gap-4 mb-6 md:mb-4">
            <div className="col-span-1 md:col-span-2 bg-white/30 backdrop-blur-sm rounded-xl md:rounded-3xl shadow-lg p-2 md:p-5 flex flex-col items-center justify-center min-h-[70px] md:min-h-[140px]">
              <p className="text-[7px] md:text-xs text-gray-300 uppercase tracking-wide font-bold mb-0.5 md:mb-3 text-center leading-tight" style={{
              fontFamily: '"VAG Rounded", sans-serif'
            }}>
                {t.highestStreak.toUpperCase()}
              </p>
              <div className="flex items-center gap-0.5 md:gap-2">
                <Flame className="w-4 h-4 md:w-8 md:h-8 text-orange-500" />
                <span className="text-base md:text-4xl font-bold text-white" style={{
                fontFamily: '"VAG Rounded", sans-serif'
              }}>
                  {leaderboardStats.bestStreak}
                </span>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 bg-white/30 backdrop-blur-sm rounded-xl md:rounded-3xl shadow-lg p-2 md:p-5 flex flex-col items-center justify-center min-h-[70px] md:min-h-[140px]">
              <p className="text-[7px] md:text-xs text-gray-300 uppercase tracking-wide font-bold mb-0.5 md:mb-3 text-center leading-tight" style={{
              fontFamily: '"VAG Rounded", sans-serif'
            }}>
                {t.bestTime.toUpperCase()}
              </p>
              <div className="flex items-center gap-0.5 md:gap-2">
                <Clock className="w-4 h-4 md:w-8 md:h-8 text-blue-500" />
                <span className="text-base md:text-4xl font-bold text-white" style={{
                fontFamily: '"VAG Rounded", sans-serif'
              }}>
                  {formatTime(leaderboardStats.bestTimeMode)}
                </span>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 bg-white/30 backdrop-blur-sm rounded-xl md:rounded-3xl shadow-lg p-2 md:p-5 flex flex-col items-center justify-center min-h-[70px] md:min-h-[140px]">
              <p className="text-[7px] md:text-xs text-gray-300 uppercase tracking-wide font-bold mb-0.5 md:mb-3 text-center leading-tight" style={{
              fontFamily: '"VAG Rounded", sans-serif'
            }}>
                {t.duelWins.toUpperCase()}
              </p>
              <div className="flex items-center gap-0.5 md:gap-2">
                <Trophy className="w-4 h-4 md:w-8 md:h-8 text-yellow-500" />
                <span className="text-base md:text-4xl font-bold text-white" style={{
                fontFamily: '"VAG Rounded", sans-serif'
              }}>
                  {leaderboardStats.duelWins}
                </span>
              </div>
            </div>

            <div className="col-span-3 md:col-span-4 bg-white/30 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-lg p-3 md:p-6 flex flex-col md:flex-row items-center md:gap-5 min-h-[120px] md:min-h-[140px] relative overflow-hidden">
              <div className="flex-shrink-0 w-16 h-16 md:w-24 md:h-24 flex items-center justify-center relative overflow-visible mb-1 md:mb-0">
                <img src={rank.badge} alt={rank.name} className="absolute w-32 h-32 md:w-56 md:h-56 object-contain scale-125" />
              </div>

              <div className="flex flex-col flex-1 md:ml-8 items-center md:items-start">
                <p className="text-2xl md:text-4xl font-bold text-white leading-tight text-center md:text-left" style={{
                fontFamily: '"VAG Rounded", sans-serif'
              }}>
                  {rank.name}
                </p>
                <p className="text-xs md:text-sm text-gray-300 mt-0.5 md:mt-1 font-medium text-center md:text-left" style={{
                fontFamily: '"VAG Rounded", sans-serif'
              }}>
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

      {showRankInfo && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl">Rank Übersicht</h3>
              <button onClick={() => setShowRankInfo(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mb-6">
              {[...RANK_TIERS].reverse().map(tier => {
            const getRankGlowColor = (name: string) => {
              switch (name) {
                case 'Bronze':
                  return 'group-hover:drop-shadow-[0_0_20px_rgba(194,120,3,0.8)]';
                case 'Silver':
                  return 'group-hover:drop-shadow-[0_0_20px_rgba(156,163,175,0.8)]';
                case 'Gold':
                  return 'group-hover:drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]';
                case 'Platinum':
                  return 'group-hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]';
                case 'Diamond':
                  return 'group-hover:drop-shadow-[0_0_20px_rgba(56,189,248,0.8)]';
                case 'Masters':
                  return 'group-hover:drop-shadow-[0_0_20px_rgba(37,99,235,0.8)]';
                case 'Legends':
                  return 'group-hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]';
                default:
                  return '';
              }
            };
            return <div key={tier.name} className="flex flex-col items-center gap-2 group w-[calc(25%-0.75rem)] md:w-auto">
                    <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-all duration-300">
                      <img src={tier.badge} alt={tier.name} className={`w-full h-full object-contain transition-all duration-300 group-hover:scale-125 ${getRankGlowColor(tier.name)}`} />
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

      {showClanView && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl">Clan System</h3>
              <button onClick={() => setShowClanView(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-purple-500" />
              <h4 className="text-xl font-bold text-gray-800 mb-2">Clans kommen bald!</h4>
              <p className="text-gray-600">
                Das Clan-System befindet sich derzeit in der Entwicklung. Bald kannst du hier die Clan-Details sehen.
              </p>
            </div>
          </div>
        </div>}
    </>;
};