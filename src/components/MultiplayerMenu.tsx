import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Users, ArrowLeft } from 'lucide-react';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/AuthForm';

interface MultiplayerMenuProps {
  onMatchJoined: () => void;
  onBackToMain: () => void;
}

export default function MultiplayerMenu({ onMatchJoined, onBackToMain }: MultiplayerMenuProps) {
  const { createMatch, joinMatch } = useMultiplayer();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleCreateMatch = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    setIsCreating(true);
    try {
      const match = await createMatch(10); // Default 10 seconds
      if (match) {
        onMatchJoined();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMatch = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    if (!roomCode.trim()) return;
    
    setIsJoining(true);
    try {
      const success = await joinMatch(roomCode.trim());
      if (success) {
        onMatchJoined();
      }
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBackToMain}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          <div className="flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Multiplayer</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Party */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center">
                <Plus className="w-5 h-5" />
                Party erstellen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Erstelle eine neue Party und lade Freunde ein
              </p>
              <Button 
                onClick={handleCreateMatch} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? 'Erstelle Party...' : 'Party erstellen'}
              </Button>
            </CardContent>
          </Card>

          {/* Join Party */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center">
                <Users className="w-5 h-5" />
                Party beitreten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Tritt einer bestehenden Party bei
              </p>
              {!showJoinInput ? (
                <Button 
                  onClick={() => setShowJoinInput(true)}
                  className="w-full"
                  variant="outline"
                >
                  Beitreten
                </Button>
              ) : (
                <div className="space-y-3">
                  <input
                    placeholder="Raumcode eingeben (z.B. AB12)"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={4}
                    className="w-full p-2 text-center text-lg font-mono tracking-wider border rounded"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowJoinInput(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Abbrechen
                    </Button>
                    <Button 
                      onClick={handleJoinMatch}
                      disabled={!roomCode.trim() || isJoining}
                      className="flex-1"
                    >
                      {isJoining ? 'Beitrete...' : 'Beitreten'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Auth Dialog */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Anmeldung erforderlich</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Du musst angemeldet sein, um Multiplayer-Spiele zu spielen.
              </p>
              <AuthForm onSuccess={() => setShowAuthDialog(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}