import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Loader2, Languages, Users, MessageCircle, Trophy, Flame } from "lucide-react";
import ProfileButton from "@/components/ProfileButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/data/translations";
import FlagQuizLogo from "@/components/FlagQuizLogo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface MainMenuProps {
  onStart: () => void;
  onMultiplayerClick?: () => void;
}

export default function MainMenu({ onStart, onMultiplayerClick }: MainMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = useTranslation(language);
  const { user } = useAuth();
  const [dailyStreak, setDailyStreak] = useState(0);
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      const { data: stats } = await supabase
        .from('user_stats')
        .select('daily_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      if (stats) {
        setDailyStreak(stats.daily_streak || 0);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleStart = () => {
    setIsLoading(true);
    // Weighted random: most often under 500ms, sometimes under 1000ms, rarely up to 1500ms
    const random = Math.random() * Math.random(); // Squares the distribution towards 0
    const randomDelay = Math.floor(random * 1200) + 300;
    setTimeout(() => {
      onStart();
    }, randomDelay);
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
        backgroundImage: `url("/F5BD60DF-0BF3-4DCD-B9C2-C433C2CB0628.png")`, // <--- dein Wallpaper hier
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

      {/* Left Side Panels */}
      <div className="absolute left-5 top-5 flex flex-col gap-5 w-[380px] z-20 hidden lg:flex">
        {/* News/Info Panel */}
        <div className="bg-[#1A1238]/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/10 hover:border-purple-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#5865F2] p-3 rounded-full">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                  Join our Discord
                </h3>
                <p className="text-white/70 text-sm">Connect with the community!</p>
              </div>
            </div>
            <Button
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-2 rounded-full"
              onClick={() => window.open('https://discord.gg/your-link', '_blank')}
            >
              Join
            </Button>
          </div>
        </div>

        {/* Quick Access - Multiplayer */}
        <div className="bg-gradient-to-br from-[#1A1238]/80 to-[#2A1858]/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-600/30 p-3 rounded-2xl">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-2xl mb-1" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                MULTIPLAYER
              </h3>
              <p className="text-white/60 text-sm">Play against others in real time.</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-orange-400 font-semibold text-sm">
              Bronze
            </div>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full shadow-lg shadow-green-500/30 transition-all duration-300"
              onClick={onMultiplayerClick}
            >
              <Play className="w-5 h-5 mr-2" />
              PLAY
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side Panels */}
      <div className="absolute right-5 top-5 flex flex-col gap-5 w-[340px] z-20 hidden lg:flex">
        {/* Daily Challenge */}
        <div className="bg-gradient-to-br from-purple-900/60 to-purple-800/60 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h3 className="text-white font-bold text-xl" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
              Daily Challenge
            </h3>
          </div>
          <p className="text-white/70 text-sm mb-4">
            Guess 10 random flags to complete today's challenge.
          </p>
          <div className="flex items-center justify-between">
            <div className="text-white/50 text-sm">
              {dailyChallengeCompleted ? '✓ Completed' : '0/10 Flags'}
            </div>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full"
              disabled={dailyChallengeCompleted}
            >
              <Play className="w-4 h-4 mr-2" />
              PLAY
            </Button>
          </div>
        </div>

        {/* Daily Streak */}
        <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-sm rounded-3xl p-5 shadow-2xl border border-orange-500/20 hover:border-orange-400/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-3 rounded-full">
                <Flame className="w-7 h-7 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
                  Daily Streak
                </h3>
                <p className="text-orange-300 font-bold text-2xl">
                  {dailyStreak} {dailyStreak === 1 ? 'Day' : 'Days'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
