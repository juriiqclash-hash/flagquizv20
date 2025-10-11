import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Loader2, Languages, Users, Calendar, Search } from "lucide-react";
import ProfileButton from "@/components/ProfileButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/data/translations";
import FlagQuizLogo from "@/components/FlagQuizLogo";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { PlayerSearch } from "@/components/PlayerSearch";
import { PublicProfileView } from "@/components/PublicProfileView";
import { FriendsMenu } from "@/components/FriendsMenu";

import { calculateLevel } from "@/lib/xpSystem";
import { calculateRank as calculateProfileRank } from "@/lib/profileRank";
interface MainMenuProps {
  onStart: () => void;
  onMultiplayerStart?: () => void;
  onDailyChallengeStart?: () => void;
}

export default function MainMenu({ onStart, onMultiplayerStart, onDailyChallengeStart }: MainMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showFriendsMenu, setShowFriendsMenu] = useState(false);
  const { user } = useAuth();
  const { stats } = useUserStats();
  const { language, setLanguage } = useLanguage();
  const t = useTranslation(language);

  const userXP = stats?.xp ?? 0;
  const userLevel = calculateLevel(userXP);
  const profileRank = stats ? calculateProfileRank({
    bestStreak: stats.best_streak ?? 0,
    bestTimeMode: stats.time_mode_best_score ?? 0,
    duelWins: stats.multiplayer_wins ?? 0,
    bestPosition: 0,
  }, userLevel) : null;

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url("/F5BD60DF-0BF3-4DCD-B9C2-C433C2CB0628.png")`, // <--- dein Wallpaper hier
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-2xl text-white font-semibold">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        backgroundImage: `url("/F5BD60DF-0BF3-4DCD-B9C2-C433C2CB0628.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Language Selector - Top Left */}
      <div className="absolute top-4 left-4 z-20">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[160px] bg-white/10 text-white border-white/20 hover:bg-white/20">
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
      </div>

      {/* Profile and Search Buttons - Top Right */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          onClick={() => setShowPlayerSearch(true)}
          variant="ghost"
          size="icon"
          className="bg-white/10 hover:bg-white/20 text-white border-white/20"
        >
          <Search className="h-5 w-5" />
        </Button>
        <ProfileButton transparentStyle onProfileOpenChange={() => {}} />
      </div>

      {/* Left Column - Hidden on Mobile */}
      <div className="hidden lg:flex absolute bottom-6 left-6 z-10 flex-col gap-5 scale-90 origin-bottom-left" style={{ width: '420px' }}>
        {/* News/Discord Panel */}
        <div
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 transition-all duration-300 hover:bg-white/15 cursor-pointer overflow-hidden"
          onClick={handleDiscord}
          style={{ height: '280px' }}
        >
          <div className="flex flex-col h-full">
            <div className="flex-1 mb-4 bg-gradient-to-br from-purple-600/40 to-blue-600/40 rounded-2xl flex items-center justify-center">
              <div className="text-center p-6">
                <svg viewBox="0 0 24 24" className="w-16 h-16 fill-current text-white mx-auto mb-3">
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
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
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 border border-white/20">
          <h3 className="text-white text-xl font-bold mb-4">{t.quickAccess}</h3>

          {/* Multiplayer Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <img src="/10614367 copy.png" alt="Multiplayer" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <h4 className="text-white text-lg font-bold">{t.multiplayer}</h4>
                </div>
              </div>
              <Button
                onClick={handleMultiplayer}
                className="bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold px-10 py-3 rounded-full transition-all duration-300 shadow-lg"
              >
                <span className="text-lg">PLAY</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Hidden on Mobile */}
      <div className="hidden lg:flex absolute bottom-6 right-6 z-10 flex-col gap-5 scale-90 origin-bottom-right" style={{ width: '420px' }}>
        {/* Daily Challenge Panel */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border-2 border-white/20">
                <img src="/pngtree-july-31-calendar-date-month-picture-image_7830645 copy.png" alt="Daily Challenge" className="w-9 h-9 object-contain" />
              </div>
              <div>
                <h4 className="text-white text-xl font-bold">{t.dailyChallengeTitle}</h4>
              </div>
            </div>
            <Button
              onClick={handleDailyChallenge}
              className="bg-gradient-to-b from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white font-bold px-10 py-3 rounded-full transition-all duration-300 shadow-lg"
            >
              <span className="text-lg">PLAY</span>
            </Button>
          </div>
        </div>

        {/* Daily Streak Panel */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 border border-white/20">
          <h3 className="text-white text-xl font-bold mb-4">{t.dailyStreak}</h3>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 rounded-2xl p-5 border border-orange-500/30">
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl">🔥</span>
              <p className="text-white text-lg font-bold">{t.youAreOnStreak.replace('{count}', String(stats?.best_streak || 0))}</p>
            </div>
          </div>
        </div>

        {/* Current Rank Panel */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20" style={{ height: '280px' }}>
          <div className="flex flex-col h-full">
            <div className="text-center mb-4">
              <h4 className="text-white text-lg font-bold">{t.yourCurrentRank}</h4>
            </div>
            <div className="flex-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl flex items-center justify-center border border-white/10">
              {user ? (
                <div className="text-center p-6">
                  <div className="flex items-center justify-center mb-3">
                    <img
                      src={profileRank?.badge}
                      alt={profileRank?.name || 'Rank'}
                      className="w-24 h-24 object-contain drop-shadow-2xl"
                    />
                  </div>
                  <p className="text-white text-xl font-bold">
                    {(profileRank?.name || 'Rank').toUpperCase()}
                  </p>
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-white/70 text-base">
                    {t.loginToViewRank}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Center Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <FlagQuizLogo size="xl" variant="dark" className="mb-20 drop-shadow-2xl scale-90 md:scale-125" />
        <Button
          onClick={handleStart}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white text-2xl py-8 px-16 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 scale-90"
        >
          <Play className="mr-3 h-8 w-8" />
          {t.start}
        </Button>
      </div>

      <PlayerSearch
        open={showPlayerSearch}
        onOpenChange={setShowPlayerSearch}
        onPlayerSelect={(userId) => setSelectedUserId(userId)}
      />

      <FriendsMenu
        open={showFriendsMenu}
        onOpenChange={setShowFriendsMenu}
        onProfileSelect={(userId) => setSelectedUserId(userId)}
      />

      {selectedUserId && (
        <PublicProfileView
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}
