import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy } from 'lucide-react';
import Leaderboard from '@/components/Leaderboard';

const LeaderboardButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Trophy className="h-4 w-4" />
          <span className="ml-2 hidden md:inline">Bestenliste</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bestenlisten</DialogTitle>
        </DialogHeader>
        <Leaderboard />
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardButton;