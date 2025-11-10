import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import StartScreen from '@/components/StartScreen';

export default function QuizMenuPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [shouldOpenProfile, setShouldOpenProfile] = useState(false);

  useEffect(() => {
    const openProfile = searchParams.get('openProfile');
    if (openProfile === 'true') {
      setShouldOpenProfile(true);
      // Remove the openProfile parameter from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('openProfile');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleStartQuiz = (mode: string, continent?: string, timeLimit?: number, difficulty?: string) => {
    if (mode === 'map-quiz') {
      navigate('/quizmenu/map-quiz');
      return;
    }

    const params = new URLSearchParams();
    if (continent) params.set('continent', continent);
    if (timeLimit) params.set('time', timeLimit.toString());
    if (difficulty) params.set('difficulty', difficulty);
    navigate(`/quizmenu/${mode}?${params.toString()}`);
  };

  const handleProfileOpened = () => {
    setShouldOpenProfile(false);
  };

  return (
    <StartScreen 
      onStartQuiz={handleStartQuiz} 
      onStartMultiplayer={() => navigate('/multiplayer')}
      currentView="start"
      onBackToMainMenu={() => navigate('/')}
      shouldOpenProfile={shouldOpenProfile}
      onProfileOpened={handleProfileOpened}
    />
  );
}
