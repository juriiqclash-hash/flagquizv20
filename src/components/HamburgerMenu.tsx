import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Trophy, Users, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/data/translations';

interface HamburgerMenuProps {
  onNavigate: (view: 'home' | 'leaderboard' | 'friends' | 'clans') => void;
  currentView?: string;
}

export default function HamburgerMenu({ onNavigate, currentView }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const t = useTranslation(language);

  const handleNavigation = (view: 'home' | 'leaderboard' | 'friends' | 'clans') => {
    onNavigate(view);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col gap-4 mt-8">
          <Button
            variant={currentView === 'home' ? 'default' : 'outline'}
            className="w-full justify-start text-lg h-14"
            onClick={() => handleNavigation('home')}
          >
            <Home className="mr-3 h-5 w-5" />
            Home
          </Button>

          <Button
            variant={currentView === 'leaderboard' ? 'default' : 'outline'}
            className="w-full justify-start text-lg h-14"
            onClick={() => handleNavigation('leaderboard')}
          >
            <Trophy className="mr-3 h-5 w-5" />
            {t.leaderboard || 'Bestenliste'}
          </Button>

          <Button
            variant={currentView === 'friends' ? 'default' : 'outline'}
            className="w-full justify-start text-lg h-14"
            onClick={() => handleNavigation('friends')}
          >
            <Users className="mr-3 h-5 w-5" />
            {t.friends || 'Freunde'}
          </Button>

          <Button
            variant={currentView === 'clans' ? 'default' : 'outline'}
            className="w-full justify-start text-lg h-14"
            onClick={() => handleNavigation('clans')}
          >
            <Shield className="mr-3 h-5 w-5" />
            {t.clans || 'Clans'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
