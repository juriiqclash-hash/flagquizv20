import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Languages, Trophy, Users, Shield, Settings, Info, Menu, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import FlagQuizLogo from "@/components/FlagQuizLogo";
import ProfileButton from "@/components/ProfileButton";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [displayPath, setDisplayPath] = useState(location.pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const isMobile = useIsMobile();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    setDisplayPath(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900">
      {/* Top Bar - Same as MainMenu */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Side */}
            <div className="flex items-center gap-3">
              {isMobile ? (
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
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

                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/20 rounded-lg h-12" onClick={() => {
                        navigate('/friends');
                        setMobileMenuOpen(false);
                      }}>
                        <Users className="h-5 w-5 mr-3" />
                        Freunde
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
                        navigate('/');
                        setMobileMenuOpen(false);
                      }}>
                        <Home className="h-5 w-5 mr-3" />
                        Hauptmenü
                      </Button>

                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/20 rounded-lg h-12" onClick={() => {
                        setMobileMenuOpen(false);
                      }}>
                        <Settings className="h-5 w-5 mr-3" />
                        Einstellungen
                      </Button>

                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/20 rounded-lg h-12" onClick={() => {
                        setMobileMenuOpen(false);
                      }}>
                        <Info className="h-5 w-5 mr-3" />
                        Info
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <>
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

                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-lg" onClick={() => navigate('/friends')}>
                    <Users className="h-5 w-5" />
                  </Button>

                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-lg" onClick={() => navigate('/clans')}>
                    <Shield className="h-5 w-5" />
                  </Button>

                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-lg">
                    <Settings className="h-5 w-5" />
                  </Button>

                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-lg">
                    <Info className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Right Side - Search and Profile */}
            <div className="flex gap-2 items-center">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-lg">
                <Search className="h-6 w-6" strokeWidth={3} />
              </Button>
              <ProfileButton />
            </div>
          </div>
        </div>
      </header>

      {/* 404 Content */}
      <div className="flex flex-col items-center justify-center px-4 py-20 md:py-32">
        {/* Giant 404 */}
        <h1 
          className="text-[150px] md:text-[250px] lg:text-[300px] font-black text-white leading-none mb-8"
          style={{ fontFamily: '"VAG Rounded", sans-serif' }}
        >
          404
        </h1>

        {/* Error Message */}
        <p className="text-white text-xl md:text-2xl mb-12 text-center" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
          Die Seite <span className="font-bold text-yellow-400">{displayPath}</span> existiert nicht
        </p>

        {/* Back to Main Menu Button */}
        <Button
          onClick={() => navigate("/")}
          size="lg"
          className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold text-lg px-8 py-6 rounded-full transition-all duration-300 shadow-lg"
          style={{ fontFamily: '"VAG Rounded", sans-serif' }}
        >
          <Home className="mr-2 h-6 w-6" />
          Zurück zu Hauptmenü
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
