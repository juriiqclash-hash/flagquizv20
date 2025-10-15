import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Plus, Search, Users, Crown, Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { PublicProfileView } from './PublicProfileView';

const STARTER_CLANS = [
  { name: 'Agharta', emoji: '🏯', description: 'Die geheime unterirdische Stadt, Sitz der Weisheit und des Lichts' },
  { name: 'Shambhala', emoji: '☀️', description: 'Das mystische Königreich des Friedens und der Erleuchtung' },
  { name: 'Atlantis', emoji: '💎', description: 'Die versunkene Hochkultur der Antike, reich an Wissen und Macht' },
  { name: 'Lemuria', emoji: '🌺', description: 'Das verlorene Paradies im Pazifik, Heimat einer spirituellen Zivilisation' },
  { name: 'Mu', emoji: '🌀', description: 'Der vergessene Kontinent, Wiege uralter Mysterien' },
  { name: 'Hyperborea', emoji: '🩵', description: 'Das nordische Paradies jenseits des Nordwinds' },
  { name: 'Avalon', emoji: '🌸', description: 'Die magische Insel der Legenden, Ruhestätte König Artus' },
  { name: 'Thule', emoji: '🧭', description: 'Das sagenhafte Land am Rande der bekannten Welt' },
  { name: 'El Dorado', emoji: '🪙', description: 'Die goldene Stadt der Schätze und Legenden' },
  { name: 'Agni Order', emoji: '🔥', description: 'Der Orden des heiligen Feuers und der Transformation' },
];

interface ClansMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Clan {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  avatar_url: string | null;
  created_by: string;
  created_at: string;
  member_count: number;
}

interface ClanMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  clan_id: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

