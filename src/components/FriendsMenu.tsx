import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Users } from 'lucide-react';

interface FriendsMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileSelect?: (userId: string) => void;
}

export const FriendsMenu = ({ open, onOpenChange }: FriendsMenuProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-6 h-6" />
            Freunde
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Bald verfügbar</h3>
          <p className="text-muted-foreground text-sm">
            Das Freunde-System wird bald verfügbar sein
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
