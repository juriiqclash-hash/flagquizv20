import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Leaderboard from '@/components/Leaderboard';
import MainMenu from '@/components/MainMenu';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
          <div className="p-6 overflow-y-auto max-h-[90vh]">
            <Leaderboard />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
