import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, X } from 'lucide-react';
import { swissCantonsData } from '@/data/swissCantonsData';

interface SwissCantonsNameQuizProps {
  onBack: () => void;
}

export default function SwissCantonsNameQuiz({ onBack }: SwissCantonsNameQuizProps) {
  const [userInput, setUserInput] = useState('');
  const [guessedCantons, setGuessedCantons] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [lastGuess, setLastGuess] = useState<{ correct: boolean; name: string } | null>(null);

  const totalCantons = swissCantonsData.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const normalizedInput = userInput.trim().toLowerCase();
    const matchedCanton = swissCantonsData.find(
      canton => canton.name.toLowerCase() === normalizedInput
    );

    if (matchedCanton && !guessedCantons.has(matchedCanton.name)) {
      setGuessedCantons(new Set([...guessedCantons, matchedCanton.name]));
      setLastGuess({ correct: true, name: matchedCanton.name });
    } else if (matchedCanton) {
      setLastGuess({ correct: false, name: 'Bereits genannt!' });
    } else {
      setLastGuess({ correct: false, name: 'Kein Schweizer Kanton' });
    }

    setUserInput('');
    
    setTimeout(() => {
      setLastGuess(null);
    }, 2000);
  };

  const handleFinish = () => {
    setShowResult(true);
  };

  const remainingCantons = swissCantonsData.filter(
    canton => !guessedCantons.has(canton.name)
  );

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <Card className="border-2 border-red-500">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-3xl font-bold text-center text-red-600">Quiz beendet! 🇨🇭</h2>
              <div className="text-6xl font-bold text-center text-gray-800">
                {guessedCantons.size} / {totalCantons}
              </div>
              <p className="text-xl text-center text-muted-foreground">
                {guessedCantons.size === totalCantons 
                  ? 'Perfekt! Du kennst alle Schweizer Kantone!' 
                  : `Du hast ${guessedCantons.size} von ${totalCantons} Kantonen genannt!`}
              </p>

              {remainingCantons.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4 text-center">Fehlende Kantone:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {remainingCantons.sort((a, b) => a.name.localeCompare(b.name, 'de')).map(canton => (
                      <div key={canton.code} className="text-center p-2 bg-red-50 rounded border border-red-200">
                        {canton.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center mt-6">
                <Button onClick={onBack} size="lg" className="bg-red-600 hover:bg-red-700">
                  Zurück zum Menü
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
      <div className="max-w-4xl mx-auto pt-8">
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
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Nenne alle 26 Kantone der Schweiz! 🇨🇭
                </h2>
                <p className="text-muted-foreground">
                  Wie viele kennst du?
                </p>
              </div>

              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <span className="text-2xl font-bold text-red-600">
                  {guessedCantons.size} / {totalCantons}
                </span>
                <Button 
                  onClick={handleFinish}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  Beenden
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Kantonsname eingeben..."
                    className="text-center text-lg py-6"
                    autoFocus
                  />
                  {lastGuess && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {lastGuess.correct ? (
                        <Check className="w-6 h-6 text-green-500" />
                      ) : (
                        <X className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  )}
                </div>

                {lastGuess && !lastGuess.correct && (
                  <p className="text-red-600 text-center font-semibold">
                    {lastGuess.name}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={!userInput.trim()}
                >
                  Eingeben
                </Button>
              </form>

              {guessedCantons.size > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    Genannte Kantone ({guessedCantons.size}):
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Array.from(guessedCantons).sort((a, b) => a.localeCompare(b, 'de')).map(canton => (
                      <div key={canton} className="text-center p-2 bg-green-50 rounded border border-green-200 flex items-center justify-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{canton}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
