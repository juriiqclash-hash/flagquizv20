import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, Eye, ArrowLeft, MapPin, Mountain, Languages, Smile, Globe } from "lucide-react";
import QuizHomeButton from "@/components/QuizHomeButton";
import { countries, shuffleArray, checkAnswer, getFlagUrl, type Country } from "@/data/countries";
import { getMountainByCountry } from "@/data/mountains";
import { getLanguageByCountry } from "@/data/languages";
import { getFactsByDifficulty, type WorldKnowledgeFact } from "@/data/worldKnowledge";
import { useToast } from "@/hooks/use-toast";
import { useUserStats } from "@/hooks/useUserStats";

interface CombiQuizProps {
  onBackToStart: () => void;
  isDailyChallenge?: boolean;
  maxQuestions?: number;
}

type QuestionCategory =
  | 'flag'
  | 'capital-to-country'
  | 'country-to-capital'
  | 'highest-mountain'
  | 'official-language'
  | 'emoji'
  | 'world-knowledge';

interface CategoryConfig {
  id: QuestionCategory;
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export default function CombiQuiz({ onBackToStart, isDailyChallenge = false, maxQuestions }: CombiQuizProps) {
  const [showCategorySelection, setShowCategorySelection] = useState(!isDailyChallenge);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);

  useEffect(() => {
    if (isDailyChallenge) {
      generateNextQuestion();
    }
  }, [isDailyChallenge]);
  const [categories, setCategories] = useState<CategoryConfig[]>([
    { id: 'flag', label: 'Flaggen', icon: <Globe className="w-4 h-4" />, enabled: true },
    { id: 'capital-to-country', label: 'Hauptstadt → Land', icon: <MapPin className="w-4 h-4" />, enabled: true },
    { id: 'country-to-capital', label: 'Land → Hauptstadt', icon: <MapPin className="w-4 h-4" />, enabled: true },
    { id: 'highest-mountain', label: 'Höchster Berg', icon: <Mountain className="w-4 h-4" />, enabled: true },
    { id: 'official-language', label: 'Amtssprache', icon: <Languages className="w-4 h-4" />, enabled: true },
    { id: 'emoji', label: 'Emoji', icon: <Smile className="w-4 h-4" />, enabled: true },
    { id: 'world-knowledge', label: 'Weltwissen', icon: <Globe className="w-4 h-4" />, enabled: true },
  ]);

