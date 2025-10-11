import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen, Target, MapPin, Map, Zap, Building, Globe, Smile, Trophy, Users, Play, Mountain, Languages, ArrowLeft, Home, Layers, Search } from "lucide-react";

const QUIZ_MODE_ICONS: { [key: string]: React.ReactNode } = {
  'timed': <Clock className="w-5 h-5" />,
  'learn': <BookOpen className="w-5 h-5" />,
  'streak': <Target className="w-5 h-5" />,
  'continent': <Globe className="w-5 h-5" />,
  'speedrush': <Zap className="w-5 h-5" />,
  'capitals': <Building className="w-5 h-5" />,
  'emoji': <Smile className="w-5 h-5" />,
  'highest-mountain': <Mountain className="w-5 h-5" />,
  'official-language': <Languages className="w-5 h-5" />,
  'world-knowledge': <Globe className="w-5 h-5" />,
  'combi-quiz': <Layers className="w-5 h-5" />,
  'multiplayer': <Users className="w-5 h-5" />,
};
import ContinentSelector from "./ContinentSelector";
import TimeSelector from "./TimeSelector";
import CapitalVariantSelector from "./CapitalVariantSelector";
import Leaderboard from "./Leaderboard";
import HamburgerMenu from "./HamburgerMenu";
import ProfileButton from "./ProfileButton";
import MultiplayerMenu from "./MultiplayerMenu";
import BannedScreen from "./BannedScreen";
import { PublicProfileView } from "./PublicProfileView";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/data/translations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import FlagQuizLogo from "@/components/FlagQuizLogo";
interface StartScreenProps {
  onStartQuiz: (mode: 'learn' | 'timed' | 'streak' | 'continent' | 'speedrush' | 'capital-to-country' | 'country-to-capital' | 'emoji' | 'highest-mountain' | 'official-language' | 'world-knowledge' | 'combi-quiz', continent?: string, timeLimit?: number) => void;
  onStartMultiplayer: () => void;
  currentView: string;
  onOpenAdminPanel?: () => void;
  onBackToMainMenu?: () => void;
  shouldOpenProfile?: boolean;
  onProfileOpened?: () => void;
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

const QUIZ_MODES: QuizResult[] = [
  { id: 'timed', name: 'Zeitlimit Modus', description: 'Beantworte so viele Fragen wie möglich', icon: '⏱️' },
  { id: 'learn', name: 'Lernmodus', description: 'Üben ohne Zeitdruck', icon: '📖' },
  { id: 'streak', name: 'Streak Modus', description: 'Wie viele richtige Antworten schaffst du in Folge?', icon: '🎯' },
  { id: 'continent', name: 'Kontinent Modus', description: 'Wähle einen spezifischen Kontinent', icon: '🌍' },
  { id: 'speedrush', name: 'Speed Rush', description: 'Beantworte 10 Fragen so schnell wie möglich', icon: '⚡' },
  { id: 'capitals', name: 'Hauptstädte', description: 'Erkenne das Land anhand der Hauptstadt', icon: '🏛️' },
  { id: 'emoji', name: 'Emoji Modus', description: 'Erkenne Länder anhand ihrer Flaggen-Emojis', icon: '😃' },
  { id: 'highest-mountain', name: 'Höchste Berge', description: 'Erkenne den höchsten Berg jedes Landes', icon: '⛰️' },
  { id: 'official-language', name: 'Amtssprachen', description: 'Erkenne die Amtssprache jedes Landes', icon: '🗣️' },
  { id: 'world-knowledge', name: 'Weltwissen Quiz', description: 'Teste dein Wissen über Weltfakten', icon: '🌏' },
  { id: 'combi-quiz', name: 'Combi-Quiz', description: 'Wähle deine Kategorien und spiele endlos', icon: '🎭' },
  { id: 'multiplayer', name: 'Multiplayer', description: 'Spiele gegen andere in Echtzeit', icon: '👥' },
];

export default function StartScreen({
  onStartQuiz,
  onStartMultiplayer,
  currentView,
  onOpenAdminPanel,
  onBackToMainMenu,
  shouldOpenProfile = false,
  onProfileOpened
}: StartScreenProps) {
  const {
    language
  } = useLanguage();
  const t = useTranslation(language);
  const { user } = useAuth();
  const [showContinentSelector, setShowContinentSelector] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [showCapitalVariantSelector, setShowCapitalVariantSelector] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMultiplayerMenu, setShowMultiplayerMenu] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banInfo, setBanInfo] = useState<{ reason?: string; bannedAt?: string }>({});
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playerResults, setPlayerResults] = useState<SearchResult[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [clanResults, setClanResults] = useState<ClanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [cameFromMainMenu, setCameFromMainMenu] = useState(false);

  useEffect(() => {
    if (shouldOpenProfile) {
      setIsProfileOpen(true);
      setCameFromMainMenu(true);
      onProfileOpened?.();
    }
  }, [shouldOpenProfile, onProfileOpened]);

  useEffect(() => {
    const checkBanStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('banned, ban_reason, banned_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.banned) {
        setIsBanned(true);
        setBanInfo({
          reason: data.ban_reason || undefined,
          bannedAt: data.banned_at || undefined
        });
      } else {
        setIsBanned(false);
        setBanInfo({});
      }
    };

    checkBanStatus();

    // Subscribe to real-time updates for ban status
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData.banned) {
            setIsBanned(true);
            setBanInfo({
              reason: newData.ban_reason || undefined,
              bannedAt: newData.banned_at || undefined
            });
          } else {
            setIsBanned(false);
            setBanInfo({});
          }
        }
      )
      .subscribe();

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

        const filteredQuizzes = QUIZ_MODES.filter(quiz =>
          quiz.name.toLowerCase().includes(query) ||
          quiz.description.toLowerCase().includes(query)
        );
        setQuizResults(filteredQuizzes);

        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .ilike('username', `${searchQuery}%`)
          .limit(20);

        if (profiles) {
          const userIds = profiles.map(p => p.user_id);
          const { data: statsData } = await supabase
            .from('user_stats')
            .select('user_id, level, xp')
            .in('user_id', userIds);

          const combined = profiles.map(profile => {
            const userStat = statsData?.find(s => s.user_id === profile.user_id);
            return {
              user_id: profile.user_id,
              username: profile.username,
              avatar_url: profile.avatar_url,
              level: userStat?.level || 0,
              xp: userStat?.xp || 0,
            };
          });

          setPlayerResults(combined);
        }

        const { data: clans } = await supabase
          .from('clans')
          .select('id, name, emoji')
          .ilike('name', `%${searchQuery}%`)
          .limit(10);

        if (clans) {
          const clanIds = clans.map(c => c.id);
          const { data: memberCounts } = await supabase
            .from('profiles')
            .select('clan_id')
            .in('clan_id', clanIds);

          const clansWithCounts = clans.map(clan => {
            const count = memberCounts?.filter(m => m.clan_id === clan.id).length || 0;
            return {
              id: clan.id,
              name: clan.name,
              emoji: clan.emoji,
              member_count: count,
            };
          });

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
  const handleModeClick = (mode: string) => {
    if (isBanned) return;
    
    if (mode === 'continent') {
      setShowContinentSelector(true);
    } else if (mode === 'speedrush') {
      setShowTimeSelector(true);
    } else if (mode === 'capitals') {
      setShowCapitalVariantSelector(true);
    } else if (mode === 'multiplayer') {
      onStartMultiplayer();
    } else {
      onStartQuiz(mode as any);
    }
  };
  const handleContinentSelect = (continent: string) => {
    setShowContinentSelector(false);
    onStartQuiz('continent', continent);
  };
  const handleTimeSelect = (timeLimit: number) => {
    setShowTimeSelector(false);
    onStartQuiz('speedrush', undefined, timeLimit);
  };
  const handleCapitalVariantSelect = (variant: 'capital-to-country' | 'country-to-capital') => {
    setShowCapitalVariantSelector(false);
    onStartQuiz(variant);
  };
  const handleBack = () => {
    setShowContinentSelector(false);
    setShowTimeSelector(false);
    setShowCapitalVariantSelector(false);
    setShowMultiplayerMenu(false);
  };
  if (isBanned) {
    return <BannedScreen banReason={banInfo.reason} bannedAt={banInfo.bannedAt} />;
  }

  if (showLeaderboard) {
    return <Leaderboard />;
  }
  if (showMultiplayerMenu) {
    return <MultiplayerMenu onMatchJoined={onStartMultiplayer} onBackToMain={() => setShowMultiplayerMenu(false)} />;
  }
  if (showContinentSelector) {
    return <ContinentSelector onSelectContinent={handleContinentSelect} onBack={handleBack} />;
  }
  if (showTimeSelector) {
    return <TimeSelector onSelectTime={handleTimeSelect} onBack={handleBack} />;
  }
  if (showCapitalVariantSelector) {
    return <CapitalVariantSelector onSelectVariant={handleCapitalVariantSelect} onBack={handleBack} />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4 relative">
      <div className="absolute top-4 right-4 z-50 flex gap-2 items-center">
        <div ref={searchRef} className="relative">
          <div
            className={`flex items-center gap-2 bg-background border rounded-lg transition-all duration-300 ${
              searchExpanded ? 'w-[280px]' : 'w-10 h-10'
            }`}
          >
            <Button
              onClick={() => setSearchExpanded(!searchExpanded)}
              variant="outline"
              size="icon"
              className="rounded-lg flex-shrink-0"
            >
              <Search className="h-5 w-5" />
            </Button>
            {searchExpanded && (
              <Input
                placeholder={t.searchPlayersPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none h-10 focus-visible:ring-0 pr-4"
                autoFocus
              />
            )}
          </div>

          {searchExpanded && (searchQuery || loading) && (
            <div className="absolute top-12 right-0 w-[280px] bg-background border rounded-2xl shadow-2xl max-h-[500px] overflow-y-auto">
              {loading && (
                <div className="text-center py-8 text-muted-foreground">
                  {t.loading || 'Lädt...'}
                </div>
              )}

              {!loading && searchQuery && playerResults.length === 0 && quizResults.length === 0 && clanResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Ergebnisse gefunden
                </div>
              )}

              {!loading && quizResults.length > 0 && (
                <div className="p-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">Quiz</h3>
                  {quizResults.map((quiz) => (
                    <button
                      key={quiz.id}
                      onClick={() => {
                        handleModeClick(quiz.id);
                        setSearchExpanded(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <div className={`${
                          quiz.id === 'timed' ? 'text-blue-500' :
                          quiz.id === 'learn' ? 'text-green-500' :
                          quiz.id === 'streak' ? 'text-red-500' :
                          quiz.id === 'continent' ? 'text-purple-500' :
                          quiz.id === 'speedrush' ? 'text-orange-500' :
                          quiz.id === 'capitals' ? 'text-indigo-500' :
                          quiz.id === 'emoji' ? 'text-yellow-500' :
                          quiz.id === 'highest-mountain' ? 'text-emerald-500' :
                          quiz.id === 'official-language' ? 'text-cyan-500' :
                          quiz.id === 'world-knowledge' ? 'text-teal-500' :
                          quiz.id === 'combi-quiz' ? 'text-pink-500' :
                          quiz.id === 'multiplayer' ? 'text-purple-500' :
                          ''
                        }`}>
                          {QUIZ_MODE_ICONS[quiz.id]}
                        </div>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-semibold text-sm truncate">{quiz.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{quiz.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loading && clanResults.length > 0 && (
                <div className="p-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">Clans</h3>
                  {clanResults.map((clan) => (
                    <button
                      key={clan.id}
                      onClick={() => {
                        setSearchExpanded(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                        {clan.emoji}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-semibold text-sm truncate">{clan.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {clan.member_count} {clan.member_count === 1 ? 'Mitglied' : 'Mitglieder'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loading && playerResults.length > 0 && (
                <div className="p-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">Spieler</h3>
                  {playerResults.map((player) => (
                    <button
                      key={player.user_id}
                      onClick={() => {
                        setSelectedUserId(player.user_id);
                        setSearchExpanded(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors"
                    >
                      <Avatar className="h-12 w-12 ring-2 ring-border flex-shrink-0">
                        <AvatarImage src={player.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {player.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 text-left min-w-0">
                        <p className="font-semibold text-sm truncate">{player.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.level || 'Level'} {player.level} • {player.xp} XP
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <ProfileButton
          onOpenAdminPanel={onOpenAdminPanel}
          initialOpen={shouldOpenProfile}
          onProfileOpenChange={(open) => {
            setIsProfileOpen(open);
            if (!open && cameFromMainMenu && onBackToMainMenu) {
              setCameFromMainMenu(false);
              onBackToMainMenu();
            }
          }}
        />
      </div>

      {/* Buttons Container - Responsive Layout */}
      {!isProfileOpen && (
        <div className="absolute top-4 left-4 z-50">
          <HamburgerMenu
            onNavigateHome={onBackToMainMenu || (() => {})}
            onNavigateQuiz={() => {}}
            currentPage="quiz"
            onProfileSelect={(userId) => setSelectedUserId(userId)}
          />
        </div>
      )}
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <FlagQuizLogo size="md" variant="light" className="mb-4 md:scale-110" />
          <p className="text-xl text-muted-foreground">
            {t.mainSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Timed Mode */}
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-6 h-6 text-blue-500" />
                {t.timedMode}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col min-h-[120px]">
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                Wie schnell schaffst du alle Flaggen zu benennen?
              </p>
              <Button onClick={() => handleModeClick('timed')} className="w-full mt-auto">
                <Play className="mr-2 h-4 w-4" />
                {t.start}
              </Button>
            </CardContent>
          </Card>

          {/* Learn Mode */}
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-6 h-6 text-green-500" />
                {t.learnMode}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col min-h-[120px]">
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                Üben ohne Zeitdruck
              </p>
              <Button onClick={() => handleModeClick('learn')} className="w-full mt-auto">
                <Play className="mr-2 h-4 w-4" />
                {t.start}
              </Button>
            </CardContent>
          </Card>

          {/* Streak Mode */}
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-6 h-6 text-red-500" />
                {t.streakMode}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col min-h-[120px]">
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                Wie viele Flaggen schaffst du hintereinander ohne Fehler?
              </p>
              <Button onClick={() => handleModeClick('streak')} className="w-full mt-auto">
                <Play className="mr-2 h-4 w-4" />
                {t.start}
              </Button>
            </CardContent>
          </Card>

          {/* Continent Mode */}
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-6 h-6 text-purple-500" />
                {t.continentMode}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col min-h-[120px]">
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                Flaggen nur von einem bestimmten Kontinent
              </p>
              <Button onClick={() => handleModeClick('continent')} className="w-full mt-auto">
                <Play className="mr-2 h-4 w-4" />
                {t.start}
              </Button>
            </CardContent>
          </Card>

          {/* Speed Rush */}
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-6 h-6 text-orange-500" />
                {t.speedRush}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col min-h-[120px]">
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                Wie viele Flaggen kannst du in einer bestimmten Zeit benennen?
              </p>
              <Button onClick={() => handleModeClick('speedrush')} className="w-full mt-auto">
                <Play className="mr-2 h-4 w-4" />
                {t.start}
              </Button>
            </CardContent>
          </Card>

          {/* Capitals */}
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="w-6 h-6 text-indigo-500" />
                {t.capitalToCountry.split(' → ')[0]}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col min-h-[120px]">
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                {t.capitalToCountryDesc}
              </p>
              <Button onClick={() => handleModeClick('capitals')} className="w-full mt-auto">
                <Play className="mr-2 h-4 w-4" />
                {t.start}
              </Button>
            </CardContent>
          </Card>

          {/* Emoji Mode */}
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smile className="w-6 h-6 text-yellow-500" />
                {t.emojiMode}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col min-h-[120px]">
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                {t.emojiModeDesc}
              </p>
              <Button onClick={() => handleModeClick('emoji')} className="w-full mt-auto">
                <Play className="mr-2 h-4 w-4" />
                {t.start}
              </Button>
            </CardContent>
          </Card>

          {/* Highest Mountain */}
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mountain className="w-6 h-6 text-emerald-500" />
                {t.mountainMode}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col min-h-[120px]">
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                {t.mountainModeDesc}
              </p>
              <Button onClick={() => handleModeClick('highest-mountain')} className="w-full mt-auto">
                <Play className="mr-2 h-4 w-4" />
                {t.start}
              </Button>
            </CardContent>
          </Card>

          {/* Official Language */}
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Languages className="w-6 h-6 text-cyan-500" />
                {t.languageMode}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col min-h-[120px]">
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                {t.languageModeDesc}
              </p>
              <Button onClick={() => handleModeClick('official-language')} className="w-full mt-auto">
                <Play className="mr-2 h-4 w-4" />
                {t.start}
              </Button>
            </CardContent>
          </Card>

          {/* World Knowledge Quiz */}
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-6 h-6 text-teal-500" />
                {t.worldKnowledge}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col min-h-[120px]">
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                {t.worldKnowledgeDesc}
              </p>
              <Button onClick={() => handleModeClick('world-knowledge')} className="w-full mt-auto">
                <Play className="mr-2 h-4 w-4" />
                {t.start}
              </Button>
            </CardContent>
          </Card>

          {/* Combi-Quiz */}
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="w-6 h-6 text-pink-500" />
                Combi-Quiz
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col min-h-[120px]">
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                Wähle deine Kategorien und spiele endlos
              </p>
              <Button onClick={() => handleModeClick('combi-quiz')} className="w-full mt-auto">
                <Play className="mr-2 h-4 w-4" />
                {t.start}
              </Button>
            </CardContent>
          </Card>

          {/* Multiplayer */}
          <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-6 h-6 text-purple-500" />
                {t.multiplayer}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col min-h-[120px]">
              <p className="text-sm text-muted-foreground mb-4 flex-grow">
                Trete gegen deine Freunde in einem 1vs1 Duell an!
              </p>
              <Button onClick={() => handleModeClick('multiplayer')} className="w-full mt-auto">
                <Users className="mr-2 h-4 w-4" />
                {t.start}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">Erkenne die Flaggen von Afrika, Asien, Europa, Nord- und Südamerika sowie Ozeanien. Made by ijuriqu</p>
        </div>
      </div>

      {selectedUserId && (
        <PublicProfileView
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>;
}