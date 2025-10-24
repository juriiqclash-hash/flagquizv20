import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Loader as Loader2, Languages, Users, Calendar, Search, Clock, BookOpen, Target, Globe, Zap, Building, Smile, Mountain, Languages as LanguagesIcon, Layers, Trophy, Shield, Menu, BookMarked, Crown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
const QUIZ_MODE_ICONS: {
  [key: string]: React.ReactNode;
} = {
  'timed': <Clock className="w-5 h-5" />,
  'learn': <BookOpen className="w-5 h-5" />,
  'streak': <Target className="w-5 h-5" />,
  'continent': <Globe className="w-5 h-5" />,
  'speedrush': <Zap className="w-5 h-5" />,
  'capitals': <Building className="w-5 h-5" />,
  'emoji': <Smile className="w-5 h-5" />,
  'highest-mountain': <Mountain className="w-5 h-5" />,
  'official-language': <LanguagesIcon className="w-5 h-5" />,
  'world-knowledge': <Globe className="w-5 h-5" />,
  'combi-quiz': <Layers className="w-5 h-5" />,
  'flag-archive': <BookMarked className="w-5 h-5" />,
  'multiplayer': <Users className="w-5 h-5" />
};
import ProfileButton from "@/components/ProfileButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/data/translations";
import FlagQuizLogo from "@/components/FlagQuizLogo";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { supabase } from "@/integrations/supabase/client";
import { PublicProfileView } from "@/components/PublicProfileView";
import { calculateLevel } from "@/lib/xpSystem";
import { calculateRank as calculateProfileRank } from "@/lib/profileRank";
interface MainMenuProps {
  onStart: () => void;
  onMultiplayerStart?: () => void;
  onDailyChallengeStart?: () => void;
  onStartQuiz?: (mode: 'learn' | 'timed' | 'streak' | 'continent' | 'speedrush' | 'capital-to-country' | 'country-to-capital' | 'emoji' | 'highest-mountain' | 'official-language' | 'world-knowledge' | 'combi-quiz' | 'flag-archive', continent?: string, timeLimit?: number) => void;
  onProfileOpen?: () => void;
}
interface QuizResult {
  id: string;
  name: string;
  description: string;
  icon: string;
}
interface SearchResult {
  user_id: string;
  username: string;
  avatar_url: string | null;
  level: number;
  xp: number;
}
interface ClanResult {
  id: string;
  name: string;
  emoji: string;
  member_count: number;
}
const QUIZ_MODES: QuizResult[] = [{
  id: 'timed',
  name: 'Zeitlimit Modus',
  description: 'Beantworte so viele Fragen wie möglich',
  icon: '⏱️'
}, {
  id: 'learn',
  name: 'Lernmodus',
  description: 'Üben ohne Zeitdruck',
  icon: '📖'
}, {
  id: 'streak',
  name: 'Streak Modus',
  description: 'Wie viele richtige Antworten schaffst du in Folge?',
  icon: '🎯'
}, {
  id: 'continent',
  name: 'Kontinent Modus',
  description: 'Wähle einen spezifischen Kontinent',
  icon: '🌍'
}, {
  id: 'speedrush',
  name: 'Speed Rush',
  description: 'Beantworte 10 Fragen so schnell wie möglich',
  icon: '⚡'
}, {
  id: 'capitals',
  name: 'Hauptstädte',
  description: 'Erkenne das Land anhand der Hauptstadt',
  icon: '🏛️'
}, {
  id: 'emoji',
  name: 'Emoji Modus',
  description: 'Erkenne Länder anhand ihrer Flaggen-Emojis',
  icon: '😃'
}, {
  id: 'highest-mountain',
  name: 'Höchste Berge',
  description: 'Erkenne den höchsten Berg jedes Landes',
  icon: '⛰️'
}, {
  id: 'official-language',
  name: 'Amtssprachen',
  description: 'Erkenne die Amtssprache jedes Landes',
  icon: '🗣️'
}, {
  id: 'world-knowledge',
  name: 'Weltwissen Quiz',
  description: 'Teste dein Wissen über Weltfakten',
  icon: '🌏'
}, {
  id: 'combi-quiz',
  name: 'Combi-Quiz',
  description: 'Wähle deine Kategorien und spiele endlos',
  icon: '🎭'
}, {
  id: 'flag-archive',
  name: 'Flaggen-Archiv',
  description: 'Durchsuche alle Flaggen von A-Z',
  icon: '📚'
}, {
  id: 'multiplayer',
  name: 'Multiplayer',
  description: 'Spiele gegen andere in Echtzeit',
  icon: '👥'
}];
export default function MainMenu({
  onStart,
  onMultiplayerStart,
  onDailyChallengeStart,
  onStartQuiz,
  onProfileOpen
}: MainMenuProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playerResults, setPlayerResults] = useState<SearchResult[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [clanResults, setClanResults] = useState<ClanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const {
    user
  } = useAuth();
  const {
    stats
  } = useUserStats();
  const {
    language,
    setLanguage
  } = useLanguage();
  const t = useTranslation(language);
  const isMobile = useIsMobile();
  const userXP = stats?.xp ?? 0;
  const userLevel = calculateLevel(userXP);

  // Calculate rank using the same method as ProfileView
  const profileRank = stats ? calculateProfileRank({
    bestStreak: stats.best_streak ?? 0,
    bestTimeMode: stats.time_mode_best_score ?? 0,
    duelWins: stats.multiplayer_wins ?? 0,
    bestPosition: 0
  }, userLevel) : null;

  // Load pending friend requests count
  useEffect(() => {
    if (!user) return;
    const loadPendingRequests = async () => {
      const {
        data,
        error
      } = await supabase.from('friend_requests').select('id').eq('receiver_id', user.id).eq('status', 'pending');
      if (!error && data) {
        setPendingRequestsCount(data.length);
      }
    };
    loadPendingRequests();

    // Subscribe to changes
    const channel = supabase.channel('friend_requests_count').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'friend_requests',
      filter: `receiver_id=eq.${user.id}`
    }, () => {
      loadPendingRequests();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchExpanded(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim()) {
        setPlayerResults([]);
        setQuizResults([]);
        setClanResults([]);
        return;
      }
      setLoading(true);
      try {
        const query = searchQuery.toLowerCase();
        const filteredQuizzes = QUIZ_MODES.filter(quiz => quiz.name.toLowerCase().includes(query) || quiz.description.toLowerCase().includes(query));
        setQuizResults(filteredQuizzes);
        const {
          data: profiles
        } = await supabase.from('profiles').select('user_id, username, avatar_url').ilike('username', `%${searchQuery}%`).limit(20);
        if (profiles) {
          const userIds = profiles.map(p => p.user_id);
          const {
            data: statsData
          } = await supabase.from('user_stats').select('user_id, level, xp').in('user_id', userIds);
          const combined = profiles.map(profile => {
            const userStat = statsData?.find(s => s.user_id === profile.user_id);
            return {
              user_id: profile.user_id,
              username: profile.username,
              avatar_url: profile.avatar_url,
              level: userStat?.level || 0,
              xp: userStat?.xp || 0
            };
          });
          setPlayerResults(combined);
        }
        const {
          data: clans
        } = await supabase.from('clans').select('id, name, emoji').ilike('name', `%${searchQuery}%`).limit(10);
        if (clans) {
          const clansWithCounts = clans.map(clan => ({
            id: clan.id,
            name: clan.name,
            emoji: clan.emoji,
            member_count: 0
          }));
          setClanResults(clansWithCounts);
        }
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(() => {
      search();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);
  const handleStart = () => {
    setIsLoading(true);
    const random = Math.random() * Math.random();
    const randomDelay = Math.floor(random * 1200) + 300;
    setTimeout(() => {
      onStart();
    }, randomDelay);
  };
  const handleMultiplayer = () => {
    if (onMultiplayerStart) {
      onMultiplayerStart();
    }
  };
  const handleDailyChallenge = () => {
    if (onDailyChallengeStart) {
      onDailyChallengeStart();
    }
  };
  const handleDiscord = () => {
    window.open('https://discord.gg/cC4fHpubn', '_blank');
  };
  const handleQuizClick = (quizId: string) => {
    if (quizId === 'multiplayer') {
      handleMultiplayer();
    } else if (onStartQuiz) {
      onStartQuiz(quizId as any);
    } else {
      handleStart();
    }
  };
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{
      backgroundImage: `
            linear-gradient(to bottom, rgba(10, 20, 72, 0.95), rgba(27, 46, 122, 0.95)),
            url("/F5BD60DF-0BF3-4DCD-B9C2-C433C2CB0628.png")
    `,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>

        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-2xl text-white font-semibold">{t.loading}</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{
    backgroundImage: `url("/F5BD60DF-0BF3-4DCD-B9C2-C433C2CB0628.png")`,
    backgroundSize: "cover",
    backgroundPosition: "center"
  }}>
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/10 backdrop-blur-sm border-b border-white/30">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          {/* Left Side - Desktop: Logo, Language, Leaderboard, Friends, Clan | Mobile: Hamburger Menu */}
          <div className="flex items-center gap-3">
            {isMobile ? <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-lg">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] bg-slate-900/95 backdrop-blur-md border-white/20">
                  <SheetHeader>
                    <SheetTitle className="text-white">Menü</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-3 mt-6">
                    <Select value={language} onValueChange={(value: any) => {
                  setLanguage(value);
                  setMobileMenuOpen(false);
                }}>
                      <SelectTrigger className="w-full bg-white/10 text-white border-white/20">
                        <Languages className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/20 rounded-lg h-12 relative" onClick={() => {
                  navigate('/friends');
                  setMobileMenuOpen(false);
                }}>
                      <Users className="h-5 w-5 mr-3" />
                      Freunde
                      {pendingRequestsCount > 0 && <span className="absolute top-2 left-8 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                          {pendingRequestsCount}
                        </span>}
                    </Button>

                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/20 rounded-lg h-12" onClick={() => {
                  navigate('/clans');
                  setMobileMenuOpen(false);
                }}>
                      <Shield className="h-5 w-5 mr-3" />
                      Clans
                    </Button>

                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/20 rounded-lg h-12" onClick={() => {
                  navigate('/leaderboards');
                  setMobileMenuOpen(false);
                }}>
                      <Trophy className="h-5 w-5 mr-3" />
                      Bestenliste
                    </Button>

                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/20 rounded-lg h-12" onClick={() => {
                  handleStart();
                  setMobileMenuOpen(false);
                }}>
                      <Play className="h-5 w-5 mr-3" />
                      Quiz
                    </Button>
                  </div>
                </SheetContent>
              </Sheet> : <>
                <FlagQuizLogo size="sm" variant="dark" />

                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[160px] bg-transparent text-white border-white/20 hover:bg-white/20">
                    <Languages className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-lg" onClick={() => navigate('/leaderboards')}>
                  <Trophy className="h-5 w-5" />
                </Button>

                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-lg relative" onClick={() => navigate('/friends')}>
                  <Users className="h-5 w-5" />
                  {pendingRequestsCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                      {pendingRequestsCount}
                    </span>}
                </Button>

                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-lg" onClick={() => navigate('/clans')}>
                  <Shield className="h-5 w-5" />
                </Button>
              </>}
          </div>

          {/* Right Side - Search and Profile */}
          <div className="flex gap-2 items-center">
            <div ref={searchRef} className="relative">
              <div className={`flex items-center gap-2 bg-transparent rounded-lg transition-all duration-300 ${searchExpanded ? 'w-[200px] md:w-[350px]' : 'w-10 h-10'}`}>
                <Button onClick={() => setSearchExpanded(!searchExpanded)} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-lg flex-shrink-0 w-10 h-10">
                  <Search className="h-6 w-6" strokeWidth={3} />
                </Button>
                {searchExpanded && <Input placeholder={t.searchPlayersPlaceholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none text-white placeholder:text-white/60 h-10 focus-visible:ring-0 pr-4" autoFocus />}
              </div>

              {searchExpanded && (searchQuery || loading) && <>
                  <div className="fixed inset-0 z-40" onClick={() => {
                setSearchExpanded(false);
                setSearchQuery('');
              }} />
                  <div className="absolute top-12 right-0 w-[200px] md:w-[350px] bg-black/70 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-h-[500px] overflow-y-auto z-50">
                  {loading && <div className="text-center py-8 text-gray-400">
                      {t.loading || 'Lädt...'}
                    </div>}

                  {!loading && searchQuery && playerResults.length === 0 && quizResults.length === 0 && clanResults.length === 0 && <div className="text-center py-8 text-gray-400">
                      Keine Ergebnisse gefunden
                    </div>}

                  {!loading && quizResults.length > 0 && <div className="p-2">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-2">Quiz</h3>
                      {quizResults.map(quiz => <button key={quiz.id} onClick={() => {
                    handleQuizClick(quiz.id);
                    setSearchExpanded(false);
                    setSearchQuery('');
                  }} className="w-full flex items-center gap-3 p-3 hover:bg-white/20 rounded-lg transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                        <div className={`${quiz.id === 'timed' ? 'text-blue-500' : quiz.id === 'learn' ? 'text-green-500' : quiz.id === 'streak' ? 'text-red-500' : quiz.id === 'continent' ? 'text-purple-500' : quiz.id === 'speedrush' ? 'text-orange-500' : quiz.id === 'capitals' ? 'text-indigo-500' : quiz.id === 'emoji' ? 'text-yellow-500' : quiz.id === 'highest-mountain' ? 'text-emerald-500' : quiz.id === 'official-language' ? 'text-cyan-500' : quiz.id === 'world-knowledge' ? 'text-teal-500' : quiz.id === 'combi-quiz' ? 'text-pink-500' : quiz.id === 'flag-archive' ? 'text-amber-500' : quiz.id === 'multiplayer' ? 'text-purple-500' : 'text-white'}`}>
                          {QUIZ_MODE_ICONS[quiz.id]}
                        </div>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{quiz.name}</p>
                        <p className="text-xs text-gray-400 truncate">{quiz.description}</p>
                      </div>
                    </button>)}
                </div>}

                  {!loading && clanResults.length > 0 && <div className="p-2">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-2">Clans</h3>
                      {clanResults.map(clan => <button key={clan.id} onClick={() => {
                    navigate('/clans');
                    setSearchExpanded(false);
                    setSearchQuery('');
                  }} className="w-full flex items-center gap-3 p-3 hover:bg-white/20 rounded-lg transition-colors">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                            {clan.emoji}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-semibold text-white text-sm truncate">{clan.name}</p>
                            <p className="text-xs text-gray-400">
                              {clan.member_count} {clan.member_count === 1 ? 'Mitglied' : 'Mitglieder'}
                            </p>
                          </div>
                        </button>)}
                    </div>}

                  {!loading && playerResults.length > 0 && <div className="p-2">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-2">Spieler</h3>
                      {playerResults.map(player => <button key={player.user_id} onClick={() => {
                    setSelectedUserId(player.user_id);
                    setSearchExpanded(false);
                    setSearchQuery('');
                  }} className="w-full flex items-center gap-3 p-3 hover:bg-white/20 rounded-lg transition-colors">
                          <Avatar className="h-12 w-12 ring-2 ring-white/20 flex-shrink-0">
                            <AvatarImage src={player.avatar_url || undefined} />
                            <AvatarFallback className="bg-blue-500 text-white text-sm">
                              {player.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 text-left min-w-0">
                            <p className="font-semibold text-white text-sm truncate">{player.username}</p>
                            <p className="text-xs text-gray-400">
                              {t.level || 'Level'} {player.level} • {player.xp} XP
                            </p>
                          </div>
                        </button>)}
                    </div>}
                </div>
                </>}
            </div>
            <ProfileButton transparentStyle onProfileOpenChange={open => {
            if (open && onProfileOpen) {
              onProfileOpen();
            }
          }} />
          </div>
        </div>
      </div>

      {/* Left Column - Hidden on Mobile */}
      <div className="hidden lg:flex absolute bottom-6 left-6 z-10 flex-col gap-5 scale-90 origin-bottom-left" style={{
      width: '420px'
    }}>
        {/* News/Discord Panel */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border-2 border-white/30 transition-all duration-300 hover:bg-white/15 cursor-pointer overflow-hidden" onClick={handleDiscord} style={{
        height: '280px'
      }}>
          <div className="flex flex-col h-full">
            <div className="flex-1 mb-4 bg-gradient-to-br from-purple-600/40 to-blue-600/40 rounded-2xl flex items-center justify-center">
              <div className="text-center p-6">
                <svg viewBox="0 0 24 24" className="w-16 h-16 fill-current text-white mx-auto mb-3">
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
                </svg>
                <h3 className="text-white text-xl font-bold mb-1">DISCORD</h3>
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-white text-lg font-bold mb-1">{t.news}</h4>
              <p className="text-white/70 text-sm">{t.joinDiscord}</p>
            </div>
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border-2 border-white/30" style={{
        height: '280px'
      }}>
          <div className="flex flex-col h-full">
            <h3 className="text-white text-xl font-bold mb-4">{t.quickAccess}</h3>

            <div className="flex-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl py-6 px-8 border border-white/10 relative overflow-hidden flex flex-col items-center justify-center gap-2">
              <img src="/trophy-3d-icon-illustration-png copy.webp" alt="Trophy" className="w-20 h-20 object-contain drop-shadow-2xl -mt-4" />
              <h4 className="text-white text-xl font-bold italic -mt-2">{t.multiplayer.toUpperCase()}</h4>
              <Button onClick={handleMultiplayer} className="bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold px-12 py-3 rounded-full transition-all duration-300 shadow-lg -mt-1 border-2 border-green-700">
                <span className="text-lg">PLAY</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Hidden on Mobile */}
      <div className="hidden lg:flex absolute bottom-6 right-6 z-10 flex-col gap-5 scale-90 origin-bottom-right" style={{
      width: '420px'
    }}>
        {/* Daily Challenge Panel */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 border-2 border-white/30 transition-all duration-300 hover:bg-white/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border-2 border-white/20">
                <img src="/pngtree-july-31-calendar-date-month-picture-image_7830645 copy.png" alt="Daily Challenge" className="w-9 h-9 object-contain" />
              </div>
              <div>
                <h4 className="text-white text-lg font-bold whitespace-nowrap">The Daily Challenge</h4>
              </div>
            </div>
            <Button onClick={handleDailyChallenge} className="bg-gradient-to-b from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-bold px-10 py-3 rounded-full transition-all duration-300 shadow-lg flex-shrink-0 border-2 border-purple-700">
              <span className="text-lg">PLAY</span>
            </Button>
          </div>
        </div>

        {/* Premium Upgrade Panel */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 border-2 border-white/30 transition-all duration-300 hover:bg-white/15">
          <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" />
            Upgrade your Plan
          </h3>

          {/* Premium Card */}
          <div className="bg-gradient-to-br from-amber-900/40 to-yellow-900/40 rounded-2xl p-5 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <p className="text-white text-lg font-bold">
                Premium freischalten
              </p>
              <Button onClick={() => navigate('/premium')} className="bg-gradient-to-b from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold px-10 py-3 rounded-full transition-all duration-300 shadow-lg flex-shrink-0 border-2 border-yellow-700">
                <span className="text-lg">GO</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Current Rank Panel */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 border-2 border-white/30">
          <h3 className="text-white text-xl font-bold mb-4">{t.yourCurrentRank}</h3>

          {/* Rank Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-5 border border-white/10">
            {user ? <div className="flex items-center gap-4">
                <img src={profileRank?.badge} alt={profileRank?.name || 'Rank'} className="w-20 h-20 object-contain drop-shadow-2xl flex-shrink-0" />
                <p className="text-white text-2xl font-bold">
                  {(profileRank?.name || 'Rank').toUpperCase()}
                </p>
              </div> : <div className="text-center p-4">
                <p className="text-white/70 text-base">
                  {t.loginToViewRank}
                </p>
              </div>}
          </div>
        </div>
      </div>

      {/* Center Content - Desktop and Mobile Versions */}
      {isMobile ? <div className="relative z-10 flex flex-col items-center justify-start w-full px-4 pt-20 pb-8 overflow-y-auto max-h-[calc(100vh-64px)]">
          <FlagQuizLogo size="xl" variant="dark" className="mb-8 drop-shadow-2xl" />

          <Button onClick={handleStart} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-xl py-6 px-12 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 mb-12 border-2 border-blue-800">
            <Play className="mr-3 h-6 w-6" />
            {t.start}
          </Button>

          <div className="w-full max-w-md flex flex-col gap-5">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 border-2 border-white/30 transition-all duration-300 active:bg-white/15 cursor-pointer" onClick={handleDiscord}>
              <div className="flex flex-col">
                <div className="mb-3 bg-gradient-to-br from-purple-600/40 to-blue-600/40 rounded-2xl flex items-center justify-center py-8">
                  <div className="text-center">
                    <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current text-white mx-auto mb-2">
                      <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
                    </svg>
                    <h3 className="text-white text-lg font-bold">DISCORD</h3>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-white text-base font-bold mb-1">{t.news}</h4>
                  <p className="text-white/70 text-sm">{t.joinDiscord}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 border-2 border-white/30">
              <h3 className="text-white text-lg font-bold mb-3">{t.quickAccess}</h3>
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl py-5 px-6 border border-white/10 flex flex-col items-center justify-center gap-2">
                <img src="/trophy-3d-icon-illustration-png copy.webp" alt="Trophy" className="w-16 h-16 object-contain drop-shadow-2xl" />
                <h4 className="text-white text-lg font-bold italic">{t.multiplayer.toUpperCase()}</h4>
                <Button onClick={handleMultiplayer} className="bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold px-10 py-2 rounded-full transition-all duration-300 shadow-lg border-2 border-green-700">
                  <span className="text-base">PLAY</span>
                </Button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 border-2 border-white/30 transition-all duration-300 active:bg-white/15">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border-2 border-white/20">
                    <img src="/pngtree-july-31-calendar-date-month-picture-image_7830645 copy.png" alt="Daily Challenge" className="w-7 h-7 object-contain" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold">Daily Challenge</h4>
                  </div>
                </div>
                <Button onClick={handleDailyChallenge} className="bg-gradient-to-b from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-bold px-6 py-2 rounded-full transition-all duration-300 shadow-lg border-2 border-purple-700">
                  <span className="text-sm">PLAY</span>
                </Button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 border-2 border-white/30 transition-all duration-300 active:bg-white/15">
              <h3 className="text-white text-base font-bold mb-3 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                Upgrade your Plan
              </h3>
              <div className="bg-gradient-to-br from-amber-900/40 to-yellow-900/40 rounded-2xl p-4 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-bold">
                    Premium freischalten
                  </p>
                  <Button onClick={() => navigate('/premium')} className="bg-gradient-to-b from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold px-6 py-2 rounded-full transition-all duration-300 shadow-lg flex-shrink-0 border-2 border-yellow-700">
                    <span className="text-sm">GO</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 border-2 border-white/30 mb-4">
              <h3 className="text-white text-lg font-bold mb-3">{t.yourCurrentRank}</h3>
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-4 border border-white/10">
                {user ? <div className="flex items-center gap-3">
                    <img src={profileRank?.badge} alt={profileRank?.name || 'Rank'} className="w-16 h-16 object-contain drop-shadow-2xl flex-shrink-0" />
                    <p className="text-white text-xl font-bold">
                      {(profileRank?.name || 'Rank').toUpperCase()}
                    </p>
                  </div> : <div className="text-center p-3">
                    <p className="text-white/70 text-sm">
                      {t.loginToViewRank}
                    </p>
                  </div>}
              </div>
            </div>
          </div>
        </div> : <div className="relative z-10 text-center max-w-2xl mx-auto mt-16">
          <FlagQuizLogo size="xl" variant="dark" className="mb-20 drop-shadow-2xl scale-90 md:scale-125" />
          <Button onClick={handleStart} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-2xl py-8 px-16 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 scale-90 border-2 border-blue-800">
            <Play className="mr-3 h-8 w-8" />
            {t.start}
          </Button>
        </div>}

      {selectedUserId && <PublicProfileView userId={selectedUserId} onClose={() => setSelectedUserId(null)} onNavigateToClan={clanId => {
      setSelectedUserId(null);
      navigate(`/clans?clanId=${clanId}`);
    }} />}
    </div>;
}