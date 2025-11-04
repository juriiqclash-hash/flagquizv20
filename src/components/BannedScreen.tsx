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
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-red-950 via-red-900 to-red-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.15),transparent_50%)] animate-pulse" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(220,38,38,0.05)_50%,transparent_75%)]" />
      
      {/* Logout button */}
      <div className="absolute top-6 right-6 z-20">
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          size="lg" 
          className="gap-2 bg-red-950/80 border-red-700 text-red-100 hover:bg-red-900 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Ausloggen
        </Button>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-3xl w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 blur-3xl opacity-50 animate-pulse" />
            <div className="relative w-40 h-40 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-red-500/30">
              <ShieldAlert className="w-24 h-24 text-white drop-shadow-2xl animate-pulse" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-6xl font-black text-white drop-shadow-2xl tracking-tight">
            Account gesperrt
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto" />
        </div>

        {/* Description */}
        <p className="text-xl text-red-100 max-w-2xl mx-auto leading-relaxed font-medium">
          Dein Account wurde vom Administrator gesperrt und du kannst momentan nicht auf das Quiz zugreifen.
        </p>

        {/* Ban reason */}
        {banReason && (
          <div className="bg-red-950/50 backdrop-blur-sm border-2 border-red-700/50 rounded-2xl p-8 shadow-2xl mx-auto max-w-2xl">
            <p className="text-lg font-bold text-red-300 mb-3 uppercase tracking-wider">
              Grund der Sperrung
            </p>
            <p className="text-xl text-white font-semibold leading-relaxed">
              {banReason}
            </p>
          </div>
        )}

        {/* Ban date */}
        {bannedAt && (
          <p className="text-base text-red-300/80 font-medium">
            Gesperrt am: {new Date(bannedAt).toLocaleDateString('de-DE', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}

        {/* Contact info */}
        <div className="bg-red-950/40 backdrop-blur-sm border-2 border-red-800/30 rounded-2xl p-8 shadow-xl mx-auto max-w-2xl">
          <div className="flex items-start gap-5 text-left">
            <div className="flex-shrink-0 w-14 h-14 bg-red-800/50 rounded-full flex items-center justify-center">
              <Mail className="w-7 h-7 text-red-200" />
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold text-white mb-2">
                Bei Fragen kontaktiere den Administrator
              </p>
              <p className="text-base text-red-200/90 leading-relaxed">
                Wenn du denkst, dass dies ein Fehler ist, wende dich bitte an den Support unter{' '}
                <span className="font-bold text-white bg-red-800/40 px-2 py-1 rounded">
                  support@flagquiz.ch
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Back button */}
        {onBack && (
          <Button 
            onClick={onBack} 
            variant="outline" 
            size="lg"
            className="mt-8 bg-red-900/50 border-red-700 text-red-100 hover:bg-red-800 hover:text-white text-lg px-8 py-6"
          >
            Zurück
          </Button>
        )}
      </div>
    </div>
  );
}
