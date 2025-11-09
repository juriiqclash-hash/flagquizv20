import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MultiplayerMenu from '@/components/MultiplayerMenu';
import MultiplayerLobby from '@/components/MultiplayerLobby';
import MultiplayerGame from '@/components/MultiplayerGame';
import MultiplayerContinentGame from '@/components/MultiplayerContinentGame';
import MultiplayerCountdown from '@/components/MultiplayerCountdown';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useAuth } from '@/hooks/useAuth';

export default function MultiplayerPage() {
  const navigate = useNavigate();
  const { roomCode } = useParams<{ roomCode: string }>();
  const { user } = useAuth();
  const { joinMatch } = useMultiplayer();
  const [currentView, setCurrentView] = useState<'menu' | 'lobby' | 'countdown' | 'game' | 'continent-game'>('menu');
  const [multiplayerGameMode, setMultiplayerGameMode] = useState<string>('flags');
  const [isAutoJoining, setIsAutoJoining] = useState(false);

  useEffect(() => {
    const autoJoinLobby = async () => {
      if (roomCode && user && !isAutoJoining) {
        setIsAutoJoining(true);
        try {
          const cleanRoomCode = roomCode.toUpperCase().trim();
          const success = await joinMatch(cleanRoomCode);
          if (success) {
            setCurrentView('lobby');
          } else {
            navigate('/multiplayer');
          }
        } catch (error) {
          console.error('Error auto-joining lobby:', error);
          navigate('/multiplayer');
        } finally {
          setIsAutoJoining(false);
        }
      } else if (roomCode && !user) {
        navigate(`/login?redirect=/multiplayer/lobby/${roomCode}`);
      }
    };

    autoJoinLobby();
  }, [roomCode, user, isAutoJoining]);

  if (isAutoJoining) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">
            Lobby wird beigetreten...
          </p>
        </div>
      </div>
    );
  }

  if (currentView === 'menu') {
    return (
      <MultiplayerMenu
        onMatchJoined={() => setCurrentView('lobby')}
        onBackToMain={() => navigate('/quizmenu')}
      />
    );
  }

  if (currentView === 'lobby') {
    return (
      <MultiplayerLobby
        onStartGame={() => setCurrentView(multiplayerGameMode === 'continents' ? 'continent-game' : 'game')}
        onBackToMenu={() => {
          setCurrentView('menu');
          navigate('/multiplayer');
        }}
        onStartCountdown={() => setCurrentView('countdown')}
        onGameModeChange={setMultiplayerGameMode}
      />
    );
  }

  if (currentView === 'countdown') {
    return (
      <MultiplayerCountdown
        onCountdownEnd={() => setCurrentView(multiplayerGameMode === 'continents' ? 'continent-game' : 'game')}
      />
    );
  }

  if (currentView === 'game') {
    return (
      <MultiplayerGame
        onBackToLobby={() => setCurrentView('lobby')}
        onBackToMenu={() => {
          setCurrentView('menu');
          navigate('/multiplayer');
        }}
      />
    );
  }

  if (currentView === 'continent-game') {
    return (
      <MultiplayerContinentGame
        onBackToLobby={() => setCurrentView('lobby')}
        onBackToMenu={() => {
          setCurrentView('menu');
          navigate('/multiplayer');
        }}
      />
    );
  }

  return null;
}
