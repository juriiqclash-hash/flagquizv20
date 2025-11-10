import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, X } from 'lucide-react';
import { swissCantonsData, SwissCanton } from '@/data/swissCantonsData';

interface SwissCantonsFlagQuizProps {
  onBack: () => void;
  order: 'alphabetical' | 'random';
}

export default function SwissCantonsFlagQuiz({ onBack, order }: SwissCantonsFlagQuizProps) {
  const [cantons, setCantons] = useState<SwissCanton[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const sortedCantons = order === 'alphabetical' 
      ? [...swissCantonsData].sort((a, b) => a.name.localeCompare(b.name, 'de'))
      : [...swissCantonsData].sort(() => Math.random() - 0.5);
    setCantons(sortedCantons);
  }, [order]);

  const currentCanton = cantons[currentIndex];

  if (cantons.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Lade Kantone...</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || !currentCanton) return;

    const isAnswerCorrect = userAnswer.trim().toLowerCase() === currentCanton.name.toLowerCase();
    setIsCorrect(isAnswerCorrect);
    
    if (isAnswerCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentIndex < cantons.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setUserAnswer('');
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="border-2 border-red-500">
            <CardContent className="p-8 text-center space-y-6">
              <h2 className="text-3xl font-bold text-red-600">Quiz beendet! 🇨🇭</h2>
              <div className="text-6xl font-bold text-gray-800">
                {score} / {cantons.length}
              </div>
              <p className="text-xl text-muted-foreground">
                {score === cantons.length 
                  ? 'Perfekt! Du kennst alle Kantone!' 
                  : `Du hast ${score} von ${cantons.length} Kantonen erkannt!`}
              </p>
              <Button onClick={onBack} size="lg" className="bg-red-600 hover:bg-red-700">
                Zurück zum Menü
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>

        <Card className="border-2 border-red-500">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-muted-foreground">
                  Kanton {currentIndex + 1} / {cantons.length}
                </span>
                <span className="text-lg font-semibold text-red-600">
                  Punkte: {score}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Welcher Kanton ist das?
              </h2>

              <div className="mb-6 flex justify-center">
                <img 
                  src={currentCanton.flagUrl} 
                  alt="Kantonsflagge"
                  className="w-64 h-48 object-contain border-2 border-gray-300 rounded-lg shadow-lg"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Kantonsname eingeben..."
                    className="text-center text-lg py-6"
                    disabled={isCorrect !== null}
                    autoFocus
                  />
                  {isCorrect !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isCorrect ? (
                        <Check className="w-6 h-6 text-green-500" />
                      ) : (
                        <X className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  )}
                </div>

                {isCorrect === false && (
                  <p className="text-red-600 font-semibold">
                    Richtige Antwort: {currentCanton.name}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={!userAnswer.trim() || isCorrect !== null}
                >
                  Bestätigen
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
