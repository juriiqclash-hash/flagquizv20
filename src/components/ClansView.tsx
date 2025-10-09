import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Shield, Plus, Users, Crown, Loader2, Trash2, LogOut, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface Clan {
  id: string;
  name: string;
  description: string;
  profile_image_url?: string;
  owner_id: string;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
  user_role?: string;
}

interface ClanMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user_profile?: {
    username: string;
    avatar_url?: string;
    total_xp: number;
  };
}

export default function ClansView() {
  const { user } = useAuth();
  const [clans, setClans] = useState<Clan[]>([]);
  const [myClan, setMyClan] = useState<Clan | null>(null);
  const [clanMembers, setClanMembers] = useState<ClanMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClanName, setNewClanName] = useState('');
  const [newClanDescription, setNewClanDescription] = useState('');
  const [newClanImage, setNewClanImage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      loadClans();
      loadMyClan();
    }
  }, [user]);

  const loadClans = async () => {
    try {
      const { data: clansData, error } = await supabase
        .from('clans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (clansData) {
        const clansWithCounts = await Promise.all(
          clansData.map(async (clan) => {
            const { count } = await supabase
              .from('clan_members')
              .select('*', { count: 'exact', head: true })
              .eq('clan_id', clan.id);

            const { data: memberData } = await supabase
              .from('clan_members')
              .select('id, role')
              .eq('clan_id', clan.id)
              .eq('user_id', user?.id)
              .maybeSingle();

            return {
              ...clan,
              member_count: count || 0,
              is_member: !!memberData,
              user_role: memberData?.role
            };
          })
        );
        setClans(clansWithCounts);
      }
    } catch (error) {
      console.error('Error loading clans:', error);
      toast.error('Fehler beim Laden der Clans');
    } finally {
      setLoading(false);
    }
  };

  const loadMyClan = async () => {
    try {
      const { data: memberData } = await supabase
        .from('clan_members')
        .select('clan_id, role')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (memberData) {
        const { data: clanData } = await supabase
          .from('clans')
          .select('*')
          .eq('id', memberData.clan_id)
          .maybeSingle();

        if (clanData) {
          const { count } = await supabase
            .from('clan_members')
            .select('*', { count: 'exact', head: true })
            .eq('clan_id', clanData.id);

          setMyClan({
            ...clanData,
            member_count: count || 0,
            is_member: true,
            user_role: memberData.role
          });

          loadClanMembers(clanData.id);
        }
      }
    } catch (error) {
      console.error('Error loading my clan:', error);
    }
  };

  const loadClanMembers = async (clanId: string) => {
    try {
      const { data, error } = await supabase
        .from('clan_members')
        .select('*, user_profile:user_profiles(username, avatar_url, total_xp)')
        .eq('clan_id', clanId)
        .order('role', { ascending: true });

      if (!error && data) {
        setClanMembers(data as any);
      }
    } catch (error) {
      console.error('Error loading clan members:', error);
    }
  };

  const createClan = async () => {
    if (!newClanName.trim()) {
      toast.error('Bitte gib einen Clan-Namen ein');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('clans')
        .insert({
          name: newClanName,
          description: newClanDescription,
          profile_image_url: newClanImage || null,
          owner_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Clan erfolgreich erstellt!');
      setCreateDialogOpen(false);
      setNewClanName('');
      setNewClanDescription('');
      setNewClanImage('');
      loadClans();
      loadMyClan();
    } catch (error: any) {
      console.error('Error creating clan:', error);
      if (error.code === '23505') {
        toast.error('Ein Clan mit diesem Namen existiert bereits');
      } else {
        toast.error('Fehler beim Erstellen des Clans');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const joinClan = async (clanId: string) => {
    try {
      const { error } = await supabase
        .from('clan_members')
        .insert({
          clan_id: clanId,
          user_id: user?.id,
          role: 'member'
        });

      if (error) throw error;

      toast.success('Du bist dem Clan beigetreten!');
      loadClans();
      loadMyClan();
    } catch (error: any) {
      console.error('Error joining clan:', error);
      if (error.message.includes('maximum member limit')) {
        toast.error('Clan hat die maximale Mitgliederanzahl erreicht (30)');
      } else if (error.code === '23505') {
        toast.error('Du bist bereits Mitglied dieses Clans');
      } else {
        toast.error('Fehler beim Beitreten des Clans');
      }
    }
  };

  const leaveClan = async () => {
    if (!myClan) return;

    try {
      const { error } = await supabase
        .from('clan_members')
        .delete()
        .eq('clan_id', myClan.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success('Du hast den Clan verlassen');
      setMyClan(null);
      setClanMembers([]);
      loadClans();
    } catch (error) {
      console.error('Error leaving clan:', error);
      toast.error('Fehler beim Verlassen des Clans');
    }
  };

  const deleteClan = async () => {
    if (!myClan || myClan.owner_id !== user?.id) return;

    if (!confirm('Möchtest du den Clan wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clans')
        .delete()
        .eq('id', myClan.id);

      if (error) throw error;

      toast.success('Clan wurde gelöscht');
      setMyClan(null);
      setClanMembers([]);
      loadClans();
    } catch (error) {
      console.error('Error deleting clan:', error);
      toast.error('Fehler beim Löschen des Clans');
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('clan_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Mitglied entfernt');
      if (myClan) {
        loadClanMembers(myClan.id);
      }
      loadClans();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Fehler beim Entfernen des Mitglieds');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Clans</h1>
        {!myClan && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Clan erstellen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen Clan erstellen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clan-name">Clan-Name</Label>
                  <Input
                    id="clan-name"
                    placeholder="Gib einen Namen ein..."
                    value={newClanName}
                    onChange={(e) => setNewClanName(e.target.value)}
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label htmlFor="clan-description">Beschreibung</Label>
                  <Textarea
                    id="clan-description"
                    placeholder="Beschreibe deinen Clan..."
                    value={newClanDescription}
                    onChange={(e) => setNewClanDescription(e.target.value)}
                    maxLength={500}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="clan-image">Profilbild URL (optional)</Label>
                  <Input
                    id="clan-image"
                    placeholder="https://example.com/image.png"
                    value={newClanImage}
                    onChange={(e) => setNewClanImage(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={createClan} disabled={isCreating}>
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Erstellen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue={myClan ? "my-clan" : "all-clans"} className="w-full">
        <TabsList className={`grid w-full ${myClan ? 'grid-cols-2' : 'grid-cols-1'} mb-6`}>
          {myClan && <TabsTrigger value="my-clan">Mein Clan</TabsTrigger>}
          <TabsTrigger value="all-clans">Alle Clans</TabsTrigger>
        </TabsList>

        {myClan && (
          <TabsContent value="my-clan">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={myClan.profile_image_url} />
                      <AvatarFallback>
                        <Shield className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl">{myClan.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {myClan.description || 'Keine Beschreibung'}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          <Users className="h-3 w-3 mr-1" />
                          {myClan.member_count}/30
                        </Badge>
                        {myClan.user_role === 'owner' && (
                          <Badge variant="default">
                            <Crown className="h-3 w-3 mr-1" />
                            Owner
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {myClan.user_role === 'owner' ? (
                      <Button variant="destructive" size="sm" onClick={deleteClan}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clan löschen
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={leaveClan}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Verlassen
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-3">Mitglieder ({clanMembers.length}/30)</h3>
                <div className="space-y-2">
                  {clanMembers.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.user_profile?.avatar_url} />
                            <AvatarFallback>
                              {member.user_profile?.username?.[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">
                              {member.user_profile?.username}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.user_profile?.total_xp || 0} XP
                            </p>
                          </div>
                          {member.role === 'owner' && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        {myClan.user_role === 'owner' && member.role !== 'owner' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="all-clans">
          <div className="space-y-4">
            {clans.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Noch keine Clans vorhanden. Erstelle den ersten Clan!
                </CardContent>
              </Card>
            ) : (
              clans.map((clan) => (
                <Card key={clan.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={clan.profile_image_url} />
                          <AvatarFallback>
                            <Shield className="h-8 w-8" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg">{clan.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {clan.description || 'Keine Beschreibung'}
                          </p>
                          <Badge variant="secondary">
                            <Users className="h-3 w-3 mr-1" />
                            {clan.member_count}/30
                          </Badge>
                        </div>
                      </div>
                      {!clan.is_member && !myClan && (
                        <Button
                          onClick={() => joinClan(clan.id)}
                          disabled={clan.member_count >= 30}
                        >
                          Beitreten
                        </Button>
                      )}
                      {clan.is_member && (
                        <Badge>Mitglied</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
