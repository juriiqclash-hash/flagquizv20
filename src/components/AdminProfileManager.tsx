import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';
import { getCumulativeXP } from '@/lib/xpSystem';

export default function AdminProfileManager() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [streak, setStreak] = useState('');
  const [timeMode, setTimeMode] = useState('');
  const [duelWins, setDuelWins] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('user_id, username, created_at') 
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
  };

  const loadUserStats = async (userId: string) => {
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (stats) {
      setDuelWins(stats.multiplayer_wins.toString());
    }

    // Load leaderboard stats
    const { data: streakData } = await supabase
      .from('leaderboards')
      .select('score')
      .eq('user_id', userId)
      .eq('game_mode', 'streak')
      .single();

    const { data: timedData } = await supabase
      .from('leaderboards')
      .select('score')
      .eq('user_id', userId)
      .eq('game_mode', 'timed')
      .single();

    if (streakData) setStreak(streakData.score.toString());
    if (timedData) setTimeMode(timedData.score.toString());
  };

  const updateUserProfile = async () => {
    if (!selectedUserId) {
      toast({
        title: 'Fehler',
        description: 'Bitte wähle einen Benutzer aus',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Update streak leaderboard
      if (streak) {
        const { error: streakError } = await supabase.rpc('upsert_leaderboard_score', {
          p_user_id: selectedUserId,
          p_game_mode: 'streak',
          p_score: parseInt(streak),
          p_details: {}
        });
        if (streakError) throw streakError;

        // Also update best_streak in user_stats
        const { error: statsStreakError } = await supabase
          .from('user_stats')
          .update({ best_streak: parseInt(streak) })
          .eq('user_id', selectedUserId);
        if (statsStreakError) throw statsStreakError;
      }

      // Update time mode leaderboard
      if (timeMode) {
        const { error: timeError } = await supabase.rpc('upsert_leaderboard_score', {
          p_user_id: selectedUserId,
          p_game_mode: 'timed',
          p_score: parseInt(timeMode),
          p_details: {}
        });
        if (timeError) throw timeError;

        // Also update time_mode_best_score in user_stats
        const { error: statsTimeError } = await supabase
          .from('user_stats')
          .update({ time_mode_best_score: parseInt(timeMode) })
          .eq('user_id', selectedUserId);
        if (statsTimeError) throw statsTimeError;
      }

      // Update multiplayer wins in user_stats
      if (duelWins && duelWins.trim() !== '') {
        const { error: winsError } = await supabase
          .from('user_stats')
          .upsert({
            user_id: selectedUserId,
            multiplayer_wins: parseInt(duelWins)
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          });

        if (winsError) throw winsError;
      }

      toast({
        title: 'Erfolg',
        description: 'Benutzerprofil wurde erfolgreich gespeichert',
      });

      // Clear form
      setStreak('');
      setTimeMode('');
      setDuelWins('');
      setSelectedUserId('');
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Profil konnte nicht aktualisiert werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profil Bearbeiten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="user-select">Benutzer auswählen</Label>
          <Select 
            value={selectedUserId} 
            onValueChange={(value) => {
              setSelectedUserId(value);
              loadUserStats(value);
            }}
          >
            <SelectTrigger id="user-select">
              <SelectValue placeholder="Benutzer wählen..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  {user.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedUserId && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="streak">Beste Streak</Label>
                <Input
                  id="streak"
                  type="number"
                  value={streak}
                  onChange={(e) => setStreak(e.target.value)}
                  placeholder="z.B. 50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-mode">Zeitmodus (Sekunden)</Label>
                <Input
                  id="time-mode"
                  type="number"
                  value={timeMode}
                  onChange={(e) => setTimeMode(e.target.value)}
                  placeholder="z.B. 600"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="duel-wins">Duelle gewonnen</Label>
                <Input
                  id="duel-wins"
                  type="number"
                  value={duelWins}
                  onChange={(e) => setDuelWins(e.target.value)}
                  placeholder="z.B. 10"
                />
              </div>
            </div>

            <Button onClick={updateUserProfile} disabled={loading} className="w-full">
              Profil speichern
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}