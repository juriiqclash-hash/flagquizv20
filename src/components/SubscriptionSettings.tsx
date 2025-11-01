import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { SubscriptionManager } from './SubscriptionManager';

interface SubscriptionSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscriptionSettings = ({ open, onOpenChange }: SubscriptionSettingsProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Abonnement verwalten</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <SubscriptionManager />
        </div>
      </DialogContent>
    </Dialog>
  );
};
