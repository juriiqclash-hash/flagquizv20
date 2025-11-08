import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/data/translations';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  game_mode: string;
  score: number;
  details: any;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

const Leaderboard = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSpeedRushMode, setSelectedSpeedRushMode] = useState('speedrush_30s');

  const gameModes = [
    { key: 'streak', label: t.streak },
    { key: 'timed', label: t.onTime },
    { key: 'speedrush', label: t.speedRushShort, hasSubcategories: true },
    { key: 'multiplayer', label: 'Multiplayer' },
  ];

  const speedRushModes = [
    { key: 'speedrush_30s', label: t.seconds30 },
    { key: 'speedrush_1m', label: t.minute1 },
    { key: 'speedrush_5m', label: t.minutes5 },
    { key: 'speedrush_10m', label: t.minutes10 },
  ];

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    setLoading(true);
    const leaderboardData: Record<string, LeaderboardEntry[]> = {};

    // Fetch regular modes (streak, timed)
    for (const mode of gameModes.filter(m => !m.hasSubcategories)) {
      const ascending = mode.key === 'timed'; // For timed mode, lower is better
      
      const { data: leaderboardEntries, error: leaderboardError } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('game_mode', mode.key)
        .order('score', { ascending })
        .limit(10);

      if (!leaderboardError && leaderboardEntries) {
        // Get unique user IDs
        const userIds = [...new Set(leaderboardEntries.map(entry => entry.user_id))];
        
        // Get profiles for these users
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .in('user_id', userIds);

        // Create a map for quick lookup
        const profileMap = new Map(
          profiles?.map(profile => [profile.user_id, profile]) || []
        );

        // Combine the data
        const combinedData = leaderboardEntries.map(entry => ({
          ...entry,
          profiles: profileMap.get(entry.user_id) || { username: 'Unbekannt', avatar_url: null }
        }));

        leaderboardData[mode.key] = combinedData;
      }
    }

    // Fetch Speed Rush subcategories
    for (const speedMode of speedRushModes) {
      const { data: leaderboardEntries, error: leaderboardError } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('game_mode', speedMode.key)
        .order('score', { ascending: false })
        .limit(10);

      if (!leaderboardError && leaderboardEntries) {
        // Get unique user IDs
        const userIds = [...new Set(leaderboardEntries.map(entry => entry.user_id))];
        
        // Get profiles for these users
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .in('user_id', userIds);

        // Create a map for quick lookup
        const profileMap = new Map(
          profiles?.map(profile => [profile.user_id, profile]) || []
        );

        // Combine the data
        const combinedData = leaderboardEntries.map(entry => ({
          ...entry,
          profiles: profileMap.get(entry.user_id) || { username: 'Unbekannt', avatar_url: null }
        }));

        leaderboardData[speedMode.key] = combinedData;
      }
    }

    setLeaderboards(leaderboardData);
    setLoading(false);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold">{index + 1}</span>;
    }
  };

  const renderLeaderboard = (entries: LeaderboardEntry[]) => {
    if (loading) {
      return <div className="text-center py-4">{t.loadingLeaderboard}</div>;
    }

    if (!entries || entries.length === 0) {
      return <div className="text-center py-4 text-muted-foreground">{t.noScores}</div>;
    }

    return (
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {getRankIcon(index)}
              <Avatar className="h-8 w-8">
                <AvatarImage src={entry.profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {entry.profiles?.username?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{entry.profiles?.username || t.unknown}</span>
            </div>
            <div className="text-right">
              <div className="font-bold">
                {entry.game_mode === 'timed' 
                  ? `${Math.floor(entry.score / 60)}:${(entry.score % 60).toString().padStart(2, '0')}`
                  : entry.score
                }
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(entry.created_at).toLocaleDateString(language === 'de' ? 'de-DE' : language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'it' ? 'it-IT' : 'ja-JP')}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          {t.bestLists}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="streak">
          <TabsList className="grid w-full grid-cols-4">
            {gameModes.map(mode => (
              <TabsTrigger key={mode.key} value={mode.key} className="text-sm">
                {mode.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {gameModes.map(mode => (
            <TabsContent key={mode.key} value={mode.key} className="mt-4">
              {mode.hasSubcategories ? (
                <div className="space-y-4">
                  <Tabs value={selectedSpeedRushMode} onValueChange={setSelectedSpeedRushMode}>
                    <TabsList className="grid w-full grid-cols-4">
                      {speedRushModes.map(speedMode => (
                        <TabsTrigger key={speedMode.key} value={speedMode.key} className="text-xs">
                          {speedMode.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                  {renderLeaderboard(leaderboards[selectedSpeedRushMode])}
                </div>
              ) : (
                renderLeaderboard(leaderboards[mode.key])
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;