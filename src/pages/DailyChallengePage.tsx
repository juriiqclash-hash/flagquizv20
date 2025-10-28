import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DailyChallengePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Hauptmenü
        </Button>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Calendar className="h-10 w-10" />
            Tägliche Herausforderung
          </h1>
          <p className="text-white/80">Komme jeden Tag zurück für eine neue Herausforderung!</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-400" />
              Heute's Challenge
            </CardTitle>
            <CardDescription className="text-white/70">
              Vervollständige die tägliche Herausforderung und verdiene Bonus-XP!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-white/60 mb-4">Die tägliche Herausforderung wird bald verfügbar sein.</p>
              <Button onClick={() => navigate('/quizmenu')} className="bg-violet-600 hover:bg-violet-700">
                Zum Quiz-Menü
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
