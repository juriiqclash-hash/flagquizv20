import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import StartScreen from '@/components/StartScreen';

export default function QuizMenuPage() {
  const navigate = useNavigate();

  const handleStartQuiz = (mode: string, continent?: string, timeLimit?: number, difficulty?: string) => {
    // Navigate to specific quiz with params
    const params = new URLSearchParams();
    if (continent) params.set('continent', continent);
    if (timeLimit) params.set('time', timeLimit.toString());
    if (difficulty) params.set('difficulty', difficulty);
    navigate(`/quizmenu/${mode}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Hauptmenü
        </Button>
        <StartScreen 
          onStartQuiz={handleStartQuiz} 
          onStartMultiplayer={() => navigate('/multiplayer')}
          currentView="start"
          onBackToMainMenu={() => navigate('/')} 
        />
      </div>
    </div>
  );
}
