import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen, Target, MapPin, Map, Zap, Building, Globe, Smile, Trophy, Users, Play, Mountain, Languages, ArrowLeft, Home, Layers } from "lucide-react";
import ContinentSelector from "./ContinentSelector";
import TimeSelector from "./TimeSelector";
import CapitalVariantSelector from "./CapitalVariantSelector";
import Leaderboard from "./Leaderboard";
import LeaderboardButton from "./LeaderboardButton";
import ProfileButton from "./ProfileButton";
import MultiplayerMenu from "./MultiplayerMenu";
import BannedScreen from "./BannedScreen";
import HamburgerMenu from "./HamburgerMenu";
import FriendsView from "./FriendsView";
import ClansView from "./ClansView";
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
}
export default function StartScreen({
  onStartQuiz,
  onStartMultiplayer,
  currentView,
  onOpenAdminPanel,
  onBackToMainMenu
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
  const [showFriends, setShowFriends] = useState(false);
  const [showClans, setShowClans] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banInfo, setBanInfo] = useState<{ reason?: string; bannedAt?: string }>({});
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  const handleHamburgerNavigation = (view: 'home' | 'leaderboard' | 'friends' | 'clans') => {
    setShowLeaderboard(false);
    setShowFriends(false);
    setShowClans(false);

    if (view === 'leaderboard') {
      setShowLeaderboard(true);
    } else if (view === 'friends') {
      setShowFriends(true);
    } else if (view === 'clans') {
      setShowClans(true);
    }
  };
  if (isBanned) {
    return <BannedScreen banReason={banInfo.reason} bannedAt={banInfo.bannedAt} />;
  }

  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="absolute top-4 left-4 z-50">
          <HamburgerMenu onNavigate={handleHamburgerNavigation} currentView="leaderboard" />
        </div>
        <Leaderboard />
      </div>
    );
  }

  if (showFriends) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="absolute top-4 left-4 z-50">
          <HamburgerMenu onNavigate={handleHamburgerNavigation} currentView="friends" />
        </div>
        <FriendsView />
      </div>
    );
  }

  if (showClans) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="absolute top-4 left-4 z-50">
          <HamburgerMenu onNavigate={handleHamburgerNavigation} currentView="clans" />
        </div>
        <ClansView />
      </div>
    );
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
      <div className="absolute top-4 right-4 z-50">
        <ProfileButton 
          onOpenAdminPanel={onOpenAdminPanel} 
          onProfileOpenChange={setIsProfileOpen}
        />
      </div>
      
      {/* Hamburger Menu - Top Left */}
      {!isProfileOpen && (
        <div className="absolute top-4 left-4 z-50">
          <HamburgerMenu onNavigate={handleHamburgerNavigation} currentView="home" />
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
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Wie schnell schaffst du alle Flaggen zu benennen?
              </p>
              <Button onClick={() => handleModeClick('timed')} className="w-full">
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
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Üben ohne Zeitdruck
              </p>
              <Button onClick={() => handleModeClick('learn')} className="w-full">
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
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Wie viele Flaggen schaffst du hintereinander ohne Fehler?
              </p>
              <Button onClick={() => handleModeClick('streak')} className="w-full">
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
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Flaggen nur von einem bestimmten Kontinent
              </p>
              <Button onClick={() => handleModeClick('continent')} className="w-full">
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
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Wie viele Flaggen kannst du in einer bestimmten Zeit benennen?
              </p>
              <Button onClick={() => handleModeClick('speedrush')} className="w-full">
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
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t.capitalToCountryDesc}
              </p>
              <Button onClick={() => handleModeClick('capitals')} className="w-full">
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
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t.emojiModeDesc}
              </p>
              <Button onClick={() => handleModeClick('emoji')} className="w-full">
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
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t.mountainModeDesc}
              </p>
              <Button onClick={() => handleModeClick('highest-mountain')} className="w-full">
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
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t.languageModeDesc}
              </p>
              <Button onClick={() => handleModeClick('official-language')} className="w-full">
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
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t.worldKnowledgeDesc}
              </p>
              <Button onClick={() => handleModeClick('world-knowledge')} className="w-full">
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
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Wähle deine Kategorien und spiele endlos
              </p>
              <Button onClick={() => handleModeClick('combi-quiz')} className="w-full">
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
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Trete gegen deine Freunde in einem 1vs1 Duell an!
              </p>
              <Button onClick={() => handleModeClick('multiplayer')} className="w-full">
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
    </div>;
}