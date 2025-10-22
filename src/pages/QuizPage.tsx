import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function QuizPage() {
  const navigate = useNavigate();

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
        <h1 className="text-4xl font-bold text-white mb-4">Quiz-Modus</h1>
        <p className="text-white/80">Wähle im Hauptmenü einen Quiz-Modus aus</p>
      </div>
    </div>
  );
}
