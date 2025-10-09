import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Users, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useAuth } from '@/hooks/useAuth';
import { countries, checkAnswer } from '@/data/countries';
import { useToast } from '@/hooks/use-toast';
import { useUserStats } from '@/hooks/useUserStats';

interface MultiplayerContinentGameProps {
  onBackToLobby: () => void;
  onBackToMenu: () => void;
}

export default function MultiplayerContinentGame({ onBackToLobby, onBackToMenu }: MultiplayerContinentGameProps) {
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
  
  // Get countries from selected continent
  const continentCountries = useMemo(() => {
    if (!currentLobby?.selected_continent) return [];
    return countries.filter(c => c.continent === currentLobby.selected_continent);
  }, [currentLobby?.selected_continent]);

  const totalCountries = continentCountries.length;

  // Monitor opponent's progress via realtime updates
  useEffect(() => {
    if (!currentLobby || !opponentParticipant) return;

    const opponentAnswers = opponentParticipant.current_answer?.split(',').filter(a => a.trim()) || [];
    setOpponentProgress(opponentAnswers.length);
  }, [opponentParticipant?.current_answer, currentLobby]);

  // Check for game end via lobby status
  useEffect(() => {
    if (!currentLobby || !myParticipant) return;
    
    if (currentLobby.status === 'finished') {
      if (currentLobby.winner_id === user?.id) {
        setGameStatus('won');
        incrementMultiplayerWins();
        toast({
          title: '🏆 Gewonnen!',
          description: `Du hast alle ${totalCountries} Länder zuerst genannt!`,
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
  }, [currentLobby?.status, currentLobby?.winner_id, user?.id, gameStatus, toast, myParticipant, totalCountries]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    if (!value.trim() || gameStatus !== 'playing') return;

    // Check if input matches any country from the continent
    for (const country of continentCountries) {
      if (!correctAnswers.has(country.name) && checkAnswer(value, country)) {
        const newCorrectAnswers = new Set(correctAnswers);
        newCorrectAnswers.add(country.name);
        setCorrectAnswers(newCorrectAnswers);
        setUserInput('');

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

          // Check if we got all countries
          if (newCorrectAnswers.size === totalCountries) {
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

  if (!currentLobby || !currentLobby.selected_continent || continentCountries.length === 0) {
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
              <p className="text-muted-foreground mb-6">
                Du hast alle {totalCountries} Länder von {currentLobby.selected_continent} zuerst genannt!
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
              <p className="text-muted-foreground mb-6">
                Dein Gegner hat alle {totalCountries} Länder von {currentLobby.selected_continent} zuerst genannt!
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

        {/* Title */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-6 text-center">
            <h2 className="text-3xl font-bold mb-2">
              {currentLobby.selected_continent}
            </h2>
            <p className="text-muted-foreground">
              Nenne alle Länder dieses Kontinents!
            </p>
          </CardContent>
        </Card>

        {/* Players Progress */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="border-2 border-primary">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={myParticipant?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {myParticipant?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium flex-1">{myParticipant?.username} (Du)</span>
                <Badge variant="default" className="text-lg px-3 py-1">
                  {correctAnswers.size}/{totalCountries}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(correctAnswers.size / totalCountries) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={opponentParticipant?.avatar_url || undefined} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {opponentParticipant?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium flex-1">{opponentParticipant?.username}</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {opponentProgress}/{totalCountries}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-secondary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(opponentProgress / totalCountries) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Input Field */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={(e) => e.preventDefault()} className="max-w-md mx-auto">
              <Input
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                placeholder="Land eingeben..."
                className="text-center text-xl py-6"
                autoFocus
                disabled={gameStatus !== 'playing'}
              />
              <p className="text-center text-sm text-muted-foreground mt-3">
                Tippe die Ländernamen ein - Reihenfolge egal
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Correctly guessed list */}
        {correctAnswers.size > 0 && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-success" />
                Richtig erraten ({correctAnswers.size}/{totalCountries}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(correctAnswers).sort().map((name) => (
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