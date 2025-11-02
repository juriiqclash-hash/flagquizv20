import { ShieldAlert, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface BannedScreenProps {
  banReason?: string;
  bannedAt?: string;
  onBack?: () => void;
}

export default function BannedScreen({ banReason, bannedAt, onBack }: BannedScreenProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500/10 via-background to-red-500/5 flex items-center justify-center p-4 relative">
      <div className="absolute top-6 right-6">
        <Button onClick={handleLogout} variant="outline" size="lg" className="gap-2">
          <LogOut className="h-5 w-5" />
          Ausloggen
        </Button>
      </div>

      <Card className="max-w-2xl w-full border-red-200 dark:border-red-900 shadow-2xl">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="mx-auto w-32 h-32 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-20 h-20 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-4xl font-bold text-red-600 dark:text-red-400">
            Account gesperrt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pb-8">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              Dein Account wurde vom Administrator gesperrt und du kannst momentan nicht auf das Quiz zugreifen.
            </p>
            
            {banReason && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-6">
                <p className="text-base font-semibold text-red-800 dark:text-red-300 mb-2">
                  Grund der Sperrung:
                </p>
                <p className="text-base text-red-700 dark:text-red-400">
                  {banReason}
                </p>
              </div>
            )}

            {bannedAt && (
              <p className="text-sm text-muted-foreground">
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

          <div className="space-y-4">
            <div className="bg-primary/5 rounded-lg p-6 space-y-2">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-base font-semibold mb-2">Bei Fragen kontaktiere den Administrator</p>
                  <p className="text-sm text-muted-foreground">
                    Wenn du denkst, dass dies ein Fehler ist, wende dich bitte an den Support unter <span className="font-medium">support@flagquiz.ch</span>
                  </p>
                </div>
              </div>
            </div>

            {onBack && (
              <Button 
                onClick={onBack} 
                variant="outline" 
                size="lg"
                className="w-full"
              >
                Zurück
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
