import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Copy, Play, LogOut, Crown, User, Flag, UserX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
interface MultiplayerLobbyProps {
  onStartGame: () => void;
  onBackToMenu: () => void;
  onStartCountdown: () => void;
  onGameModeChange: (mode: string) => void;
}
export default function MultiplayerLobby({
  onStartGame,
  onBackToMenu,
  onStartCountdown,
  onGameModeChange
}: MultiplayerLobbyProps) {
  const {
    currentLobby,
    participants,
    startMatch,
    leaveMatch,
    kickPlayer,
    updateSettings,
    onlineUsers
  } = useMultiplayer();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [countdownTriggered, setCountdownTriggered] = useState(false);
  const [selectedGameMode, setSelectedGameMode] = useState<string>('flags');
  const [selectedContinent, setSelectedContinent] = useState<string>('');
  const isCreator = currentLobby?.owner_id === user?.id;
  const canStart = participants.length >= 2 && (selectedGameMode !== 'continents' || selectedContinent !== '');

  // Sync game mode from lobby for non-creators
  useEffect(() => {
    if (!isCreator && currentLobby) {
      if (currentLobby.selected_game_mode) {
        setSelectedGameMode(currentLobby.selected_game_mode);
      }
      if (currentLobby.selected_continent) {
        setSelectedContinent(currentLobby.selected_continent);
      }
    }
  }, [currentLobby?.selected_game_mode, currentLobby?.selected_continent, isCreator]);

  // Update lobby when creator changes game mode or continent
  useEffect(() => {
    const updateLobbySettings = async () => {
      if (!isCreator || !currentLobby) return;
      
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase
        .from('lobbies')
        .update({
          selected_game_mode: selectedGameMode,
          selected_continent: selectedContinent || null
        })
        .eq('id', currentLobby.id);
    };

    if (isCreator) {
      updateLobbySettings();
    }
  }, [selectedGameMode, selectedContinent, isCreator, currentLobby?.id]);

  // Update parent component when game mode changes
  useEffect(() => {
    onGameModeChange(selectedGameMode);
  }, [selectedGameMode, onGameModeChange]);

  useEffect(() => {
    if (!currentLobby) return;
    if (currentLobby.status === 'started' && !countdownTriggered) {
      console.log('Starting countdown due to lobby status change');
      setCountdownTriggered(true);
      onStartCountdown();
    }
  }, [currentLobby?.status, countdownTriggered, onStartCountdown]);
  if (!currentLobby) {
    return <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Lade Lobby...</p>
            <Button onClick={onBackToMenu}>Zurück zum Menü</Button>
          </CardContent>
        </Card>
      </div>;
  }
  const copyRoomCode = () => {
    try {
      navigator.clipboard.writeText(currentLobby.room_code);
      toast({
        title: 'Kopiert!',
        description: 'Raumcode wurde in die Zwischenablage kopiert.'
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Raumcode konnte nicht kopiert werden.',
        variant: 'destructive'
      });
    }
  };
  const handleStartMatch = async () => {
    if (selectedGameMode === 'continents' && !selectedContinent) {
      toast({
        title: 'Fehler',
        description: 'Bitte wähle einen Kontinent aus',
        variant: 'destructive'
      });
      return;
    }

    await startMatch();
    onStartCountdown();
  };
  const handleLeave = async () => {
    await leaveMatch(true); // Force leave when user explicitly clicks leave
    onBackToMenu();
  };
  if (!currentLobby) {
    return <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Lade Lobby...</p>
            <Button onClick={onBackToMenu}>Zurück zum Menü</Button>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Flag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Flaggen-Guesser</h1>
              <p className="text-blue-200 text-sm">Raum: {currentLobby.room_code}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={copyRoomCode} className="text-white hover:bg-white/10">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="ghost" onClick={handleLeave} className="text-white hover:bg-white/10">
            <LogOut className="w-4 h-4 mr-2" />
            Verlassen
          </Button>
        </div>

        {/* VS Layout */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-8 lg:gap-16">
            {/* Player 1 */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="w-32 h-32 lg:w-40 lg:h-40 ring-4 ring-blue-300/30 shadow-2xl">
                  <AvatarImage src={participants[0]?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-4xl lg:text-5xl">
                    {participants[0]?.username?.charAt(0).toUpperCase() || <User className="w-16 h-16 lg:w-20 lg:h-20" />}
                  </AvatarFallback>
                </Avatar>
                {participants[0] && currentLobby?.owner_id === participants[0].user_id && <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-5 h-5 text-white" />
                  </div>}
                {participants[0] && <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${onlineUsers.includes(participants[0].user_id) ? 'bg-green-500' : 'bg-gray-500'} rounded-full border-3 border-white flex items-center justify-center shadow-lg`}>
                    <div className={`w-3 h-3 rounded-full ${onlineUsers.includes(participants[0].user_id) ? 'bg-white animate-pulse' : 'bg-gray-300'}`}></div>
                  </div>}
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-2xl lg:text-3xl font-bold text-white">
                  {participants[0]?.username || 'Warten...'}
                </h3>
                <Badge variant={participants[0] ? 'default' : 'secondary'} className={`text-sm px-4 py-1 ${participants[0] ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-500'}`}>
                  {participants[0] ? onlineUsers.includes(participants[0].user_id) ? '🟢 Online' : '🔴 Offline' : '⏳ Warten'}
                </Badge>
              </div>
            </div>

            {/* VS Text */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <span className="text-6xl lg:text-8xl font-black bg-gradient-to-r from-yellow-400 via-red-500 to-orange-600 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                  VS
                </span>
                {/* Glow effect */}
                <span className="absolute inset-0 text-6xl lg:text-8xl font-black text-orange-500 blur-sm opacity-50 animate-pulse">
                  VS
                </span>
              </div>
            </div>

            {/* Player 2 */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="w-32 h-32 lg:w-40 lg:h-40 ring-4 ring-red-300/30 shadow-2xl">
                  <AvatarImage src={participants[1]?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-red-400 to-red-600 text-white text-4xl lg:text-5xl">
                    {participants[1]?.username?.charAt(0).toUpperCase() || <User className="w-16 h-16 lg:w-20 lg:h-20" />}
                  </AvatarFallback>
                </Avatar>
                {participants[1] && currentLobby?.owner_id === participants[1].user_id && <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-5 h-5 text-white" />
                  </div>}
                {participants[1] && <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${onlineUsers.includes(participants[1].user_id) ? 'bg-green-500' : 'bg-gray-500'} rounded-full border-3 border-white flex items-center justify-center shadow-lg`}>
                    <div className={`w-3 h-3 rounded-full ${onlineUsers.includes(participants[1].user_id) ? 'bg-white animate-pulse' : 'bg-gray-300'}`}></div>
                  </div>}
                {participants[1] && isCreator && currentLobby?.owner_id !== participants[1].user_id && <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -left-2 w-8 h-8 rounded-full p-0 shadow-lg"
                    onClick={() => kickPlayer(participants[1].user_id)}
                  >
                    <UserX className="w-4 h-4" />
                  </Button>}
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-2xl lg:text-3xl font-bold text-white">
                  {participants[1]?.username || 'Warten...'}
                </h3>
                <Badge variant={participants[1] ? 'default' : 'secondary'} className={`text-sm px-4 py-1 ${participants[1] ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-500'}`}>
                  {participants[1] ? onlineUsers.includes(participants[1].user_id) ? '🟢 Online' : '🔴 Offline' : '⏳ Warten'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Game Settings */}
        <Card className="mb-8 bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Spieleinstellungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Game Mode Selection */}
              {isCreator && <div className="p-4 bg-white/5 rounded-lg space-y-3">
                  <label className="text-white font-medium block">Spielmodus:</label>
                  <Select value={selectedGameMode} onValueChange={setSelectedGameMode}>
                    <SelectTrigger className="bg-white/10 text-white border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flags">10 Flaggen Speed</SelectItem>
                      <SelectItem value="continents">Kontinent Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>}

              {/* Continent Selection - Only show for continent mode */}
              {isCreator && selectedGameMode === 'continents' && <div className="p-4 bg-white/5 rounded-lg space-y-3">
                  <label className="text-white font-medium block">Kontinent:</label>
                  <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                    <SelectTrigger className="bg-white/10 text-white border-white/20">
                      <SelectValue placeholder="Wähle einen Kontinent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Afrika">Afrika</SelectItem>
                      <SelectItem value="Asien">Asien</SelectItem>
                      <SelectItem value="Europa">Europa</SelectItem>
                      <SelectItem value="Nordamerika">Nordamerika</SelectItem>
                      <SelectItem value="Südamerika">Südamerika</SelectItem>
                      <SelectItem value="Ozeanien">Ozeanien</SelectItem>
                    </SelectContent>
                  </Select>
                </div>}

              {/* Display selected mode for non-creators */}
              {!isCreator && <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Flag className="w-5 h-5 text-white" />
                    <div>
                      <h3 className="text-white font-medium">
                        {selectedGameMode === 'flags' ? '10 Flaggen Speed' : 'Kontinent Quiz'}
                      </h3>
                      <p className="text-sm text-blue-200">
                        {selectedGameMode === 'flags' ? 'Erkenne alle 10 Flaggen so schnell wie möglich!' : selectedContinent ? `Nenne alle Länder von ${selectedContinent}!` : 'Warte auf Kontinent-Auswahl...'}
                      </p>
                    </div>
                  </div>
                </div>}
              
              {/* Start Button */}
              {isCreator && canStart && <Button onClick={handleStartMatch} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  <Play className="w-4 h-4 mr-2" />
                  Spiel starten
                </Button>}
            </div>
          </CardContent>
        </Card>

        {/* Status Messages */}
        {!canStart && <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="pt-6 text-center">
              <p className="text-yellow-200">
                Warte auf einen zweiten Spieler...
              </p>
              <p className="text-yellow-200/70 text-sm mt-2">
                Teile den Raumcode mit einem Freund!
              </p>
            </CardContent>
          </Card>}

        {canStart && !isCreator && <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="pt-6 text-center">
              <p className="text-blue-200">
                Warte darauf, dass der Spielleiter das Spiel startet...
              </p>
            </CardContent>
          </Card>}
      </div>
    </div>;
}