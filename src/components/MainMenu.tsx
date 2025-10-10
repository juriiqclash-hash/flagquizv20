import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Loader2, Languages, Users, Flag, Flame } from "lucide-react";
import ProfileButton from "@/components/ProfileButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/data/translations";
import FlagQuizLogo from "@/components/FlagQuizLogo";

interface MainMenuProps {
  onStart: () => void;
  onMultiplayerStart?: () => void;
  onDailyChallengeStart?: () => void;
}

export default function MainMenu({ onStart, onMultiplayerStart, onDailyChallengeStart }: MainMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dailyStreak] = useState(5);
  const { language, setLanguage } = useLanguage();
  const t = useTranslation(language);

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
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
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

      <div className="absolute top-4 right-4 z-20">
        <ProfileButton transparentStyle onProfileOpenChange={() => {}} />
      </div>

      {/* News/Discord Panel - Top Left */}
      <div className="absolute top-4 left-4 mt-16 z-10" style={{ width: '380px' }}>
        <div
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 cursor-pointer"
          onClick={handleDiscord}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-white text-2xl">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                </svg>
              </div>
              <span className="text-white text-base font-medium">
                {t.joinDiscord}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multiplayer Panel - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10" style={{ width: '380px' }}>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-white" />
              <div>
                <div className="text-white text-lg font-bold">{t.multiplayer}</div>
                <div className="text-white/70 text-sm">{t.playAgainstOthers}</div>
              </div>
            </div>
            <Button
              onClick={handleMultiplayer}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-2 rounded-lg transition-all duration-300"
            >
              {t.play}
            </Button>
          </div>
        </div>
      </div>

      {/* Daily Challenge Panel - Top Right */}
      <div className="absolute top-4 right-4 mt-16 z-10" style={{ width: '340px' }}>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Flag className="w-8 h-8 text-white" />
              <div>
                <div className="text-white text-lg font-bold">{t.dailyChallenge}</div>
              </div>
            </div>
            <Button
              onClick={handleDailyChallenge}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-2 rounded-lg transition-all duration-300"
            >
              {t.play}
            </Button>
          </div>
        </div>
      </div>

      {/* Daily Streak Panel - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-10" style={{ width: '340px' }}>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15">
          <div className="flex items-center gap-4">
            <Flame className="w-8 h-8 text-orange-400" />
            <div>
              <div className="text-white text-lg font-bold">{t.dailyStreak}</div>
              <div className="text-white/90 text-base">{t.daysInRow.replace('{count}', dailyStreak.toString())}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <FlagQuizLogo size="xl" variant="dark" className="mb-6 drop-shadow-2xl scale-90 md:scale-125" />
        <p className="text-xl md:text-2xl text-white/90 mb-16 drop-shadow-md">
          {t.mainSubtitle}
        </p>
        <Button
          onClick={handleStart}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white text-2xl py-8 px-16 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105"
        >
          <Play className="mr-3 h-8 w-8" />
          {t.start}
        </Button>
      </div>
    </div>
  );
}
