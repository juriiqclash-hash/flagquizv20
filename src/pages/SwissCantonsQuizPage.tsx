import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Flag, List } from 'lucide-react';
import SwissCantonsFlagQuiz from '@/components/SwissCantonsFlagQuiz';
import SwissCantonsNameQuiz from '@/components/SwissCantonsNameQuiz';

type QuizMode = 'flag-quiz' | 'name-quiz' | null;
type FlagQuizOrder = 'alphabetical' | 'random';

export default function SwissCantonsQuizPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMode, setSelectedMode] = useState<QuizMode>(null);
  const [flagQuizOrder, setFlagQuizOrder] = useState<FlagQuizOrder>('alphabetical');
  const [showOrderSelection, setShowOrderSelection] = useState(false);

  const handleSelectMode = (mode: QuizMode) => {
    if (mode === 'flag-quiz') {
      setShowOrderSelection(true);
    } else {
      setSelectedMode(mode);
    }
  };

  const handleSelectOrder = (order: FlagQuizOrder) => {
    setFlagQuizOrder(order);
    setSelectedMode('flag-quiz');
    setShowOrderSelection(false);
  };

  const handleBack = () => {
    if (selectedMode) {
      setSelectedMode(null);
      setShowOrderSelection(false);
    } else {
      navigate('/quizmenu');
    }
  };

  if (selectedMode === 'flag-quiz') {
    return <SwissCantonsFlagQuiz onBack={handleBack} order={flagQuizOrder} />;
  }

  if (selectedMode === 'name-quiz') {
    return <SwissCantonsNameQuiz onBack={handleBack} />;
  }

  if (showOrderSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Button
            variant="ghost"
            onClick={() => setShowOrderSelection(false)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>

          <Card className="border-2 border-red-500">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Wähle die Reihenfolge
              </h2>
              
              <div className="space-y-4">
                <Button
                  onClick={() => handleSelectOrder('alphabetical')}
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
                >
                  A–Z (Alphabetisch)
                </Button>
                
                <Button
                  onClick={() => handleSelectOrder('random')}
                  size="lg"
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-50 text-lg py-6"
                >
                  Zufällig
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zum Hauptmenü
        </Button>

        <Card className="border-2 border-red-500">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🇨🇭</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Schweiz Kantone Quiz
              </h1>
              <p className="text-muted-foreground">
                Teste dein Wissen über die 26 Schweizer Kantone
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => handleSelectMode('flag-quiz')}
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 text-lg py-6 flex items-center justify-center gap-3"
              >
                <Flag className="w-6 h-6" />
                Kantonsflaggen-Quiz
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Errate die Flagge des angezeigten Kantons
              </div>

              <Button
                onClick={() => handleSelectMode('name-quiz')}
                size="lg"
                variant="outline"
                className="w-full border-red-600 text-red-600 hover:bg-red-50 text-lg py-6 flex items-center justify-center gap-3"
              >
                <List className="w-6 h-6" />
                Kantone-nennen-Quiz
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Nenne alle 26 Kantone der Schweiz
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