  const [currentCategory, setCurrentCategory] = useState<QuestionCategory>('flag');
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [currentFact, setCurrentFact] = useState<WorldKnowledgeFact | null>(null);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addXP } = useUserStats();

  const toggleCategory = (categoryId: QuestionCategory) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  const startQuiz = () => {
    const enabledCategories = categories.filter(cat => cat.enabled);
    if (enabledCategories.length === 0) {
      toast({
        title: "Keine Kategorien ausgewählt",
        description: "Bitte wähle mindestens eine Kategorie aus.",
        variant: "destructive"
      });
      return;
    }
    setShowCategorySelection(false);
    generateNextQuestion();
  };

  const generateNextQuestion = () => {
    const enabledCategories = categories.filter(cat => cat.enabled);
    if (enabledCategories.length === 0) return;

    const randomCategory = enabledCategories[Math.floor(Math.random() * enabledCategories.length)];
    setCurrentCategory(randomCategory.id);

    if (randomCategory.id === 'world-knowledge') {
      const facts = getFactsByDifficulty('medium');
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      setCurrentFact(randomFact);
      setCurrentCountry(null);
    } else {
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      setCurrentCountry(randomCountry);
      setCurrentFact(null);
    }

    setUserInput("");
    setIsRevealed(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);

    if (!value.trim() || !currentCountry || currentCategory === 'world-knowledge') return;

    let isCorrect = false;

    switch (currentCategory) {
      case 'flag':
        isCorrect = checkAnswer(value, currentCountry);
        break;
      case 'capital-to-country':
        isCorrect = checkAnswer(value, currentCountry);
        break;
      case 'country-to-capital':
        isCorrect = value.toLowerCase().trim() === currentCountry.capital.toLowerCase().trim();
        break;
      case 'highest-mountain': {
        const mountainData = getMountainByCountry(currentCountry.name);
        if (mountainData) {
          isCorrect = value.toLowerCase().trim() === mountainData.highestPeak.toLowerCase().trim();
        }
        break;
      }
      case 'official-language': {
        const languageData = getLanguageByCountry(currentCountry.name);
        if (languageData) {
          isCorrect = value.toLowerCase().trim() === languageData.primaryLanguage.toLowerCase().trim();
        }
        break;
      }
      case 'emoji':
        isCorrect = checkAnswer(value, currentCountry);
        break;
    }

    if (isCorrect) {
      handleCorrectAnswer();
    }
  };

  const handleCorrectAnswer = () => {
    setScore(prev => prev + 1);
    const newTotalAnswered = totalAnswered + 1;
    setTotalAnswered(newTotalAnswered);
    addXP(1);

    if (maxQuestions && newTotalAnswered >= maxQuestions) {
      toast({
        title: "Richtig! ✅",
        description: currentCountry?.name || '',
        className: "bg-success text-success-foreground"
      });
      setTimeout(() => {
        setShowCompletionScreen(true);
      }, 500);
      return;
    }

    let correctAnswer = '';
    if (currentCountry) {
      switch (currentCategory) {
        case 'country-to-capital':
          correctAnswer = currentCountry.capital;
          break;
        case 'highest-mountain':
          const mountainData = getMountainByCountry(currentCountry.name);
          correctAnswer = mountainData ? mountainData.highestPeak : currentCountry.name;
          break;
        case 'official-language':
          const languageData = getLanguageByCountry(currentCountry.name);
          correctAnswer = languageData ? languageData.primaryLanguage : currentCountry.name;
          break;
        default:
          correctAnswer = currentCountry.name;
      }
    }

    toast({
      title: "Richtig! ✅",
      description: correctAnswer,
      className: "bg-success text-success-foreground"
    });

    setTimeout(() => {
      generateNextQuestion();
    }, 150);
  };

  const handleReveal = () => {
    setIsRevealed(true);
    const newTotalAnswered = totalAnswered + 1;
    setTotalAnswered(newTotalAnswered);

    if (maxQuestions && newTotalAnswered >= maxQuestions) {
      setTimeout(() => {
        setShowCompletionScreen(true);
      }, 500);
    }
  };

  const handleNext = () => {
    generateNextQuestion();
  };

  const handleWorldKnowledgeAnswer = (userAnswer: boolean) => {
    if (!currentFact) return;

    const isCorrect = userAnswer === currentFact.isTrue;
    const newTotalAnswered = totalAnswered + 1;

    if (isCorrect) {
      setScore(prev => prev + 1);
      addXP(1);
      toast({
        title: "Richtig! ✅",
        description: "Korrekt!",
        className: "bg-success text-success-foreground"
      });
    } else {
      toast({
        title: "Falsch! ❌",
        description: `Die richtige Antwort: ${currentFact.isTrue ? 'Wahr' : 'Falsch'}`,
        variant: "destructive"
      });
    }

    setTotalAnswered(newTotalAnswered);

    if (maxQuestions && newTotalAnswered >= maxQuestions) {
      setTimeout(() => {
        setShowCompletionScreen(true);
      }, 1500);
      return;
    }

    setTimeout(() => {
      generateNextQuestion();
    }, 1500);
  };

  const getCategoryLabel = () => {
    const cat = categories.find(c => c.id === currentCategory);
    return cat ? cat.label : 'Combi-Quiz';
  };

  const getQuestionPrompt = () => {
    if (!currentCountry) return '';

    switch (currentCategory) {
      case 'flag':
        return 'Welches Land gehört zu dieser Flagge?';
      case 'capital-to-country':
        return 'Welches Land hat diese Hauptstadt?';
      case 'country-to-capital':
        return 'Wie heißt die Hauptstadt?';
      case 'highest-mountain':
        return 'Wie heißt der höchste Berg?';
      case 'official-language':
        return 'Welche ist die Amtssprache?';
      case 'emoji':
        return 'Welches Land zeigen diese Emojis?';
      default:
        return '';
    }
  };

  const getInputPlaceholder = () => {
    switch (currentCategory) {
      case 'flag':
      case 'capital-to-country':
      case 'emoji':
        return 'Ländername eingeben...';
      case 'country-to-capital':
        return 'Hauptstadt eingeben...';
      case 'highest-mountain':
        return 'Bergname eingeben...';
      case 'official-language':
        return 'Sprache eingeben...';
      default:
        return 'Antwort eingeben...';
    }
  };

  const getCorrectAnswer = () => {
    if (!currentCountry) return '';

    switch (currentCategory) {
      case 'country-to-capital':
        return currentCountry.capital;
      case 'highest-mountain': {
        const mountainData = getMountainByCountry(currentCountry.name);
        return mountainData ? `${mountainData.highestPeak} (${mountainData.altitude})` : 'N/A';
      }
      case 'official-language': {
        const languageData = getLanguageByCountry(currentCountry.name);
        return languageData ? languageData.primaryLanguage : 'N/A';
      }
      default:
        return currentCountry.name;
    }
  };

  if (showCompletionScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500/10 to-blue-500/10 p-4 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardContent className="py-12 text-center">
            <div className="mb-6">
              <span className="text-8xl">🎉</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-green-600">Daily Challenge geschafft!</h1>
            <div className="space-y-4 mb-8">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6">
                <p className="text-6xl font-bold text-primary mb-2">{score}/{totalAnswered}</p>
                <p className="text-muted-foreground">Richtige Antworten</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg p-4">
                <p className="text-2xl font-bold text-yellow-600">
                  {totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0}% Erfolgsquote
                </p>
              </div>
            </div>
            <Button onClick={onBackToStart} size="lg" className="w-full max-w-md">
              Zurück zum Hauptmenü
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCategorySelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <QuizHomeButton onNavigateHome={onBackToStart} />
          </div>

          <Card>
            <CardContent className="py-8">
              <h2 className="text-3xl font-bold text-center mb-2">Combi-Quiz</h2>
              <p className="text-center text-muted-foreground mb-8">
                Wähle die Kategorien aus, die im Quiz vorkommen sollen
              </p>

              <div className="space-y-4 mb-8">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-3 p-4 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <Checkbox
                      checked={category.enabled}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      {category.icon}
                      <span className="font-medium">{category.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={startQuiz} size="lg" className="w-full">
                Quiz starten
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentCategory === 'world-knowledge' && currentFact) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <QuizHomeButton onNavigateHome={onBackToStart} />
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1">
                🏆 {score}/{totalAnswered}
              </Badge>
            </div>
          </div>

          <Card className="text-center">
            <CardContent className="py-12">
              <Badge className="mb-4">{getCategoryLabel()}</Badge>

              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Wahr oder Falsch?
              </h2>

              <div className="bg-white p-6 rounded-lg mb-8">
                <p className="text-lg leading-relaxed text-gray-700">
                  {currentFact.statement}
                </p>
              </div>

              <div className="flex gap-6 justify-center">
                <Button
                  onClick={() => handleWorldKnowledgeAnswer(true)}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg min-w-32"
                >
                  Wahr
                </Button>

                <Button
                  onClick={() => handleWorldKnowledgeAnswer(false)}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg min-w-32"
                >
                  Falsch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentCountry) {
    return <div className="flex items-center justify-center min-h-screen">Lade Quiz...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <QuizHomeButton onNavigateHome={onBackToStart} />
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-3 py-1">
              🏆 {score}/{totalAnswered}
            </Badge>
          </div>
        </div>

        <Card className="text-center">
          <CardContent className="py-12">
            <Badge className="mb-4">{getCategoryLabel()}</Badge>

            <div className="mb-8 flex justify-center">
              {currentCategory === 'emoji' ? (
                <div className="w-full max-w-md bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg shadow-lg border-2 border-border p-8">
                  <div className="text-center">
                    <div className="text-8xl mb-6">{currentCountry.emojis}</div>
                    <p className="text-muted-foreground text-lg">
                      {getQuestionPrompt()}
                    </p>
                  </div>
                </div>
              ) : currentCategory === 'capital-to-country' ||
                 currentCategory === 'country-to-capital' ||
                 currentCategory === 'highest-mountain' ||
                 currentCategory === 'official-language' ? (
                <div className="w-full max-w-md bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg shadow-lg border-2 border-border p-8">
                  <div className="text-center">
                    {currentCategory === 'highest-mountain' ? (
                      <Mountain className="h-16 w-16 mx-auto mb-4 text-primary" />
                    ) : currentCategory === 'official-language' ? (
                      <Languages className="h-16 w-16 mx-auto mb-4 text-primary" />
                    ) : (
                      <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
                    )}
                    <h2 className="text-4xl font-bold mb-4">
                      {currentCategory === 'capital-to-country'
                        ? currentCountry.capital
                        : currentCountry.name}
                    </h2>
                    <p className="text-muted-foreground text-lg">
                      {getQuestionPrompt()}
                    </p>
                  </div>
                </div>
              ) : (
                <img
                  src={getFlagUrl(currentCountry.code)}
                  alt={`Flagge von ${currentCountry.name}`}
                  className="w-48 h-32 object-cover rounded-lg shadow-lg border-2 border-border"
                  loading="lazy"
                />
              )}
            </div>

            {isRevealed && (
              <div className="mb-6">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {getCorrectAnswer()}
                </Badge>
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="max-w-md mx-auto space-y-4">
              <Input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder={getInputPlaceholder()}
                className="text-lg text-center"
                disabled={isRevealed}
                autoFocus
              />

              <div className="flex gap-2 justify-center">
                {!isRevealed ? (
                  <Button type="button" variant="outline" size="lg" onClick={handleReveal}>
                    <Eye className="w-4 h-4 mr-2" />
                    Aufdecken
                  </Button>
                ) : (
                  <Button type="button" size="lg" onClick={handleNext}>
                    Weiter
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-8 flex justify-center gap-6 text-sm text-muted-foreground">
              <span>✅ Richtige: {score}</span>
              <span>📊 Gesamt: {totalAnswered}</span>
              <span>🎯 Quote: {totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
