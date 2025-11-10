import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InfoDialog = ({ open, onOpenChange }: InfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <img src="/logo.svg" alt="FlagQuiz Logo" className="h-20 w-auto" />
          </div>

          {/* Über FlagQuiz.ch */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Über FlagQuiz.ch</h2>
            
            <div className="space-y-3 text-center">
              <p className="text-muted-foreground leading-relaxed">
                FlagQuiz.ch ist ein Lernspiel für alle, die Flaggen lieben!
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ziel ist es, spielerisch das Wissen über Länder und ihre Flaggen zu erweitern – von Europa bis Ozeanien.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Egal ob für die Schule, für Geografie-Fans oder einfach zum Zeitvertreib: Hier kannst du dein Wissen testen und verbessern.
              </p>
              <p className="text-muted-foreground leading-relaxed font-medium mt-4">
                Entwickelt in der Schweiz 🇨🇭, mit Freude an Geografie und Design.
              </p>
            </div>
          </div>

          <Separator />

          {/* Support */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-center">Support</h3>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">E-Mail:</span>
              <a href="mailto:flagquiz.support@gmail.com" className="text-primary hover:underline">
                flagquiz.support@gmail.com
              </a>
            </div>
          </div>

          <Separator />

          {/* Copyright & Version */}
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              © 2025 FlagQuiz. Alle Rechte vorbehalten.
            </p>
            <p className="text-xs text-muted-foreground">
              Version 1.8.4 • Letztes Update: November 2025
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;
