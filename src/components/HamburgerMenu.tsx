import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Trophy, Users, Shield, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Leaderboard from '@/components/Leaderboard';
import { Card, CardContent } from '@/components/ui/card';
import { ClanMenu } from '@/components/ClanMenu';

interface HamburgerMenuProps {
  onNavigateHome: () => void;
  onNavigateQuiz: () => void;
  currentPage?: 'home' | 'quiz';
}

const HamburgerMenu = ({ onNavigateHome, onNavigateQuiz, currentPage = 'quiz' }: HamburgerMenuProps) => {
  const [open, setOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [friendsDialogOpen, setFriendsDialogOpen] = useState(false);
  const [clansDialogOpen, setClansDialogOpen] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  const handleNavigateHome = () => {
    setOpen(false);
    onNavigateHome();
  };

  const handleNavigateQuiz = () => {
    setOpen(false);
    setIsLoadingQuiz(true);
    const random = Math.random() * Math.random();
    const randomDelay = Math.floor(random * 1200) + 300;
    setTimeout(() => {
      setIsLoadingQuiz(false);
      onNavigateQuiz();
    }, randomDelay);
  };

  const handleOpenLeaderboard = () => {
    setOpen(false);
    setLeaderboardOpen(true);
  };

  const handleOpenFriends = () => {
    setOpen(false);
    setFriendsDialogOpen(true);
  };

  const handleOpenClans = () => {
    setOpen(false);
    setClansDialogOpen(true);
  };

  return (
    <>
      {isLoadingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
            <p className="text-2xl font-semibold">Lade Quiz...</p>
          </div>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Menü</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button
              variant={currentPage === 'home' ? 'default' : 'outline'}
              className="w-full justify-start text-lg h-14"
              onClick={handleNavigateHome}
            >
              <Home className="h-5 w-5 mr-3" />
              Hauptmenü
            </Button>

            <Button
              variant={currentPage === 'quiz' ? 'default' : 'outline'}
              className="w-full justify-start text-lg h-14"
              onClick={handleNavigateQuiz}
              disabled={isLoadingQuiz}
            >
              <Trophy className="h-5 w-5 mr-3" />
              Quiz
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-lg h-14"
              onClick={handleOpenLeaderboard}
            >
              <Trophy className="h-5 w-5 mr-3" />
              Bestenliste
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-lg h-14"
              onClick={handleOpenFriends}
            >
              <Users className="h-5 w-5 mr-3" />
              Freunde
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-lg h-14"
              onClick={handleOpenClans}
            >
              <Shield className="h-5 w-5 mr-3" />
              Clans
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={leaderboardOpen} onOpenChange={setLeaderboardOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bestenlisten</DialogTitle>
          </DialogHeader>
          <Leaderboard />
        </DialogContent>
      </Dialog>

      <Dialog open={friendsDialogOpen} onOpenChange={setFriendsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Freunde</DialogTitle>
          </DialogHeader>
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Bald verfügbar!</h3>
              <p className="text-muted-foreground">
                Die Freunde-Funktion wird in Kürze verfügbar sein. Hier kannst du bald Freunde hinzufügen und ihre Fortschritte sehen.
              </p>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <ClanMenu
        open={clansDialogOpen}
        onClose={() => setClansDialogOpen(false)}
      />
    </>
  );
};

export default HamburgerMenu;
