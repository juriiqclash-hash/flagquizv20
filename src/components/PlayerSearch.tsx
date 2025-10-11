import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/data/translations';

interface PlayerSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlayerSelect: (userId: string) => void;
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
  { id: 'multiplayer', name: 'Mehrspieler', description: 'Spiele gegen andere in Echtzeit', icon: '👥' },
];

export const PlayerSearch = ({ open, onOpenChange, onPlayerSelect }: PlayerSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const t = useTranslation(language);

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setResults([]);
      setQuizResults([]);
      setIsExpanded(false);
      return;
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        setQuizResults([]);
        return;
      }

      setLoading(true);
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
          const { data: stats } = await supabase
            .from('user_stats')
            .select('user_id, level, xp')
            .in('user_id', userIds);

          const combined = profiles.map(profile => {
            const userStat = stats?.find(s => s.user_id === profile.user_id);
            return {
              user_id: profile.user_id,
              username: profile.username,
              avatar_url: profile.avatar_url,
              level: userStat?.level || 0,
              xp: userStat?.xp || 0,
            };
          });

          setResults(combined);
        }
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div
        ref={searchRef}
        className="relative w-full max-w-2xl mx-4"
      >
        <div
          className={`bg-slate-800/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl transition-all duration-300 ${
            isExpanded ? 'max-h-[600px]' : 'h-14'
          }`}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder={t.searchPlayersPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              className="pl-12 pr-12 h-14 bg-transparent border-none text-white placeholder:text-gray-400 text-base focus-visible:ring-0"
              autoFocus
            />
            <button
              onClick={() => {
                onOpenChange(false);
                setIsExpanded(false);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {isExpanded && (
            <div className="overflow-y-auto max-h-[536px] px-2 pb-2">
              {loading && (
                <div className="text-center py-8 text-gray-400">
                  {t.loading || 'Lädt...'}
                </div>
              )}

              {!loading && searchQuery && results.length === 0 && quizResults.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Keine Ergebnisse gefunden
                </div>
              )}

              {!loading && !searchQuery && (
                <div className="text-center py-8 text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Beginne zu tippen...</p>
                </div>
              )}

              {!loading && quizResults.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-2">Quiz</h3>
                  {quizResults.map((quiz) => (
                    <button
                      key={quiz.id}
                      onClick={() => {
                        onOpenChange(false);
                        setIsExpanded(false);
                      }}
                      className="w-full flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                        {quiz.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-white">{quiz.name}</p>
                        <p className="text-sm text-gray-400">{quiz.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loading && results.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-2">Spieler</h3>
                  {results.map((player) => (
                    <button
                      key={player.user_id}
                      onClick={() => {
                        onPlayerSelect(player.user_id);
                        onOpenChange(false);
                        setIsExpanded(false);
                      }}
                      className="w-full flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Avatar className="h-10 w-10 ring-2 ring-white/20">
                        <AvatarImage src={player.avatar_url || undefined} />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {player.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 text-left">
                        <p className="font-semibold text-white">{player.username}</p>
                        <p className="text-sm text-gray-400">
                          {t.level || 'Level'} {player.level} • {player.xp} XP
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
