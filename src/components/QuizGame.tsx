import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Pause, Play, Home, Eye, EyeOff, SkipForward, MapPin, Map, Mountain, Languages, Menu } from "lucide-react";
import HamburgerMenu from "@/components/HamburgerMenu";
import { countries, shuffleArray, checkAnswer, continentEmojis, getFlagUrl, type Country } from "@/data/countries";
import { countryMountains, getMountainByCountry } from "@/data/mountains";
import { countryLanguages, getLanguageByCountry } from "@/data/languages";
import { useToast } from "@/hooks/use-toast";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useUserStats } from "@/hooks/useUserStats";
interface QuizGameProps {
  mode: 'timed' | 'learn' | 'streak' | 'continent' | 'speedrush' | 'capital-to-country' | 'country-to-capital' | 'emoji' | 'highest-mountain' | 'official-language' | 'world-knowledge';
  onBackToStart: () => void;
  continent?: string;
  timeLimit?: number;
}
export default function QuizGame({
  mode,
  onBackToStart,
  continent,
  timeLimit
}: QuizGameProps) {
  const [gameCountries, setGameCountries] = useState<Country[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set());
  const [skippedQuestions, setSkippedQuestions] = useState<Country[]>([]);
  const [currentContinent, setCurrentContinent] = useState("");
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const {
    toast
  } = useToast();
  const {
    saveScore
  } = useLeaderboard();
  const { addXP, updateBestStreak, updateTimeModeScore } = useUserStats();
  useEffect(() => {
    // Initialize game
    let shuffledCountries;
    if (mode === 'continent' && continent) {
      // Filter by selected continent
      shuffledCountries = countries.filter(country => country.continent === continent);
      shuffledCountries = shuffleArray(shuffledCountries);
    } else if (mode === 'timed') {
      shuffledCountries = shuffleArray(countries);
    } else if (mode === 'streak') {
      shuffledCountries = shuffleArray(countries);
    } else if (mode === 'speedrush') {
      shuffledCountries = shuffleArray(countries);
      setTimeRemaining(timeLimit || 300);
    } else if (mode === 'capital-to-country' || mode === 'country-to-capital') {
      shuffledCountries = shuffleArray(countries);
    } else if (mode === 'emoji') {
      // For emoji mode, use infinite shuffled countries
      shuffledCountries = shuffleArray(countries);
    } else if (mode === 'highest-mountain' || mode === 'official-language') {
      // Gleiche Sortierung wie im Lernmodus
      const continents = ['Afrika', 'Asien', 'Europa', 'Nordamerika', 'Südamerika', 'Ozeanien', 'Inselstaaten'];
      shuffledCountries = continents.flatMap(continent => countries.filter(country => country.continent === continent).sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      // Group by continent for learning mode
      const continents = ['Afrika', 'Asien', 'Europa', 'Nordamerika', 'Südamerika', 'Ozeanien', 'Inselstaaten'];
      shuffledCountries = continents.flatMap(continent => countries.filter(country => country.continent === continent));
    }
    setGameCountries(shuffledCountries);
    setStartTime(new Date());
    setCurrentContinent(shuffledCountries[0]?.continent || "");

    // Start timer for timed mode or speed rush
    if (mode === 'timed') {
      intervalRef.current = setInterval(() => {
        if (!isPaused) {
          setElapsedTime(prev => prev + 1);
        }
      }, 1000);
    } else if (mode === 'speedrush') {
      intervalRef.current = setInterval(() => {
        if (!isPaused && !gameOver) {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              // Game over - time's up, save score
              // Use current score from state
              setScore(currentScore => {
                saveScore('speedrush', currentScore, {
                  time_limit: timeLimit,
                  time_used: timeLimit || 0,
                  correct_answers: currentScore,
                  timeout: true
                });
                return currentScore;
              });
              setGameOver(true);
              toast({
                title: "⏰ Zeit abgelaufen!",
                description: `Du hast ${score} Flaggen richtig erkannt!`
              });
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mode, isPaused, continent, timeLimit, gameOver, toast]);
  useEffect(() => {
    if (gameCountries.length > 0 && currentIndex < gameCountries.length) {
      const newContinent = gameCountries[currentIndex].continent;
      if (newContinent !== currentContinent) {
        setCurrentContinent(newContinent);
        // Only show continent change notification in learn mode and when continent actually changes
        if (mode === 'learn' && currentContinent !== "") {
          toast({
            title: `${continentEmojis[newContinent as keyof typeof continentEmojis]} ${newContinent}`,
            description: `Jetzt kommen die Flaggen von ${newContinent}`
          });
        }
      }
    }
  }, [currentIndex, gameCountries, currentContinent, mode, toast]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);

    // Don't process if game is over
    if (gameOver) return;

    // Check answer in real-time for auto-advance
    if (value.trim() && currentIndex < gameCountries.length) {
      const currentCountry = gameCountries[currentIndex];
      let isCorrect = false;
      if (mode === 'capital-to-country') {
        isCorrect = checkAnswer(value, currentCountry);
      } else if (mode === 'country-to-capital') {
        const normalizedInput = value.toLowerCase().trim();
        const normalizedCapital = currentCountry.capital.toLowerCase().trim();
        isCorrect = normalizedInput === normalizedCapital;
      } else if (mode === 'highest-mountain') {
        const mountainData = getMountainByCountry(currentCountry.name);
        if (mountainData) {
          const normalizedInput = value.toLowerCase().trim();
          const normalizedMountain = mountainData.highestPeak.toLowerCase().trim();
          isCorrect = normalizedInput === normalizedMountain;
        }
      } else if (mode === 'official-language') {
        const languageData = getLanguageByCountry(currentCountry.name);
        if (languageData) {
          const normalizedInput = value.toLowerCase().trim();
          const normalizedLanguage = languageData.primaryLanguage.toLowerCase().trim();
          isCorrect = normalizedInput === normalizedLanguage;
        }
      } else {
        isCorrect = checkAnswer(value, currentCountry);
      }
      if (isCorrect) {
        setScore(prev => prev + 1);
        setCorrectAnswers(prev => new Set(prev).add(currentIndex));
        
        // Add XP for correct answer
        addXP(1);
        
        if (mode === 'streak') {
          const newStreak = streak + 1;
          setStreak(newStreak);
          // Update best streak
          updateBestStreak(newStreak);
        }
        let correctAnswer = '';
        if (mode === 'capital-to-country') {
          correctAnswer = currentCountry.name;
        } else if (mode === 'country-to-capital') {
          correctAnswer = currentCountry.capital;
        } else if (mode === 'highest-mountain') {
          const mountainData = getMountainByCountry(currentCountry.name);
          correctAnswer = mountainData ? mountainData.highestPeak : currentCountry.name;
        } else if (mode === 'official-language') {
          const languageData = getLanguageByCountry(currentCountry.name);
          correctAnswer = languageData ? languageData.primaryLanguage : currentCountry.name;
        } else {
          correctAnswer = currentCountry.name;
        }
        toast({
          title: "Richtig! ✅",
          description: `${correctAnswer}${mode === 'streak' ? ` - Streak: ${streak + 1}` : ''}`,
          className: "bg-success text-success-foreground"
        });

        // Auto-advance to next question (much faster)
        setTimeout(() => {
          // For speedrush, don't reset time - just advance
          if (mode === 'speedrush') {
            if (currentIndex + 1 >= gameCountries.length) {
              const finalScore = score + 1;
              // Save score when completing all questions
              saveScore('speedrush', finalScore, {
                time_limit: timeLimit,
                time_used: (timeLimit || 0) - timeRemaining,
                correct_answers: finalScore,
                completed: true
              });
              // Update time mode score for XP system
              updateTimeModeScore(finalScore);
              setGameOver(true);
              toast({
                title: "🎉 Quiz beendet!",
                description: `${finalScore} Flaggen in ${formatTime((timeLimit || 0) - timeRemaining)} richtig erkannt!`
              });
            } else {
              setCurrentIndex(prev => prev + 1);
              setUserInput("");
              setIsRevealed(false);
              inputRef.current?.focus();
            }
          } else {
            nextQuestion();
          }
        }, 150);
      }
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // For streak mode, check if answer is wrong and end game
    if (mode === 'streak' && userInput.trim()) {
      const currentCountry = gameCountries[currentIndex];
      const isCorrect = checkAnswer(userInput, currentCountry);
      if (!isCorrect) {
        // Save score when streak ends
        saveScore('streak', streak, {
          streak: streak,
          final_score: streak,
          wrong_answer: currentCountry.name
        });
        setGameOver(true);
        toast({
          title: "💔 Streak beendet!",
          description: `Du hast ${streak} Flaggen in Folge richtig erkannt! Die richtige Antwort war: ${currentCountry.name}`,
          className: "bg-destructive text-destructive-foreground"
        });
        return;
      }
    }
  };
  const nextQuestion = async () => {
    // For speedrush mode, don't advance if time is up
    if (mode === 'speedrush' && timeRemaining <= 0) {
      return;
    }

    // For emoji mode, generate infinite questions by reshuffling
    if (mode === 'emoji') {
      const newShuffledCountries = shuffleArray(countries);
      setGameCountries(newShuffledCountries);
      setCurrentIndex(0);
      setUserInput("");
      setIsRevealed(false);
      inputRef.current?.focus();
      return;
    }
    if (currentIndex + 1 >= gameCountries.length) {
      // For timed mode, check if there are skipped questions to retry
      if (mode === 'timed' && skippedQuestions.length > 0) {
        // Add skipped questions back to the end, but don't increment total count
        setGameCountries(prev => [...prev, ...skippedQuestions]);
        setSkippedQuestions([]);
        setCurrentIndex(prev => prev + 1);
        setUserInput("");
        setIsRevealed(false);
        inputRef.current?.focus();
        return;
      }

      // Game finished
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setGameOver(true);
      let finalMessage = "";
      let finalScore = 0;
      let details = {};
      if (mode === 'timed') {
        const correctCount = correctAnswers.size;

        // Nur speichern, wenn alle 197 Flaggen korrekt beantwortet
        if (correctCount >= 197) {
          // Berechne die tatsächlich verstrichene Zeit in Sekunden
          const actualElapsedTime = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000) : elapsedTime;
          const timeToSave = Math.max(actualElapsedTime, elapsedTime, 1); // Minimum 1 Sekunde

          const details = {
            time: timeToSave,
            total_questions: 197,
            correct_answers: correctCount,
            completion_time: timeToSave
          };
          try {
            // Direkt speichern
            await saveScore('timed', timeToSave, details);
            toast({
              title: "⏱️ Deine Zeit wurde in die Bestenlisten eingetragen",
              description: `Du hast alle 197 Flaggen in ${formatTime(timeToSave)} erkannt`
            });

            // Game Over setzen
            setGameOver(true);
          } catch (error) {
            console.error("Fehler beim Speichern der Zeit:", error);
            toast({
              title: "⚠️ Fehler",
              description: "Die Zeit konnte nicht gespeichert werden. Bitte versuche es erneut.",
              variant: "destructive"
            });
          }
          return; // Stoppe weitere Verarbeitung
        } else {
          // Wenn noch nicht alle korrekt, weiterfragen
          return;
        }
      } else if (mode === 'streak') {
        finalScore = streak;
        finalMessage = `Streak von ${streak} Flaggen!`;
        details = {
          streak: streak,
          final_score: streak
        };
      } else if (mode === 'continent') {
        finalScore = correctAnswers.size + (checkAnswer(userInput, gameCountries[currentIndex]) ? 1 : 0);
        finalMessage = `${finalScore}/${gameCountries.length} Flaggen von ${continent} erkannt!`;
        details = {
          continent: continent,
          total_questions: gameCountries.length,
          correct_answers: finalScore,
          completion_time: elapsedTime
        };
      } else if (mode === 'speedrush') {
        finalScore = score;
        finalMessage = `${score} Flaggen in ${formatTime((timeLimit || 0) - timeRemaining)} richtig erkannt!`;
        details = {
          time_limit: timeLimit,
          time_used: (timeLimit || 0) - timeRemaining,
          correct_answers: score
        };
      } else if (mode === 'capital-to-country' || mode === 'country-to-capital') {
        finalScore = correctAnswers.size + (checkAnswer(userInput, gameCountries[currentIndex]) ? 1 : 0);
        finalMessage = `${finalScore}/197 Hauptstädte erkannt`;
        details = {
          variant: mode,
          total_questions: 197,
          correct_answers: finalScore,
          completion_time: elapsedTime
        };
      } else if (mode === 'highest-mountain') {
        finalScore = correctAnswers.size;
        finalMessage = `${finalScore}/197 Berge erkannt`;
        details = {
          total_questions: 197,
          correct_answers: finalScore,
          completion_time: elapsedTime
        };
      } else if (mode === 'official-language') {
        finalScore = correctAnswers.size;
        finalMessage = `${finalScore}/197 Sprachen erkannt`;
        details = {
          total_questions: 197,
          correct_answers: finalScore,
          completion_time: elapsedTime
        };
      } else {
        finalScore = correctAnswers.size + (checkAnswer(userInput, gameCountries[currentIndex]) ? 1 : 0);
        finalMessage = `${finalScore}/197 Flaggen erkannt`;
        details = {
          total_questions: 197,
          correct_answers: finalScore,
          completion_time: elapsedTime
        };
      }
      if (finalScore > 0) {
        const saved = await saveScore(mode, finalScore, details);
        if (!saved) {
          console.log('Score not saved - finalScore is 0:', {
            mode,
            finalScore
          });
        }
      }
      toast({
        title: "🎉 Quiz beendet!",
        description: finalMessage
      });
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setUserInput("");
    setIsRevealed(false);
    inputRef.current?.focus();
  };
  const skipQuestion = () => {
    if (mode === 'timed' && currentIndex < gameCountries.length) {
      const currentCountry = gameCountries[currentIndex];
      // Only add to skipped if not already in the skipped list
      setSkippedQuestions(prev => {
        const isAlreadySkipped = prev.some(country => country.code === currentCountry.code);
        return isAlreadySkipped ? prev : [...prev, currentCountry];
      });
      toast({
        title: "Übersprungen ⏭️",
        description: "Flagge wird am Ende nochmal gezeigt",
        className: "bg-muted text-muted-foreground"
      });
      nextQuestion();
    }
  };
  const revealAnswer = () => {
    setIsRevealed(true);
  };
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const getModeTitle = () => {
    switch (mode) {
      case 'timed':
        return 'Zeitmessung';
      case 'learn':
        return 'Lernmodus';
      case 'streak':
        return 'Streak-Modus';
      case 'continent':
        return `Kontinent: ${continent}`;
      case 'speedrush':
        return 'Speed-Rush';
      case 'capital-to-country':
        return 'Hauptstadt → Land';
      case 'country-to-capital':
        return 'Land → Hauptstadt';
      case 'emoji':
        return 'Emoji-Modus';
      case 'highest-mountain':
        return 'Größter Berg';
      case 'official-language':
        return 'Amtssprache';
      default:
        return 'Quiz';
    }
  };
  if (gameCountries.length === 0) {
    return <div className="flex items-center justify-center min-h-screen">Lade Quiz...</div>;
  }

  // Game over screen for streak mode or speedrush when time is up
  if (gameOver || mode === 'speedrush' && timeRemaining <= 0) {
    return <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with Home and Pause buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <HamburgerMenu
                onNavigateHome={onBackToStart}
                currentPage="quiz"
              />
              <Button variant="outline" onClick={togglePause}>
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <Card className="max-w-md w-full text-center">
              <CardContent className="py-12">
                <div className="text-6xl mb-4">
                  {mode === 'streak' ? '💔' : mode === 'speedrush' ? '⏰' : '🎉'}
                </div>
                <h2 className="text-2xl font-bold mb-4">
                  {mode === 'streak' ? 'Streak beendet!' : mode === 'speedrush' ? 'Zeit abgelaufen!' : 'Quiz beendet!'}
                </h2>
                
                <div className="space-y-3 mb-6">
                  {mode === 'streak' && <p className="text-lg">
                      <span className="font-bold text-2xl text-primary">{streak}</span> Flaggen in Folge richtig!
                    </p>}
                  {mode === 'speedrush' && <p className="text-lg">
                      <span className="font-bold text-2xl text-primary">{score}</span> Flaggen richtig erkannt!
                    </p>}
                  {(mode === 'continent' || mode === 'timed' || mode === 'learn') && <p className="text-lg">
                      <span className="font-bold text-2xl text-primary">{score}</span>/
                      {mode === 'continent' ? gameCountries.length : '197'} Flaggen richtig!
                    </p>}
                </div>
                
                <Button onClick={onBackToStart} size="lg" className="w-full">
                  Neues Quiz starten
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>;
  }
  const currentCountry = gameCountries[currentIndex];
  const progress = (currentIndex + 1) / gameCountries.length * 100;
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <HamburgerMenu
              onNavigateHome={onBackToStart}
              currentPage="quiz"
            />
            <Button variant="outline" onClick={togglePause}>
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            {mode === 'timed' && <Badge variant="outline" className="text-lg px-3 py-1">
                ⏱️ {formatTime(elapsedTime)}
              </Badge>}
            {mode === 'speedrush' && <Badge variant="outline" className="text-lg px-3 py-1">
                ⏰ {formatTime(timeRemaining)}
              </Badge>}
            {mode === 'streak' && <Badge variant="outline" className="text-lg px-3 py-1">
                🔥 Streak: {streak}
              </Badge>}
            {mode !== 'emoji' && <Badge variant="outline" className="text-lg px-3 py-1">
                {currentIndex + 1}/{gameCountries.length}
              </Badge>}
            {mode === 'emoji' && <Badge variant="outline" className="text-lg px-3 py-1">
                🏆 Score: {score}
              </Badge>}
          </div>
        </div>

        {/* Progress */}
        {mode !== 'emoji' && <div className="mb-6">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{continentEmojis[currentContinent as keyof typeof continentEmojis]} {currentContinent}</span>
              <span>{Math.round(progress)}% abgeschlossen</span>
            </div>
          </div>}

        {isPaused ? <Card className="text-center py-12">
            <CardContent>
              <Pause className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Quiz pausiert</h2>
              <p className="text-muted-foreground">Drücke Play um fortzufahren</p>
            </CardContent>
          </Card> : <Card className="text-center">
            <CardContent className="py-12">
               {/* Flag/Question Display */}
              <div className="mb-8 flex justify-center">
                {mode === 'emoji' ? <div className="w-full max-w-md bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg shadow-lg border-2 border-border p-8">
                    <div className="text-center">
                      <div className="text-8xl mb-6">{currentCountry?.emojis}</div>
                      <p className="text-muted-foreground text-lg">
                        Welches Land zeigen diese Emojis?
                      </p>
                    </div>
                  </div> : mode === 'capital-to-country' || mode === 'country-to-capital' ? <div className="w-full max-w-md bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg shadow-lg border-2 border-border p-8">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
                      <h2 className="text-4xl font-bold mb-4">
                        {mode === 'capital-to-country' ? currentCountry?.capital : currentCountry?.name}
                      </h2>
                      <p className="text-muted-foreground text-lg">
                        {mode === 'capital-to-country' ? 'Welches Land hat diese Hauptstadt?' : 'Wie heißt die Hauptstadt?'}
                      </p>
                    </div>
                  </div> : mode === 'highest-mountain' || mode === 'official-language' ? <div className="w-full max-w-md bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg shadow-lg border-2 border-border p-8">
                    <div className="text-center">
                      {mode === 'highest-mountain' ? <Mountain className="h-16 w-16 mx-auto mb-4 text-primary" /> : <Languages className="h-16 w-16 mx-auto mb-4 text-primary" />}
                      <h2 className="text-4xl font-bold mb-4">
                        {currentCountry?.name}
                      </h2>
                      <p className="text-muted-foreground text-lg">
                        {mode === 'highest-mountain' ? 'Wie heißt der höchste Berg?' : 'Welche ist die Amtssprache?'}
                      </p>
                    </div>
                  </div> : <img src={getFlagUrl(currentCountry?.code || '')} alt={`Flagge von ${currentCountry?.name}`} className="w-48 h-32 object-cover rounded-lg shadow-lg border-2 border-border" loading="lazy" />}
              </div>

              {/* Answer Display */}
              {isRevealed && <div className="mb-6">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {mode === 'country-to-capital' ? currentCountry?.capital : mode === 'highest-mountain' ? (() => {
                const mountainData = getMountainByCountry(currentCountry?.name);
                return mountainData ? `${mountainData.highestPeak} (${mountainData.altitude})` : 'N/A';
              })() : mode === 'official-language' ? (() => {
                const languageData = getLanguageByCountry(currentCountry?.name);
                return languageData ? languageData.primaryLanguage : 'N/A';
              })() : currentCountry?.name}
                  </Badge>
                </div>}

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                <Input ref={inputRef} type="text" value={userInput} onChange={handleInputChange} placeholder={mode === 'capital-to-country' ? 'Ländername eingeben...' : mode === 'country-to-capital' ? 'Hauptstadt eingeben...' : mode === 'highest-mountain' ? 'Bergname eingeben...' : mode === 'official-language' ? 'Sprache eingeben...' : 'Ländername eingeben...'} className="text-lg text-center" disabled={isRevealed} autoFocus />
                
                <div className="flex gap-2 justify-center">
                  {mode === 'timed' && <Button type="button" variant="outline" size="lg" onClick={skipQuestion}>
                      <SkipForward className="w-4 h-4 mr-2" />
                      Überspringen
                    </Button>}
                  
                  {(mode === 'learn' || mode === 'highest-mountain' || mode === 'official-language') && <>
                      {!isRevealed ? <Button type="button" variant="outline" size="lg" onClick={revealAnswer}>
                          <Eye className="w-4 h-4 mr-2" />
                          Aufdecken
                        </Button> : <Button type="button" size="lg" onClick={nextQuestion}>
                          Weiter
                        </Button>}
                    </>}
                   
                  {mode === 'streak' && <Button type="button" variant="outline" size="lg" onClick={() => {
                // Save score when giving up
                saveScore('streak', streak, {
                  streak: streak,
                  final_score: streak,
                  gave_up: true
                });
                setGameOver(true);
                toast({
                  title: "Aufgegeben",
                  description: `Dein Streak: ${streak} Flaggen`
                });
              }}>
                      Aufgeben
                    </Button>}
                  
                  {(mode === 'continent' || mode === 'speedrush' || mode === 'capital-to-country' || mode === 'country-to-capital' || mode === 'emoji') && !isRevealed && <Button type="button" variant="outline" size="lg" onClick={revealAnswer}>
                      <Eye className="w-4 h-4 mr-2" />
                      Aufdecken
                    </Button>}
                  
                  {(mode === 'continent' || mode === 'speedrush' || mode === 'capital-to-country' || mode === 'country-to-capital' || mode === 'emoji') && isRevealed && <Button type="button" size="lg" onClick={nextQuestion}>
                      Weiter
                    </Button>}
                </div>
              </form>

              {/* Stats */}
              <div className="mt-8 flex justify-center gap-6 text-sm text-muted-foreground">
                <span>✅ Richtige: {correctAnswers.size}</span>
                {mode === 'timed' ? <>
                    <span>⏭️ Übersprungen: {skippedQuestions.length}</span>
                    
                  </> : mode === 'streak' ? <span>🔥 Aktueller Streak: {streak}</span> : mode === 'speedrush' ? <span>⏰ Verbleibend: {formatTime(timeRemaining)}</span> : <span>❌ Falsche: {currentIndex - correctAnswers.size}</span>}
              </div>
            </CardContent>
          </Card>}
      </div>
    </div>;
}