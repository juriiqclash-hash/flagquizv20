import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Leaderboard from '@/components/Leaderboard';
import MainMenu from '@/components/MainMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      navigate('/');
    }
    setOpen(newOpen);
  };

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <>
      <MainMenu
        onStart={() => navigate('/quiz')}
        onMultiplayerStart={() => navigate('/multiplayer')}
        onStartQuiz={() => {}}
      />
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-50"
            onClick={() => handleOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="p-6 overflow-y-auto max-h-[90vh]">
            <Leaderboard />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
