import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MultiplayerMenu from '@/components/MultiplayerMenu';
import MultiplayerLobby from '@/components/MultiplayerLobby';
import MultiplayerGame from '@/components/MultiplayerGame';
import MultiplayerContinentGame from '@/components/MultiplayerContinentGame';
import MultiplayerCountdown from '@/components/MultiplayerCountdown';

export default function MultiplayerPage() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'menu' | 'lobby' | 'countdown' | 'game' | 'continent-game'>('menu');
  const [multiplayerGameMode, setMultiplayerGameMode] = useState<string>('flags');

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
        onBackToMenu={() => setCurrentView('menu')}
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
        onBackToMenu={() => navigate('/quizmenu')}
      />
    );
  }

  if (currentView === 'continent-game') {
    return (
      <MultiplayerContinentGame
        onBackToLobby={() => setCurrentView('lobby')}
        onBackToMenu={() => navigate('/quizmenu')}
      />
    );
  }

  return null;
}
