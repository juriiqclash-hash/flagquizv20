import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function MultiplayerPage() {
  const navigate = useNavigate();
  const { roomCode } = useParams<{ roomCode: string }>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 p-4 flex items-center justify-center">
      <div className="max-w-7xl mx-auto text-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Hauptmenü
        </Button>
        <h1 className="text-4xl font-bold text-white mb-4">Multiplayer</h1>
        {roomCode ? (
          <p className="text-white/80">Raum: {roomCode}</p>
        ) : (
          <p className="text-white/80">Starte ein Multiplayer-Spiel im Hauptmenü</p>
        )}
      </div>
    </div>
  );
}
