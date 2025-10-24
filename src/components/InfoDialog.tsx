import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Info, Globe, Code, Shield, Mail } from 'lucide-react';

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InfoDialog = ({ open, onOpenChange }: InfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Info className="h-6 w-6" />
            Über FlagQuiz
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Was ist FlagQuiz?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    FlagQuiz ist eine interaktive Quiz-Plattform, auf der du dein Wissen über Länder,
                    Flaggen, Hauptstädte und geografische Fakten testen kannst. Spiele alleine oder
                    fordere andere Spieler im Multiplayer-Modus heraus!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Code className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Features</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Verschiedene Quiz-Modi: Zeitlimit, Streak, Kontinente und mehr</li>
                    <li>Multiplayer-Spiele in Echtzeit</li>
                    <li>Rangsystem mit XP und Leveln</li>
                    <li>Clans und Freundeslisten</li>
                    <li>Globale und regionale Bestenlisten</li>
                    <li>Tägliche Herausforderungen</li>
                    <li>Mehrsprachige Unterstützung</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Datenschutz & Sicherheit</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Deine Daten sind bei uns sicher. Wir verwenden moderne Verschlüsselung und
                    speichern nur die notwendigsten Informationen. Deine Privatsphäre ist uns wichtig.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Kontakt & Support</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    Hast du Fragen, Feedback oder technische Probleme? Wir helfen dir gerne weiter!
                  </p>
                  <div className="space-y-1 text-sm">
                    <p><strong>Version:</strong> 1.0.0</p>
                    <p><strong>Letztes Update:</strong> Oktober 2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center pt-4 pb-2">
            <p className="text-sm text-muted-foreground">
              © 2025 FlagQuiz. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;
