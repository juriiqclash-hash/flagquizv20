import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Trophy, Users, Shield, Loader2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Leaderboard from '@/components/Leaderboard';
import { Card, CardContent } from '@/components/ui/card';
import { FriendsMenu } from '@/components/FriendsMenu';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/data/translations';

interface HamburgerMenuProps {
  onNavigateHome: () => void;
  onNavigateQuiz: () => void;
  currentPage?: 'home' | 'quiz';
  onProfileSelect?: (userId: string) => void;
}

interface SearchResult {
  user_id: string;
  username: string;
  avatar_url: string | null;
  level: number;
  xp: number;
}

interface QuizResult {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ClanResult {
  id: string;
  name: string;
  emoji: string;
  member_count: number;
}

const QUIZ_MODES: QuizResult[] = [
  { id: 'timed', name: 'Zeitlimit Modus', description: 'Beantworte so viele Fragen wie möglich', icon: '⏱️' },
  { id: 'learn', name: 'Lernmodus', description: 'Üben ohne Zeitdruck', icon: '📖' },
  { id: 'streak', name: 'Streak Modus', description: 'Wie viele richtige Antworten schaffst du in Folge?', icon: '🎯' },
  { id: 'continent', name: 'Kontinent Modus', description: 'Wähle einen spezifischen Kontinent', icon: '🌍' },
  { id: 'speedrush', name: 'Speed Rush', description: 'Beantworte 10 Fragen so schnell wie möglich', icon: '⚡' },
  { id: 'capitals', name: 'Hauptstädte', description: 'Erkenne das Land anhand der Hauptstadt', icon: '🏛️' },
  { id: 'emoji', name: 'Emoji Modus', description: 'Erkenne Länder anhand ihrer Flaggen-Emojis', icon: '😃' },
  { id: 'highest-mountain', name: 'Höchste Berge', description: 'Erkenne den höchsten Berg jedes Landes', icon: '⛰️' },
  { id: 'official-language', name: 'Amtssprachen', description: 'Erkenne die Amtssprache jedes Landes', icon: '🗣️' },
  { id: 'world-knowledge', name: 'Weltwissen Quiz', description: 'Teste dein Wissen über Weltfakten', icon: '🌏' },
  { id: 'combi-quiz', name: 'Combi-Quiz', description: 'Wähle deine Kategorien und spiele endlos', icon: '🎭' },
  { id: 'multiplayer', name: 'Multiplayer', description: 'Spiele gegen andere in Echtzeit', icon: '👥' },
];

const HamburgerMenu = ({ onNavigateHome, onNavigateQuiz, currentPage = 'quiz', onProfileSelect }: HamburgerMenuProps) => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [open, setOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [friendsDialogOpen, setFriendsDialogOpen] = useState(false);
  const [clansDialogOpen, setClansDialogOpen] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playerResults, setPlayerResults] = useState<SearchResult[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [clanResults, setClanResults] = useState<ClanResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleNavigateHome = () => {
    setOpen(false);
    onNavigateHome();
  };

  const handleNavigateQuiz = () => {
    setOpen(false);
    setIsLoadingQuiz(true);
    const random = Math.random() * Math.random();
    const randomDelay = Math.floor(random * 1200) + 300;
    setTimeout(() => {
      setIsLoadingQuiz(false);
      onNavigateQuiz();
    }, randomDelay);
  };

  const handleOpenLeaderboard = () => {
    setOpen(false);
    setLeaderboardOpen(true);
  };

  const handleOpenFriends = () => {
    setOpen(false);
    setFriendsDialogOpen(true);
  };

  const handleOpenClans = () => {
    setOpen(false);
    setClansDialogOpen(true);
  };

  const handleOpenSearch = () => {
    setOpen(false);
    setSearchDialogOpen(true);
  };

  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim()) {
        setPlayerResults([]);
        setQuizResults([]);
        setClanResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const query = searchQuery.toLowerCase();

        const filteredQuizzes = QUIZ_MODES.filter(quiz =>
          quiz.name.toLowerCase().includes(query) ||
          quiz.description.toLowerCase().includes(query)
        );
        setQuizResults(filteredQuizzes);

        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .ilike('username', `${searchQuery}%`)
          .limit(20);

        if (profiles) {
          const userIds = profiles.map(p => p.user_id);
          const { data: statsData } = await supabase
            .from('user_stats')
            .select('user_id, level, xp')
            .in('user_id', userIds);

          const combined = profiles.map(profile => {
            const userStat = statsData?.find(s => s.user_id === profile.user_id);
            return {
              user_id: profile.user_id,
              username: profile.username,
              avatar_url: profile.avatar_url,
              level: userStat?.level || 0,
              xp: userStat?.xp || 0,
            };
          });

          setPlayerResults(combined);
        }

        const { data: clans } = await supabase
          .from('clans')
          .select('id, name, emoji')
          .ilike('name', `%${searchQuery}%`)
          .limit(10);

        if (clans) {
          const clansWithCounts = clans.map(clan => ({
            id: clan.id,
            name: clan.name,
            emoji: clan.emoji,
            member_count: 0,
          }));

          setClanResults(clansWithCounts);
        }
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <>
      {isLoadingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
            <p className="text-2xl font-semibold">Lade Quiz...</p>
          </div>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Menü</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button
              variant={currentPage === 'home' ? 'default' : 'outline'}
              className="w-full justify-start text-lg h-14"
              onClick={handleNavigateHome}
            >
              <Home className="h-5 w-5 mr-3" />
              Hauptmenü
            </Button>

            <Button
              variant={currentPage === 'quiz' ? 'default' : 'outline'}
              className="w-full justify-start text-lg h-14"
              onClick={handleNavigateQuiz}
              disabled={isLoadingQuiz}
            >
              <Trophy className="h-5 w-5 mr-3" />
              Quiz
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-lg h-14"
              onClick={handleOpenLeaderboard}
            >
              <Trophy className="h-5 w-5 mr-3" />
              Bestenliste
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-lg h-14"
              onClick={handleOpenFriends}
            >
              <Users className="h-5 w-5 mr-3" />
              Freunde
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-lg h-14"
              onClick={handleOpenClans}
            >
              <Shield className="h-5 w-5 mr-3" />
              Clans
            </Button>

          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={leaderboardOpen} onOpenChange={setLeaderboardOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bestenlisten</DialogTitle>
          </DialogHeader>
          <Leaderboard />
        </DialogContent>
      </Dialog>

      <FriendsMenu
        open={friendsDialogOpen}
        onOpenChange={setFriendsDialogOpen}
      />

      <Dialog open={clansDialogOpen} onOpenChange={setClansDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Clans</DialogTitle>
          </DialogHeader>
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Bald verfügbar!</h3>
              <p className="text-muted-foreground">
                Die Clan-Funktion wird in Kürze verfügbar sein. Hier kannst du bald einem Clan beitreten oder deinen eigenen erstellen.
              </p>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="max-w-xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Suchen</DialogTitle>
          </DialogHeader>
          <Input
            placeholder={t.searchPlayersPlaceholder || 'Spieler, Clans oder Quiz suchen...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
            autoFocus
          />
          <div className="max-h-[500px] overflow-y-auto">
            {searchLoading && (
              <div className="text-center py-8 text-gray-400">
                {t.loading || 'Lädt...'}
              </div>
            )}

            {!searchLoading && searchQuery && playerResults.length === 0 && quizResults.length === 0 && clanResults.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Keine Ergebnisse gefunden
              </div>
            )}

            {!searchLoading && quizResults.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-2">Quiz</h3>
                {quizResults.map((quiz) => (
                  <button
                    key={quiz.id}
                    onClick={() => {
                      setSearchDialogOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="text-2xl">{quiz.icon}</div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{quiz.name}</p>
                      <p className="text-xs text-gray-500">{quiz.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!searchLoading && clanResults.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-2">Clans</h3>
                {clanResults.map((clan) => (
                  <button
                    key={clan.id}
                    onClick={() => {
                      setSearchDialogOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="text-2xl">{clan.emoji}</div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{clan.name}</p>
                      <p className="text-xs text-gray-500">
                        {clan.member_count} {clan.member_count === 1 ? 'Mitglied' : 'Mitglieder'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!searchLoading && playerResults.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-2">Spieler</h3>
                {playerResults.map((player) => (
                  <button
                    key={player.user_id}
                    onClick={() => {
                      if (onProfileSelect) {
                        onProfileSelect(player.user_id);
                      }
                      setSearchDialogOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={player.avatar_url || undefined} />
                      <AvatarFallback className="bg-blue-500 text-white text-sm">
                        {player.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{player.username}</p>
                      <p className="text-xs text-gray-500">
                        {t.level || 'Level'} {player.level} • {player.xp} XP
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HamburgerMenu;
