import { useState, useEffect } from "react";
import MainMenu from "@/components/MainMenu";
import StartScreen from "@/components/StartScreen";
import QuizGame from "@/components/QuizGame";
import CombiQuiz from "@/components/CombiQuiz";
import MultiplayerMenu from "@/components/MultiplayerMenu";
import MultiplayerLobby from "@/components/MultiplayerLobby";
import MultiplayerGame from "@/components/MultiplayerGame";
import MultiplayerContinentGame from "@/components/MultiplayerContinentGame";
import MultiplayerCountdown from "@/components/MultiplayerCountdown";
import ProfileButton from "@/components/ProfileButton";
import DifficultySelector from "@/components/DifficultySelector";
import WorldKnowledgeQuiz from "@/components/WorldKnowledgeQuiz";
import AdminPanel from "@/components/AdminPanel";
import { AuthProvider } from "@/hooks/useAuth";
import { DifficultyLevel } from "@/data/worldKnowledge";

function IndexContent() {
  const [currentView, setCurrentView] = useState<'main-menu' | 'start' | 'quiz' | 'combi-quiz' | 'multiplayer-menu' | 'multiplayer-lobby' | 'multiplayer-countdown' | 'multiplayer-game' | 'multiplayer-continent-game' | 'world-knowledge-difficulty' | 'world-knowledge-quiz' | 'admin'>('main-menu');
  const [gameMode, setGameMode] = useState<'learn' | 'timed' | 'streak' | 'continent' | 'speedrush' | 'capital-to-country' | 'country-to-capital' | 'emoji' | 'highest-mountain' | 'official-language' | 'world-knowledge'>('learn');
  const [selectedContinent, setSelectedContinent] = useState<string>();
  const [timeLimit, setTimeLimit] = useState<number>();
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('easy');
  const [multiplayerGameMode, setMultiplayerGameMode] = useState<string>('flags');

  const handleStartQuiz = (
    mode: 'learn' | 'timed' | 'streak' | 'continent' | 'speedrush' | 'capital-to-country' | 'country-to-capital' | 'emoji' | 'highest-mountain' | 'official-language' | 'world-knowledge',
    continent?: string,
    timeLimitValue?: number
  ) => {
    setGameMode(mode);
    setSelectedContinent(continent);
    setTimeLimit(timeLimitValue);

    if (mode === 'world-knowledge') {
      setCurrentView('world-knowledge-difficulty');
    } else {
      setCurrentView('quiz');
    }
  };

  const handleStartMultiplayer = () => {
    setCurrentView('multiplayer-menu');
  };

  const handleMultiplayerMatchJoined = () => {
    setCurrentView('multiplayer-lobby');
  };

  const handleMultiplayerCountdown = () => {
    setCurrentView('multiplayer-countdown');
  };

  const handleMultiplayerGameStart = () => {
    // Check game mode from lobby to decide which game component to show
    setCurrentView(multiplayerGameMode === 'continents' ? 'multiplayer-continent-game' : 'multiplayer-game');
  };

  const handleMainMenuStart = () => {
    setCurrentView('start');
  };

  const handleBackToStart = () => {
    setCurrentView('start');
  };

  const handleBackToMainMenu = () => {
    setCurrentView('main-menu');
  };

  const handleBackToMultiplayerMenu = () => {
    setCurrentView('multiplayer-menu');
  };

  const handleBackToMultiplayerLobby = () => {
    setCurrentView('multiplayer-lobby');
  };

  const handleSelectDifficulty = (difficulty: DifficultyLevel) => {
    setSelectedDifficulty(difficulty);
    setCurrentView('world-knowledge-quiz');
  };

  const handleBackToWorldKnowledgeDifficulty = () => {
    setCurrentView('world-knowledge-difficulty');
  };

  const handleOpenAdminPanel = () => {
    setCurrentView('admin');
  };

  const handleBackFromAdmin = () => {
    setCurrentView('start');
  };

  return (
    <>
      {currentView === 'main-menu' ? (
        <MainMenu onStart={handleMainMenuStart} onMultiplayerClick={handleStartMultiplayer} />
      ) : currentView === 'start' ? (
        <StartScreen onStartQuiz={handleStartQuiz} onStartMultiplayer={handleStartMultiplayer} currentView={currentView} onOpenAdminPanel={handleOpenAdminPanel} onBackToMainMenu={handleBackToMainMenu} />
      ) : currentView === 'admin' ? (
        <AdminPanel onBack={handleBackFromAdmin} />
      ) : currentView === 'quiz' ? (
        <QuizGame 
          mode={gameMode} 
          onBackToStart={handleBackToStart}
          continent={selectedContinent}
          timeLimit={timeLimit}
        />
      ) : currentView === 'multiplayer-menu' ? (
        <MultiplayerMenu 
          onMatchJoined={handleMultiplayerMatchJoined}
          onBackToMain={handleBackToStart}
        />
      ) : currentView === 'multiplayer-lobby' ? (
        <MultiplayerLobby 
          onStartGame={handleMultiplayerGameStart}
          onBackToMenu={handleBackToMultiplayerMenu}
          onStartCountdown={handleMultiplayerCountdown}
          onGameModeChange={setMultiplayerGameMode}
        />
      ) : currentView === 'multiplayer-countdown' ? (
        <MultiplayerCountdown onCountdownEnd={handleMultiplayerGameStart} />
      ) : currentView === 'multiplayer-game' ? (
        <MultiplayerGame 
          onBackToLobby={handleBackToMultiplayerLobby}
          onBackToMenu={handleBackToStart}
        />
      ) : currentView === 'multiplayer-continent-game' ? (
        <MultiplayerContinentGame 
          onBackToLobby={handleBackToMultiplayerLobby}
          onBackToMenu={handleBackToStart}
        />
      ) : currentView === 'world-knowledge-difficulty' ? (
        <DifficultySelector
          onSelectDifficulty={handleSelectDifficulty}
          onBack={handleBackToStart}
        />
      ) : currentView === 'world-knowledge-quiz' ? (
        <WorldKnowledgeQuiz
          difficulty={selectedDifficulty}
          onBack={handleBackToWorldKnowledgeDifficulty}
        />
      ) : null}
    </>
  );
}

export default function Index() {
  return (
    <AuthProvider>
      <IndexContent />
    </AuthProvider>
  );
}