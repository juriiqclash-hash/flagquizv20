import { ShieldAlert, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BannedScreenProps {
  banReason?: string;
  bannedAt?: string;
  onBack?: () => void;
}

export default function BannedScreen({ banReason, bannedAt, onBack }: BannedScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500/10 via-background to-red-500/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-200 dark:border-red-900 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
            Account gesperrt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">
              Dein Account wurde vom Administrator gesperrt und du kannst momentan nicht auf das Quiz zugreifen.
            </p>
            
            {banReason && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                  Grund:
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {banReason}
                </p>
              </div>
            )}

            {bannedAt && (
              <p className="text-xs text-muted-foreground">
                Gesperrt am: {new Date(bannedAt).toLocaleDateString('de-DE', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Bei Fragen kontaktiere den Administrator</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Wenn du denkst, dass dies ein Fehler ist, wende dich bitte an den Support.
                  </p>
                </div>
              </div>
            </div>

            {onBack && (
              <Button 
                onClick={onBack} 
                variant="outline" 
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
