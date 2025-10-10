import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Users, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useAuth } from '@/hooks/useAuth';
import { getFlagUrl, checkAnswer, countries } from '@/data/countries';
import { useToast } from '@/hooks/use-toast';
import { useUserStats } from '@/hooks/useUserStats';

// Deterministic shuffle function to ensure both players get same countries
const stringToSeed = (str: string) => {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0);
};

const mulberry32 = (a: number) => {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const seededShuffle = <T,>(array: T[], seedStr: string) => {
  const seed = stringToSeed(seedStr || 'default-seed');
  const rand = mulberry32(seed);
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

interface MultiplayerGameProps {
  onBackToLobby: () => void;
  onBackToMenu: () => void;
}

export default function MultiplayerGame({ onBackToLobby, onBackToMenu }: MultiplayerGameProps) {
  const { currentLobby, participants, leaveMatch } = useMultiplayer();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addXP, incrementMultiplayerWins } = useUserStats();
  
  const [userInput, setUserInput] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState<Set<string>>(new Set());
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting');
  const [opponentProgress, setOpponentProgress] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const myParticipant = participants.find(p => p.user_id === user?.id);
  const opponentParticipant = participants.find(p => p.user_id !== user?.id);
  
  // Generate 10 random countries deterministically based on room_code
  const selectedCountries = useMemo(() => {
    if (!currentLobby?.room_code) return [];
    const shuffled = seededShuffle(countries, currentLobby.room_code);
    return shuffled.slice(0, 10);
  }, [currentLobby?.room_code]);


  // Monitor opponent's progress via realtime updates
  useEffect(() => {
    if (!currentLobby || !opponentParticipant) return;

    // Parse opponent's current_answer as comma-separated list
    const opponentAnswers = opponentParticipant.current_answer?.split(',').filter(a => a.trim()) || [];
    setOpponentProgress(opponentAnswers.length);
  }, [opponentParticipant?.current_answer, currentLobby]);

  // Check for game end via lobby status
  useEffect(() => {
    if (!currentLobby || !myParticipant) return;
    
    if (currentLobby.status === 'finished') {
      if (currentLobby.winner_id === user?.id) {
        setGameStatus('won');
        // Increment multiplayer wins only once when user wins
        if (gameStatus !== 'won') {
          incrementMultiplayerWins();
        }
        toast({
          title: '🏆 Gewonnen!',
          description: 'Du hast alle 10 Flaggen erraten!',
          className: 'bg-success text-success-foreground',
        });
      } else {
        setGameStatus('lost');
        toast({
          title: '😔 Verloren',
          description: 'Dein Gegner war schneller!',
          variant: 'destructive',
        });
      }
    } else if (currentLobby.status === 'started' && gameStatus === 'waiting') {
      setGameStatus('playing');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentLobby?.status, currentLobby?.winner_id, user?.id, gameStatus, toast, myParticipant, incrementMultiplayerWins]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    if (!value.trim() || gameStatus !== 'playing') return;

    // Check if input matches any of the 10 countries
    for (const country of selectedCountries) {
      if (!correctAnswers.has(country.name) && checkAnswer(value, country)) {
        const newCorrectAnswers = new Set(correctAnswers);
        newCorrectAnswers.add(country.name);
        setCorrectAnswers(newCorrectAnswers);
        setUserInput('');
        
        // Add XP for correct answer in multiplayer
        addXP(1);
        
        // Update Supabase with current progress
        const progressStr = Array.from(newCorrectAnswers).join(',');
        
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          await supabase
            .from('match_participants')
            .update({ current_answer: progressStr })
            .eq('user_id', user?.id)
            .eq('lobby_id', currentLobby?.id);

          // Check if we got all 10
          if (newCorrectAnswers.size === 10) {
            // Send win signal to edge function
            await supabase.functions.invoke('multiplayer-game-engine', {
              body: { 
                lobbyId: currentLobby?.id, 
                action: 'complete_game',
                userId: user?.id
              }
            });
          }
        } catch (error) {
          console.error('Error updating progress:', error);
        }
        
        break;
      }
    }
  };

  const handleLeave = async () => {
    await leaveMatch(true);
    onBackToMenu();
  };

  if (!currentLobby || selectedCountries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Lade Spiel...</p>
            <Button onClick={onBackToMenu}>Zurück zum Menü</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameStatus === 'won') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success/10 to-success/20 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center min-h-screen">
          <Card className="max-w-md w-full text-center">
            <CardContent className="py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold mb-4 text-success">Gewonnen!</h2>
              <p className="text-muted-foreground mb-4">
                Du hast alle 10 Flaggen zuerst erraten!
              </p>
              <div className="space-y-3">
                <Button onClick={onBackToLobby} className="w-full">
                  Zurück zur Lobby
                </Button>
                <Button variant="outline" onClick={handleLeave} className="w-full">
                  Match verlassen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gameStatus === 'lost') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/10 to-destructive/20 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center min-h-screen">
          <Card className="max-w-md w-full text-center">
            <CardContent className="py-12">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-3xl font-bold mb-4 text-destructive">Verloren</h2>
              <p className="text-muted-foreground mb-4">
                Dein Gegner hat alle 10 Flaggen zuerst erraten!
              </p>
              <div className="space-y-3">
                <Button onClick={onBackToLobby} className="w-full">
                  Zurück zur Lobby
                </Button>
                <Button variant="outline" onClick={handleLeave} className="w-full">
                  Match verlassen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleLeave}>
              <Home className="w-4 h-4 mr-2" />
              Verlassen
            </Button>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-medium">Raum: {currentLobby.room_code}</span>
            </div>
          </div>
        </div>

        {/* Players Progress */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={myParticipant?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {myParticipant?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium flex-1">{myParticipant?.username} (Du)</span>
                <Badge variant="default">{correctAnswers.size}/10</Badge>
              </div>
              <div className="flex gap-1 flex-wrap">
                {selectedCountries.map((country) => (
                  <div
                    key={country.code}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      correctAnswers.has(country.name)
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {correctAnswers.has(country.name) ? <Check className="w-4 h-4" /> : ''}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={opponentParticipant?.avatar_url || undefined} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {opponentParticipant?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium flex-1">{opponentParticipant?.username}</span>
                <Badge variant="secondary">{opponentProgress}/10</Badge>
              </div>
              <div className="flex gap-1 flex-wrap">
                {selectedCountries.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      idx < opponentProgress
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {idx < opponentProgress ? <Check className="w-4 h-4" /> : ''}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flags Grid */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 text-center">
              Erkenne alle 10 Flaggen!
            </h3>
            <div className="grid grid-cols-5 gap-4 mb-6">
              {selectedCountries.map((country) => (
                <div
                  key={country.code}
                  className={`relative rounded-lg overflow-hidden border-2 ${
                    correctAnswers.has(country.name)
                      ? 'border-success opacity-50'
                      : 'border-border'
                  }`}
                >
                  <img
                    src={getFlagUrl(country.code)}
                    alt="Flag"
                    className="w-full h-24 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  {correctAnswers.has(country.name) && (
                    <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
                      <Check className="w-8 h-8 text-success" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Field */}
            <form onSubmit={(e) => e.preventDefault()} className="max-w-md mx-auto">
              <Input
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                placeholder="Land eingeben..."
                className="text-center text-lg"
                autoFocus
                disabled={gameStatus !== 'playing'}
              />
              <p className="text-center text-sm text-muted-foreground mt-2">
                Tippe die Ländernamen ein - Reihenfolge egal
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Correctly guessed list */}
        {correctAnswers.size > 0 && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Richtig erraten:</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(correctAnswers).map((name) => (
                  <Badge key={name} variant="default" className="bg-success text-success-foreground">
                    <Check className="w-3 h-3 mr-1" />
                    {name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
