import { useNavigate } from 'react-router-dom';
import StartScreen from '@/components/StartScreen';

export default function QuizMenuPage() {
  const navigate = useNavigate();

  const handleStartQuiz = (mode: string, continent?: string, timeLimit?: number, difficulty?: string) => {
    const params = new URLSearchParams();
    if (continent) params.set('continent', continent);
    if (timeLimit) params.set('time', timeLimit.toString());
    if (difficulty) params.set('difficulty', difficulty);
    navigate(`/quizmenu/${mode}?${params.toString()}`);
  };

  return (
    <StartScreen 
      onStartQuiz={handleStartQuiz} 
      onStartMultiplayer={() => navigate('/multiplayer')}
      currentView="start"
      onBackToMainMenu={() => navigate('/')} 
    />
  );
}
