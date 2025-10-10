import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Loader2, Languages, Users } from "lucide-react";
import ProfileButton from "@/components/ProfileButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/data/translations";
import FlagQuizLogo from "@/components/FlagQuizLogo";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { getRankFromLevel, getRankTier } from "@/lib/rankSystem";

interface MainMenuProps {
  onStart: () => void;
  onMultiplayerStart?: () => void;
  onDailyChallengeStart?: () => void;
}

export default function MainMenu({ onStart, onMultiplayerStart, onDailyChallengeStart }: MainMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { stats } = useUserStats();
  const { language, setLanguage } = useLanguage();
  const t = useTranslation(language);

  const userLevel = stats?.level || 0;
  const userRank = getRankFromLevel(userLevel);
  const rankTier = getRankTier(userLevel, userRank);

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
    window.open('https://discord.gg/yourserver', '_blank');
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
      <div className="absolute z-20" style={{ top: '1.5rem', left: '1.5rem' }}>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="bg-white/10 text-white border-white/20 hover:bg-white/20" style={{ width: '10rem' }}>
            <Languages className="mr-2" style={{ width: '1rem', height: '1rem' }} />
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

      {/* Profile Button - Top Right */}
      <div className="absolute z-20" style={{ top: '1.5rem', right: '1.5rem' }}>
        <ProfileButton transparentStyle onProfileOpenChange={() => {}} />
      </div>

      {/* Left Column */}
      <div className="absolute z-10 flex flex-col" style={{ bottom: '1.5rem', left: '1.5rem', width: '26.25rem', gap: '1.25rem' }}>
        {/* News/Discord Panel */}
        <div
          className="bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15 cursor-pointer overflow-hidden"
          onClick={handleDiscord}
          style={{ height: '17.5rem', borderRadius: '1.5rem', padding: '1.5rem' }}
        >
          <div className="flex flex-col h-full">
            <div className="flex-1 bg-gradient-to-br from-purple-600/40 to-blue-600/40 flex items-center justify-center" style={{ marginBottom: '1rem', borderRadius: '1rem' }}>
              <div className="text-center" style={{ padding: '1.5rem' }}>
                <svg viewBox="0 0 24 24" className="fill-current text-white mx-auto" style={{ width: '4rem', height: '4rem', marginBottom: '0.75rem' }}>
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                </svg>
                <h3 className="text-white font-bold" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>DISCORD</h3>
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-white font-bold" style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>NEWS</h4>
              <p className="text-white/70" style={{ fontSize: '0.875rem' }}>{t.joinDiscord}</p>
            </div>
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20" style={{ borderRadius: '1.5rem', padding: '1.25rem' }}>
          <h3 className="text-white font-bold" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick access</h3>

          {/* Multiplayer Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10" style={{ borderRadius: '1rem', padding: '1.25rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
              <div className="flex items-center" style={{ gap: '0.75rem' }}>
                <div className="rounded-full bg-white/10 flex items-center justify-center" style={{ width: '3rem', height: '3rem' }}>
                  <Users className="text-white" style={{ width: '1.5rem', height: '1.5rem' }} />
                </div>
                <div>
                  <h4 className="text-white font-bold" style={{ fontSize: '1.125rem' }}>Multiplayer</h4>
                </div>
              </div>
              <Button
                onClick={handleMultiplayer}
                className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-all duration-300"
                style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
              >
                {t.play}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="absolute z-10 flex flex-col" style={{ bottom: '1.5rem', right: '1.5rem', width: '26.25rem', gap: '1.25rem' }}>
        {/* Daily Challenge Panel */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/15" style={{ borderRadius: '1.5rem', padding: '1.25rem' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{ gap: '1rem' }}>
              <div className="rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border-white/20" style={{ width: '3.5rem', height: '3.5rem', borderWidth: '2px' }}>
                <span style={{ fontSize: '1.5rem' }}>🏁</span>
              </div>
              <div>
                <h4 className="text-white font-bold" style={{ fontSize: '1.25rem' }}>The Daily Challenge</h4>
              </div>
            </div>
            <Button
              onClick={handleDailyChallenge}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-all duration-300"
              style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
            >
              {t.play}
            </Button>
          </div>
        </div>

        {/* Daily Streak Panel */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20" style={{ borderRadius: '1.5rem', padding: '1.25rem' }}>
          <h3 className="text-white font-bold" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Daily Streak</h3>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border border-orange-500/30" style={{ borderRadius: '1rem', padding: '1.25rem' }}>
            <div className="flex items-center justify-center" style={{ gap: '0.75rem' }}>
              <span style={{ fontSize: '2.5rem' }}>🔥</span>
              <p className="text-white font-bold" style={{ fontSize: '1.125rem' }}>Du bist auf einer {stats?.best_streak || 0} Streak</p>
            </div>
          </div>
        </div>

        {/* Current Rank Panel */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20" style={{ height: '17.5rem', borderRadius: '1.5rem', padding: '1.5rem' }}>
          <div className="flex flex-col h-full">
            <div className="text-center" style={{ marginBottom: '1rem' }}>
              <h4 className="text-white font-bold" style={{ fontSize: '1.125rem' }}>Dein aktueller Rang</h4>
            </div>
            <div className="flex-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 flex items-center justify-center border border-white/10" style={{ borderRadius: '1rem' }}>
              {user && (
                <div className="text-center" style={{ padding: '1.5rem' }}>
                  <div className="flex items-center justify-center" style={{ marginBottom: '0.75rem' }}>
                    <img
                      src={userRank.image}
                      alt={userRank.name}
                      className="object-contain drop-shadow-2xl"
                      style={{ width: '6rem', height: '6rem' }}
                    />
                  </div>
                  <p className="text-white font-bold" style={{ color: userRank.color, fontSize: '1.25rem' }}>
                    {userRank.name.toUpperCase()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Center Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <div style={{ marginBottom: '5rem' }}>
          <FlagQuizLogo size="xl" variant="dark" className="drop-shadow-2xl scale-90 md:scale-125" />
        </div>
        <Button
          onClick={handleStart}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-2xl transition-all duration-300 hover:scale-105"
          style={{ fontSize: '1.5rem', paddingTop: '2rem', paddingBottom: '2rem', paddingLeft: '4rem', paddingRight: '4rem', borderRadius: '1rem' }}
        >
          <Play className="mr-3" style={{ height: '2rem', width: '2rem' }} />
          {t.start}
        </Button>
      </div>
    </div>
  );
}
