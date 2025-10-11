import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
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

  return null;
};
