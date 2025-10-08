import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Loader2, Languages } from "lucide-react";
import ProfileButton from "@/components/ProfileButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/data/translations";
import FlagQuizLogo from "@/components/FlagQuizLogo";

interface MainMenuProps {
  onStart: () => void;
}

export default function MainMenu({ onStart }: MainMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = useTranslation(language);

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
