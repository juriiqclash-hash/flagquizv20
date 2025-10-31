import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { SubscriptionManager } from './SubscriptionManager';

interface SubscriptionSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscriptionSettings = ({ open, onOpenChange }: SubscriptionSettingsProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Abonnement verwalten</DialogTitle>
        </DialogHeader>
        <SubscriptionManager />
      </DialogContent>
    </Dialog>
  );
};