export function ClansMenu({ open, onOpenChange }: ClansMenuProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [allClans, setAllClans] = useState<Clan[]>([]);
  const [myClans, setMyClans] = useState<Clan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [clanMembers, setClanMembers] = useState<ClanMember[]>([]);
  
  // Create clan form
  const [clanName, setClanName] = useState('');
  const [clanEmoji, setClanEmoji] = useState('🛡️');
  const [clanDescription, setClanDescription] = useState('');
  const [clanAvatar, setClanAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (open && user) {
      loadClans();
    }
  }, [open, user]);

  useEffect(() => {
    if (myClans.length > 0) {
      setActiveTab("my");
    }
  }, [myClans]);

  const loadClans = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Load all clans with member count
      const { data: clansData, error: clansError } = await supabase
        .from('clans')
        .select('*')
        .order('created_at', { ascending: false });

      if (clansError) throw clansError;

      // Get member counts for each clan
      const clansWithCounts = await Promise.all(
        (clansData || []).map(async (clan: any) => {
          const { count } = await supabase
            .from('clan_members' as any)
            .select('*', { count: 'exact', head: true })
            .eq('clan_id', clan.id);

          return {
            ...clan,
            description: clan.description || null,
            avatar_url: clan.avatar_url || null,
            member_count: count || 0,
          };
        })
      );

      // Add starter clans with 0 member count
      const starterClansWithCounts = STARTER_CLANS.map(clan => ({
        id: `starter-${clan.name}`,
        name: clan.name,
        emoji: clan.emoji,
        description: clan.description,
        avatar_url: null,
        created_by: 'system',
        created_at: new Date().toISOString(),
        member_count: 0,
        is_starter: true,
      }));

      setAllClans([...clansWithCounts, ...starterClansWithCounts]);

      // Load user's clans
      const { data: memberData, error: memberError } = await supabase
        .from('clan_members' as any)
        .select('clan_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const userClanIds = (memberData as any)?.map((m: any) => m.clan_id) || [];
      const userClans = clansWithCounts.filter(c => userClanIds.includes(c.id));
      setMyClans(userClans);
    } catch (error) {
      console.error('Error loading clans:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Clans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fehler",
          description: "Datei ist zu groß. Maximal 5MB erlaubt.",
          variant: "destructive",
        });
        return;
      }
      setClanAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateClan = async () => {
    if (!user) return;
    if (!clanName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Clan-Namen ein",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = null;

      // Upload avatar if selected
      if (clanAvatar) {
        const fileExt = clanAvatar.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('clan-avatars')
          .upload(fileName, clanAvatar);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('clan-avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      // Create clan
      const { data: newClan, error: clanError } = await supabase
        .from('clans')
        .insert({
          name: clanName,
          emoji: clanEmoji,
          description: clanDescription || null,
          avatar_url: avatarUrl,
          created_by: user.id,
        })
        .select()
        .single();

      if (clanError) throw clanError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('clan_members' as any)
        .insert({
          clan_id: newClan.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      toast({
        title: "Erfolg",
        description: "Clan erfolgreich erstellt!",
      });
      setCreateDialogOpen(false);
      resetCreateForm();
      loadClans();
    } catch (error) {
      console.error('Error creating clan:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen des Clans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setClanName('');
    setClanEmoji('🛡️');
    setClanDescription('');
    setClanAvatar(null);
    setAvatarPreview(null);
  };

  const handleClanClick = async (clan: Clan) => {
    setSelectedClan(clan);
    setDetailDialogOpen(true);

    // Load clan members
    const { data: membersData, error } = await supabase
      .from('clan_members' as any)
      .select(`
        id,
        user_id,
        role,
        joined_at,
        clan_id
      `)
      .eq('clan_id', clan.id)
      .order('joined_at', { ascending: true });

    if (!error && membersData) {
      // Fetch profiles for all members
      const userIds = (membersData as any[]).map((m: any) => m.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .in('user_id', userIds);

      const membersWithProfiles = (membersData as any[]).map((member: any) => {
        const profile = (profilesData as any[] || []).find((p: any) => p.user_id === member.user_id);
        return {
          ...member,
          profiles: profile,
        };
      });

      setClanMembers(membersWithProfiles);
    }
  };

  useEffect(() => {
    if (myClans.length > 0) {
      myClans.forEach(clan => {
        loadClanMembers(clan.id);
      });
    }
  }, [myClans]);

  const loadClanMembers = async (clanId: string) => {
    const { data: membersData, error } = await supabase
      .from('clan_members' as any)
      .select(`
        id,
        user_id,
        role,
        joined_at,
        clan_id
      `)
      .eq('clan_id', clanId)
      .order('joined_at', { ascending: true });

    if (!error && membersData) {
      const userIds = (membersData as any[]).map((m: any) => m.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .in('user_id', userIds);

      const membersWithProfiles = (membersData as any[]).map((member: any) => {
        const profile = (profilesData as any[] || []).find((p: any) => p.user_id === member.user_id);
        return {
          ...member,
          profiles: profile,
        };
      });

      setClanMembers(prev => [
        ...prev.filter(m => m.clan_id !== clanId),
        ...membersWithProfiles
      ]);
    }
  };

  const handleJoinClan = async (clanId: string) => {
    if (!user) return;

    // Don't allow joining starter clans
    if (clanId.startsWith('starter-')) {
      toast({
        title: "Info",
        description: "Dies ist ein Starter-Clan. Du kannst ihn nur über dein Profil auswählen.",
      });
      return;
    }

    try {
      // Check if already member
      const { data: existing } = await supabase
        .from('clan_members' as any)
        .select('id')
        .eq('clan_id', clanId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Fehler",
          description: "Du bist bereits Mitglied dieses Clans",
          variant: "destructive",
        });
        return;
      }

      // Check member limit
      const { count } = await supabase
        .from('clan_members' as any)
        .select('*', { count: 'exact', head: true })
        .eq('clan_id', clanId);

      if (count && count >= 30) {
        toast({
          title: "Fehler",
          description: "Clan ist voll (30/30 Mitglieder)",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('clan_members' as any)
        .insert({
          clan_id: clanId,
          user_id: user.id,
          role: 'member',
        });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Erfolgreich dem Clan beigetreten!",
      });
      loadClans();
      setDetailDialogOpen(false);
    } catch (error) {
      console.error('Error joining clan:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Beitreten",
        variant: "destructive",
      });
    }
  };

  const handleLeaveClan = async (clanId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('clan_members' as any)
        .delete()
        .eq('clan_id', clanId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Clan verlassen",
      });
      loadClans();
      setDetailDialogOpen(false);
    } catch (error) {
      console.error('Error leaving clan:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Verlassen",
        variant: "destructive",
      });
    }
  };

  const filteredClans = allClans.filter(clan =>
    clan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clan.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isMember = (clanId: string) => myClans.some(c => c.id === clanId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Clans
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my">Mein Clan</TabsTrigger>
              <TabsTrigger value="all">Alle Clans</TabsTrigger>
            </TabsList>

            <TabsContent value="my" className="flex-1 overflow-y-auto mt-4">
              {myClans.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">Du bist noch in keinem Clan</p>
                  <Button
                    onClick={() => setActiveTab("all")}
                    variant="outline"
                  >
                    Clan suchen
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {myClans.map((clan) => (
                    <div key={clan.id} className="space-y-4">
                      <Card className="p-6">
                        <div className="flex items-start gap-6">
                          <div className="flex items-start gap-6 flex-1">
                            <Avatar className="h-24 w-24 border-4 border-primary shadow-lg">
                              <AvatarImage src={clan.avatar_url || undefined} />
                              <AvatarFallback className="text-5xl">{clan.emoji}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 max-w-[50%]">
                              <h2 className="text-3xl font-bold mb-2">{clan.name}</h2>
                              {clan.description && (
                                <p className="text-muted-foreground">{clan.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex-1"></div>
                        </div>
                      </Card>

                      <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold flex items-center gap-2 text-lg">
                            <Users className="h-5 w-5" />
                            Mitglieder
                          </h3>
                          <span className="text-sm text-muted-foreground">
                            {clan.member_count}/30
                          </span>
                        </div>
                        <div className="space-y-2">
                          {clanMembers.filter(m => m.clan_id === clan.id).length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </div>
                          ) : (
                            clanMembers.filter(m => m.clan_id === clan.id).map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                                onClick={() => {
                                  setSelectedUserId(member.user_id);
                                  onOpenChange(false);
                                }}
                              >
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={member.profiles?.avatar_url || undefined} />
                                  <AvatarFallback>
                                    {member.profiles?.username?.[0]?.toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium">{member.profiles?.username || 'Unbekannt'}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Beigetreten: {new Date(member.joined_at).toLocaleDateString('de-DE')}
                                  </p>
                                </div>
                                {member.role === 'owner' && (
                                  <Crown className="h-5 w-5 text-yellow-500" />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex justify-end pt-4 border-t mt-4">
                          <Button
                            variant="destructive"
                            onClick={() => handleLeaveClan(clan.id)}
                          >
                            Clan verlassen
                          </Button>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="flex-1 overflow-y-auto mt-4">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Clan suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erstellen
                </Button>
              </div>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredClans.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Keine Clans gefunden</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredClans.map((clan) => (
                    <Card
                      key={clan.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => handleClanClick(clan)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={clan.avatar_url || undefined} />
                            <AvatarFallback>{clan.emoji}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{clan.name}</h3>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{clan.member_count}/30 Mitglieder</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Create Clan Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Neuen Clan erstellen</DialogTitle>
            <DialogDescription>
              Erstelle einen Clan und lade bis zu 30 Mitglieder ein
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="text-3xl">{clanEmoji}</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Emoji</label>
                <Input
                  value={clanEmoji}
                  onChange={(e) => setClanEmoji(e.target.value)}
                  maxLength={2}
                  className="text-2xl text-center"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Clan Name *</label>
              <Input
                value={clanName}
                onChange={(e) => setClanName(e.target.value)}
                placeholder="z.B. Die Unbesiegbaren"
                maxLength={50}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Beschreibung</label>
              <Textarea
                value={clanDescription}
                onChange={(e) => setClanDescription(e.target.value)}
                placeholder="Beschreibe deinen Clan..."
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {clanDescription.length}/500
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateClan} disabled={loading || !clanName.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Erstellen'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clan Details Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedClan && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedClan.avatar_url || undefined} />
                    <AvatarFallback className="text-3xl">{selectedClan.emoji}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl">{selectedClan.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedClan.member_count}/30 Mitglieder
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {selectedClan.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Beschreibung</h3>
                    <p className="text-sm text-muted-foreground">{selectedClan.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Mitglieder ({clanMembers.length})</h3>
                  <div className="space-y-2">
                    {clanMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedUserId(member.user_id);
                          setDetailDialogOpen(false);
                        }}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.profiles?.avatar_url || undefined} />
                          <AvatarFallback>
                            {member.profiles?.username?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{member.profiles?.username || 'Unbekannt'}</p>
                          <p className="text-xs text-muted-foreground">
                            Beigetreten: {new Date(member.joined_at).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        {member.role === 'owner' && (
                          <Crown className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  {selectedClan.id.startsWith('starter-') ? (
                    <p className="text-sm text-muted-foreground">
                      Starter-Clans können über das Profil ausgewählt werden
                    </p>
                  ) : isMember(selectedClan.id) ? (
                    <Button
                      variant="destructive"
                      onClick={() => handleLeaveClan(selectedClan.id)}
                    >
                      Clan verlassen
                    </Button>
                  ) : selectedClan.member_count < 30 ? (
                    <Button onClick={() => handleJoinClan(selectedClan.id)}>
                      Clan beitreten
                    </Button>
                  ) : (
                    <Button disabled>Clan ist voll</Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <PublicProfileView
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </>
  );
}
