import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Settings, ArrowLeft, Trash2, Plus, Trophy, Ban, ShieldCheck, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import AdminProfileManager from './AdminProfileManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState<'info' | 'warning' | 'error'>('info');
  const [loading, setLoading] = useState(false);
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [deleteScoreId, setDeleteScoreId] = useState<string | null>(null);
  const [addScoreMode, setAddScoreMode] = useState<string | null>(null);
  const [newScoreUserId, setNewScoreUserId] = useState('');
  const [newScoreValue, setNewScoreValue] = useState('');
  const [selectedLeaderboardMode, setSelectedLeaderboardMode] = useState('all');

  useEffect(() => {
    fetchUsers();
    fetchSystemSettings();
    fetchLeaderboards();
  }, [selectedLeaderboardMode]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
  };


  const fetchLeaderboards = async () => {
    let query = supabase
      .from('leaderboards')
      .select('*, profiles(username)');
    
    if (selectedLeaderboardMode !== 'all') {
      query = query.eq('game_mode', selectedLeaderboardMode);
    }
    
    const { data } = await query.order('score', { ascending: selectedLeaderboardMode === 'timed' });
    
    if (data) setLeaderboards(data);
  };

  const fetchSystemSettings = async () => {
    const { data: maintenanceData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single();

    if (maintenanceData) {
      const maintenance = maintenanceData.value as any;
      setMaintenanceMode(maintenance.enabled);
      setMaintenanceMessage(maintenance.message);
    }

    const { data: bannerData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'banner')
      .single();

    if (bannerData) {
      const banner = bannerData.value as any;
      setBannerEnabled(banner.enabled);
      setBannerMessage(banner.message);
      setBannerType(banner.type);
    }
  };

  const logAction = async (action: string, details?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('admin_logs')
      .insert({
        admin_id: user.id,
        action,
        details
      });
  };

  const updateMaintenanceMode = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          value: {
            enabled: maintenanceMode,
            message: maintenanceMessage
          }
        })
        .eq('key', 'maintenance_mode');

      if (error) throw error;

      await logAction('maintenance_mode_updated', { enabled: maintenanceMode, message: maintenanceMessage });

      toast({
        title: 'Erfolg',
        description: 'Wartungsmodus aktualisiert',
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Wartungsmodus konnte nicht aktualisiert werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBanner = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          value: {
            enabled: bannerEnabled,
            message: bannerMessage,
            type: bannerType
          }
        })
        .eq('key', 'banner');

      if (error) throw error;

      await logAction('banner_updated', { enabled: bannerEnabled, message: bannerMessage, type: bannerType });

      toast({
        title: 'Erfolg',
        description: 'Banner aktualisiert',
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Banner konnte nicht aktualisiert werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserUsername) {
      toast({
        title: 'Fehler',
        description: 'Bitte alle Felder ausfüllen',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            username: newUserUsername
          }
        }
      });

      if (error) throw error;

      await logAction('user_created', { email: newUserEmail, username: newUserUsername });

      toast({
        title: 'Erfolg',
        description: 'Benutzer erstellt',
      });

      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserUsername('');
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Benutzer konnte nicht erstellt werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      await logAction('user_deleted', { userId });

      toast({
        title: 'Erfolg',
        description: 'Benutzer gelöscht',
      });

      fetchUsers();
      setDeleteUserId(null);
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Benutzer konnte nicht gelöscht werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBanUser = async (userId: string, currentBanStatus: boolean, username: string) => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          banned: !currentBanStatus,
          banned_at: !currentBanStatus ? new Date().toISOString() : null,
          banned_by: !currentBanStatus ? currentUser.id : null,
          ban_reason: !currentBanStatus ? 'Gebannt durch Admin' : null
        })
        .eq('user_id', userId);

      if (error) throw error;

      await logAction(currentBanStatus ? 'user_unbanned' : 'user_banned', { userId, username });

      toast({
        title: 'Erfolg',
        description: currentBanStatus ? `${username} wurde entbannt` : `${username} wurde gebannt`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Benutzer-Status konnte nicht geändert werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetLeaderboard = async () => {
    setLoading(true);
    try {
      let query = supabase.from('leaderboards').delete();
      
      if (selectedLeaderboardMode !== 'all') {
        query = query.eq('game_mode', selectedLeaderboardMode);
      }
      
      const { error } = await query.neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      await logAction('leaderboard_reset', { mode: selectedLeaderboardMode });

      toast({
        title: 'Erfolg',
        description: selectedLeaderboardMode === 'all' 
          ? 'Gesamtes Leaderboard zurückgesetzt' 
          : `Leaderboard für ${selectedLeaderboardMode} zurückgesetzt`,
      });

      fetchLeaderboards();
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Leaderboard konnte nicht zurückgesetzt werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteScore = async (scoreId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('leaderboards')
        .delete()
        .eq('id', scoreId);

      if (error) throw error;

      await logAction('score_deleted', { scoreId });

      toast({
        title: 'Erfolg',
        description: 'Score gelöscht',
      });

      fetchLeaderboards();
      setDeleteScoreId(null);
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Score konnte nicht gelöscht werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addScore = async () => {
    if (!addScoreMode || !newScoreUserId || !newScoreValue) {
      toast({
        title: 'Fehler',
        description: 'Bitte alle Felder ausfüllen',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('upsert_leaderboard_score', {
        p_user_id: newScoreUserId,
        p_game_mode: addScoreMode,
        p_score: parseInt(newScoreValue),
        p_details: {}
      });

      if (error) throw error;

      await logAction('score_added', { mode: addScoreMode, userId: newScoreUserId, score: newScoreValue });

      toast({
        title: 'Erfolg',
        description: 'Score hinzugefügt',
      });

      setAddScoreMode(null);
      setNewScoreUserId('');
      setNewScoreValue('');
      fetchLeaderboards();
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Score konnte nicht hinzugefügt werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={onBack} variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Einstellungen
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Benutzer
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            {/* Maintenance Mode */}
            <Card>
              <CardHeader>
                <CardTitle>Wartungsmodus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance">Wartungsmodus aktivieren</Label>
                  <Switch
                    id="maintenance"
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-message">Nachricht</Label>
                  <Textarea
                    id="maintenance-message"
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="Wartungsnachricht..."
                  />
                </div>
                <Button onClick={updateMaintenanceMode} disabled={loading}>
                  Speichern
                </Button>
              </CardContent>
            </Card>

            {/* Banner Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Banner Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="banner">Banner aktivieren</Label>
                  <Switch
                    id="banner"
                    checked={bannerEnabled}
                    onCheckedChange={setBannerEnabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banner-type">Typ</Label>
                  <Select value={bannerType} onValueChange={(value: any) => setBannerType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warnung</SelectItem>
                      <SelectItem value="error">Fehler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banner-message">Nachricht</Label>
                  <Input
                    id="banner-message"
                    value={bannerMessage}
                    onChange={(e) => setBannerMessage(e.target.value)}
                    placeholder="Banner Nachricht..."
                  />
                </div>
                <Button onClick={updateBanner} disabled={loading}>
                  Speichern
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <AdminProfileManager />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {/* Create User Form */}
            <Card>
              <CardHeader>
                <CardTitle>Neuen Benutzer erstellen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-email">E-Mail</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="benutzer@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-username">Benutzername</Label>
                    <Input
                      id="new-username"
                      value={newUserUsername}
                      onChange={(e) => setNewUserUsername(e.target.value)}
                      placeholder="benutzername"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Passwort</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <Button onClick={createUser} disabled={loading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Benutzer erstellen
                </Button>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle>Registrierte Benutzer ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {user.username}
                          {user.banned && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                              Gebannt
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Registriert: {new Date(user.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={user.banned ? "outline" : "secondary"}
                          size="sm"
                          onClick={() => toggleBanUser(user.user_id, user.banned, user.username)}
                        >
                          {user.banned ? (
                            <>
                              <ShieldCheck className="h-4 w-4 mr-1" />
                              Entbannen
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4 mr-1" />
                              Bannen
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteUserId(user.user_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            {/* Mode Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedLeaderboardMode === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedLeaderboardMode('all')}
                    size="sm"
                  >
                    Alle Modi
                  </Button>
                  <Button
                    variant={selectedLeaderboardMode === 'timed' ? 'default' : 'outline'}
                    onClick={() => setSelectedLeaderboardMode('timed')}
                    size="sm"
                  >
                    Zeitmodus
                  </Button>
                  <Button
                    variant={selectedLeaderboardMode === 'speedrush_30s' ? 'default' : 'outline'}
                    onClick={() => setSelectedLeaderboardMode('speedrush_30s')}
                    size="sm"
                  >
                    Speed Rush 30s
                  </Button>
                  <Button
                    variant={selectedLeaderboardMode === 'speedrush_1m' ? 'default' : 'outline'}
                    onClick={() => setSelectedLeaderboardMode('speedrush_1m')}
                    size="sm"
                  >
                    Speed Rush 1min
                  </Button>
                  <Button
                    variant={selectedLeaderboardMode === 'speedrush_5m' ? 'default' : 'outline'}
                    onClick={() => setSelectedLeaderboardMode('speedrush_5m')}
                    size="sm"
                  >
                    Speed Rush 5min
                  </Button>
                  <Button
                    variant={selectedLeaderboardMode === 'speedrush_10m' ? 'default' : 'outline'}
                    onClick={() => setSelectedLeaderboardMode('speedrush_10m')}
                    size="sm"
                  >
                    Speed Rush 10min
                  </Button>
                  <Button
                    variant={selectedLeaderboardMode === 'streak' ? 'default' : 'outline'}
                    onClick={() => setSelectedLeaderboardMode('streak')}
                    size="sm"
                  >
                    Streak
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Display */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedLeaderboardMode === 'all' 
                      ? 'Alle Leaderboards' 
                      : `Leaderboard: ${selectedLeaderboardMode}`}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setAddScoreMode(selectedLeaderboardMode === 'all' ? 'timed' : selectedLeaderboardMode)}
                      disabled={loading || selectedLeaderboardMode === 'all'}
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Score hinzufügen
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={resetLeaderboard} 
                      disabled={loading}
                      size="sm"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {selectedLeaderboardMode === 'all' ? 'Alles' : 'Modus'} zurücksetzen
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboards.map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg hover:from-primary/10 transition-all cursor-pointer group"
                      onClick={() => setDeleteScoreId(entry.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-lg">{(entry.profiles as any)?.username || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.game_mode === 'timed' && 'Zeitmodus'}
                            {entry.game_mode === 'speedrush_30s' && 'Speed Rush 30s'}
                            {entry.game_mode === 'speedrush_1m' && 'Speed Rush 1min'}
                            {entry.game_mode === 'speedrush_5m' && 'Speed Rush 5min'}
                            {entry.game_mode === 'speedrush_10m' && 'Speed Rush 10min'}
                            {entry.game_mode === 'streak' && 'Streak'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {entry.game_mode === 'timed' 
                              ? `${Math.floor(entry.score / 60)}:${(entry.score % 60).toString().padStart(2, '0')}`
                              : entry.score
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.game_mode === 'timed' ? 'Minuten' : 'Punkte'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteScoreId(entry.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {leaderboards.length === 0 && (
                    <div className="text-center py-12">
                      <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Keine Einträge vorhanden</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Delete User Confirmation Dialog */}
        <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Benutzer löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Aktion kann nicht rückgängig gemacht werden. Der Benutzer und alle zugehörigen Daten werden permanent gelöscht.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteUserId && deleteUser(deleteUserId)}>
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Score Confirmation Dialog */}
        <AlertDialog open={!!deleteScoreId} onOpenChange={() => setDeleteScoreId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Score löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Möchtest du diesen Leaderboard-Eintrag wirklich löschen?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteScoreId && deleteScore(deleteScoreId)}>
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Score Dialog */}
        <AlertDialog open={!!addScoreMode} onOpenChange={() => setAddScoreMode(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Score hinzufügen - {addScoreMode}</AlertDialogTitle>
              <AlertDialogDescription>
                Füge einen neuen Score für den ausgewählten Modus hinzu.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="score-user">Benutzer</Label>
                <Select value={newScoreUserId} onValueChange={setNewScoreUserId}>
                  <SelectTrigger id="score-user">
                    <SelectValue placeholder="Benutzer auswählen" />
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
              <div className="space-y-2">
                <Label htmlFor="score-value">
                  {addScoreMode === 'timed' ? 'Zeit (in Sekunden)' : 'Punkte'}
                </Label>
                <Input
                  id="score-value"
                  type="number"
                  value={newScoreValue}
                  onChange={(e) => setNewScoreValue(e.target.value)}
                  placeholder={addScoreMode === 'timed' ? 'z.B. 120 für 2 Minuten' : 'z.B. 50'}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={addScore}>
                Hinzufügen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
