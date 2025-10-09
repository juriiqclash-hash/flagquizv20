import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X } from "lucide-react";
import QuizHomeButton from "@/components/QuizHomeButton";
import { useToast } from "@/hooks/use-toast";
import { getFactsByDifficulty, getDifficultyDisplayName, type DifficultyLevel, type WorldKnowledgeFact } from "@/data/worldKnowledge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/data/translations";
import { useUserStats } from "@/hooks/useUserStats";

interface WorldKnowledgeQuizProps {
  difficulty: DifficultyLevel;
  onBack: () => void;
}

export default function WorldKnowledgeQuiz({ difficulty, onBack }: WorldKnowledgeQuizProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { addXP } = useUserStats();
  const [facts, setFacts] = useState<WorldKnowledgeFact[]>([]);
  const [currentFact, setCurrentFact] = useState<WorldKnowledgeFact | null>(null);
  const [usedFactIds, setUsedFactIds] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  useEffect(() => {
    const allFacts = getFactsByDifficulty(difficulty);
    setFacts(allFacts);
    selectRandomFact(allFacts, new Set());
  }, [difficulty]);

  const selectRandomFact = (availableFacts: WorldKnowledgeFact[], usedIds: Set<number>) => {
    if (usedIds.size >= availableFacts.length) {
      usedIds.clear();
      setUsedFactIds(new Set());
    }
    
    const unusedFacts = availableFacts.filter(fact => !usedIds.has(fact.id));
    if (unusedFacts.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * unusedFacts.length);
    const selectedFact = unusedFacts[randomIndex];
    setCurrentFact(selectedFact);
  };

  const handleAnswer = (userAnswer: boolean) => {
    if (!currentFact) return;

    const isCorrect = userAnswer === currentFact.isTrue;

    if (isCorrect) {
      setScore(prev => prev + 1);
      addXP(1);
      toast({
        title: t.correctAnswer,
        description: t.correctAnswer,
        className: "bg-green-50 border-green-200",
      });
    } else {
      toast({
        title: t.wrongAnswer,
        description: `${t.theCorrectAnswer}: ${currentFact.isTrue ? t.trueButton : t.falseButton}`,
        variant: "destructive",
      });
    }

    setTotalAnswered(prev => prev + 1);
    
    const newUsedIds = new Set(usedFactIds);
    newUsedIds.add(currentFact.id);
    setUsedFactIds(newUsedIds);
    
    setTimeout(() => {
      selectRandomFact(facts, newUsedIds);
    }, 1500);
  };

  const getAccuracyPercentage = () => {
    if (totalAnswered === 0) return 0;
    return Math.round((score / totalAnswered) * 100);
  };

  if (!currentFact) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-foreground text-xl">{t.loadingFacts}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <QuizHomeButton onNavigateHome={onBack} />
        
        <div className="text-center">
          <h1 className="text-xl font-bold">{t.worldKnowledgeTitle}</h1>
          <p className="text-sm opacity-80">{getDifficultyDisplayName(difficulty)}</p>
        </div>

        <div className="text-right text-sm">
          <div>{score}/{totalAnswered}</div>
          <div className="opacity-80">{getAccuracyPercentage()}% {t.correct.toLowerCase()}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {t.trueOrFalse}
                </h2>
                
                <div className="bg-white p-6 rounded-lg">
                  <p className="text-lg leading-relaxed text-gray-700">
                    {currentFact.statement}
                  </p>
                </div>
              </div>

              <div className="flex gap-6 justify-center">
                <Button
                  onClick={() => handleAnswer(true)}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg min-w-32"
                >
                  <Check className="mr-2 h-5 w-5" />
                  {t.trueButton}
                </Button>
                
                <Button
                  onClick={() => handleAnswer(false)}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg min-w-32"
                >
                  <X className="mr-2 h-5 w-5" />
                  {t.falseButton}
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
