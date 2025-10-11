import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';
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

export const PlayerSearch = ({ open, onOpenChange, onPlayerSelect }: PlayerSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();
  const t = useTranslation(language);

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setResults([]);
      return;
    }
  }, [open]);

  useEffect(() => {
    const searchPlayers = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
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
        console.error('Error searching players:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      searchPlayers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl">{t.searchPlayers || 'Spieler suchen'}</h3>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={t.searchPlayersPlaceholder || 'Spielername eingeben...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {loading && (
            <div className="text-center py-8 text-gray-500">
              {t.loading || 'Lädt...'}
            </div>
          )}

          {!loading && searchQuery && results.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t.noPlayersFound || 'Keine Spieler gefunden'}
            </div>
          )}

          {!loading && !searchQuery && (
            <div className="text-center py-8 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t.startTypingToSearch || 'Beginne zu tippen um Spieler zu suchen'}</p>
            </div>
          )}

          {!loading && results.map((player) => (
            <button
              key={player.user_id}
              onClick={() => {
                onPlayerSelect(player.user_id);
                onOpenChange(false);
              }}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Avatar className="h-12 w-12 ring-2 ring-gray-200">
                <AvatarImage src={player.avatar_url || undefined} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {player.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-left">
                <p className="font-semibold text-lg">{player.username}</p>
                <p className="text-sm text-gray-500">
                  {t.level || 'Level'} {player.level} • {player.xp} XP
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
