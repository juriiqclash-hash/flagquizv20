import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Plus, Search, Users, Crown, Loader2, Upload, Trophy, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { PublicProfileView } from './PublicProfileView';
import { getRankFromLevel } from '@/lib/rankSystem';
import { FriendInviteDialog } from './FriendInviteDialog';
import { ClanMemberContextMenu } from './ClanMemberContextMenu';
import AuthForm from './AuthForm';

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
  average_rank?: string;
  average_rank_image?: string;
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
  level?: number;
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingClan, setEditingClan] = useState<Clan | null>(null);
  const [editClanName, setEditClanName] = useState('');
  const [editClanEmoji, setEditClanEmoji] = useState('');
  const [editClanDescription, setEditClanDescription] = useState('');
  const [editClanAvatar, setEditClanAvatar] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

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

          // Get member levels to calculate average rank
          const { data: membersData } = await supabase
            .from('clan_members' as any)
            .select('user_id')
            .eq('clan_id', clan.id);

          let averageRank = '';
          let averageRankImage = '';

          if (membersData && membersData.length > 0) {
            const userIds = membersData.map((m: any) => m.user_id);
            const { data: statsData } = await supabase
              .from('user_stats')
              .select('level')
              .in('user_id', userIds);

            if (statsData && statsData.length > 0) {
              const totalLevel = statsData.reduce((sum, stat) => sum + stat.level, 0);
              const averageLevel = Math.round(totalLevel / statsData.length);
              const rank = getRankFromLevel(averageLevel);
              averageRank = rank.name;
              averageRankImage = rank.image;
            }
          }

          return {
            ...clan,
            description: clan.description || null,
            avatar_url: clan.avatar_url || null,
            member_count: count || 0,
            average_rank: averageRank,
            average_rank_image: averageRankImage,
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

      // Add creator as leader
      const { error: memberError } = await supabase
        .from('clan_members' as any)
        .insert({
          clan_id: newClan.id,
          user_id: user.id,
          role: 'leader',
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

    // Load ONLY this clan's members
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

      // Set ONLY these members, clearing previous
      setClanMembers(membersWithProfiles);
    } else {
      // Clear members if error or no data
      setClanMembers([]);
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

      // Replace members for this clan only
      setClanMembers(prev => {
        const otherClanMembers = prev.filter(m => m.clan_id !== clanId);
        return [...otherClanMembers, ...membersWithProfiles];
      });
    }
  };

  const handleEditClan = (clan: Clan) => {
    setEditingClan(clan);
    setEditClanName(clan.name);
    setEditClanEmoji(clan.emoji);
    setEditClanDescription(clan.description || '');
    setEditAvatarPreview(clan.avatar_url);
    setEditDialogOpen(true);
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setEditClanAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async () => {
    if (!user || !editingClan) return;
    if (!editClanName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Clan-Namen ein",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = editingClan.avatar_url;

      // Upload new avatar if selected
      if (editClanAvatar) {
        const fileExt = editClanAvatar.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('clan-avatars')
          .upload(fileName, editClanAvatar);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('clan-avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      // Update clan
      const { error: updateError } = await supabase
        .from('clans')
        .update({
          name: editClanName,
          emoji: editClanEmoji,
          description: editClanDescription || null,
          avatar_url: avatarUrl,
        })
        .eq('id', editingClan.id);

      if (updateError) throw updateError;

      toast({
        title: "Erfolg",
        description: "Clan erfolgreich aktualisiert!",
      });
      setEditDialogOpen(false);
      setEditingClan(null);
      loadClans();
    } catch (error) {
      console.error('Error updating clan:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren des Clans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClan = async (clanId: string) => {
    if (!user) return;
    
    if (!confirm('Möchtest du diesen Clan wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('clans')
        .delete()
        .eq('id', clanId)
        .eq('created_by', user.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Clan erfolgreich gelöscht",
      });
      loadClans();
      setDetailDialogOpen(false);
    } catch (error) {
      console.error('Error deleting clan:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen des Clans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClan = async (clanId: string) => {
    if (!user) return;

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
          role: 'newbie',
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

  const handleKickMember = async (clanId: string, userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('clan_members')
        .delete()
        .eq('clan_id', clanId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Mitglied wurde aus dem Clan entfernt",
      });
      
      loadClanMembers(clanId);
      loadClans();
    } catch (error) {
      console.error('Error kicking member:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Entfernen des Mitglieds",
        variant: "destructive",
      });
    }
  };

  const handleChangeRole = async (clanId: string, userId: string, newRole: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clan_members')
        .update({ role: newRole as 'leader' | 'vice_leader' | 'elite_member' | 'moderator' | 'member' | 'newbie' })
        .eq('clan_id', clanId)
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      // Update local state immediately
      setClanMembers(prev => prev.map(member => 
        member.user_id === userId 
          ? { ...member, role: newRole }
          : member
      ));

      toast({
        title: "Erfolg",
        description: "Rolle wurde erfolgreich geändert",
      });
    } catch (error: any) {
      console.error('Error changing role:', error);
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Ändern der Rolle",
        variant: "destructive",
      });
    }
  };

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
                            <Avatar className="h-40 w-40 border-4 border-primary shadow-lg">
                              <AvatarImage src={clan.avatar_url || undefined} className="object-cover w-full h-full" />
                              <AvatarFallback className="text-7xl">{clan.emoji}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h2 className="text-3xl font-bold mb-2">{clan.name}</h2>
                              {clan.description && (
                                <p className="text-muted-foreground">{clan.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-2 min-w-[120px]">
                            {clan.average_rank && clan.average_rank_image ? (
                              <>
                                <img
                                  src={clan.average_rank_image}
                                  alt={clan.average_rank}
                                  className="w-28 h-28 object-contain"
                                />
                                <p className="text-lg font-bold text-center">{clan.average_rank}</p>
                              </>
                            ) : (
                              <>
                                <div className="relative w-28 h-28 opacity-30 flex items-center justify-center">
                                  <Trophy className="w-20 h-20" />
                                </div>
                                <p className="text-xs text-muted-foreground text-center">Nicht eingestuft</p>
                              </>
                            )}
                          </div>
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
                            clanMembers.filter(m => m.clan_id === clan.id).map((member) => {
                              const currentUserMembership = clanMembers.find(
                                m => m.clan_id === clan.id && m.user_id === user?.id
                              );
                              const currentUserRole = currentUserMembership?.role || 'newbie';

                              return (
                                <ClanMemberContextMenu
                                  key={member.id}
                                  currentUserRole={currentUserRole}
                                  memberRole={member.role}
                                  isCurrentUser={member.user_id === user?.id}
                                  onKick={async () => {
                                    await handleKickMember(clan.id, member.user_id);
                                  }}
                                  onPromote={async (newRole) => {
                                    await handleChangeRole(clan.id, member.user_id, newRole);
                                  }}
                                  onDemote={async (newRole) => {
                                    await handleChangeRole(clan.id, member.user_id, newRole);
                                  }}
                                >
                                  <div
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
                                      <p className="text-xs text-muted-foreground capitalize">
                                        {member.role === 'leader' && '👑 Anführer'}
                                        {member.role === 'vice_leader' && '⭐ Vize-Anführer'}
                                        {member.role === 'elite_member' && '💎 Elite-Member'}
                                        {member.role === 'moderator' && '🛡️ Moderator'}
                                        {member.role === 'member' && '✅ Member'}
                                        {member.role === 'newbie' && '🌱 Neuling'}
                                        {' • '}
                                        {new Date(member.joined_at).toLocaleDateString('de-DE')}
                                      </p>
                                    </div>
                                    {member.role === 'leader' && (
                                      <Crown className="h-5 w-5 text-yellow-500" />
                                    )}
                                  </div>
                                </ClanMemberContextMenu>
                              );
                            })
                        )}
                      </div>
                      <div className="flex justify-between pt-4 border-t mt-4">
                        {clan.created_by === user?.id ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => handleEditClan(clan)}
                            >
                              Bearbeiten
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteClan(clan.id)}
                            >
                              Löschen
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="destructive"
                            onClick={() => handleLeaveClan(clan.id)}
                          >
                            Clan verlassen
                          </Button>
                        )}
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
                <Button onClick={() => {
                  if (!user) {
                    setShowAuthDialog(true);
                  } else {
                    setCreateDialogOpen(true);
                  }
                }}>
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedClan && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  Clan Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="flex items-start gap-6 flex-1">
                      <Avatar className="h-40 w-40 border-4 border-primary shadow-lg">
                        <AvatarImage src={selectedClan.avatar_url || undefined} className="object-cover w-full h-full" />
                        <AvatarFallback className="text-7xl">{selectedClan.emoji}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-2">{selectedClan.name}</h2>
                        {selectedClan.description && (
                          <p className="text-muted-foreground">{selectedClan.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 min-w-[120px]">
                      {selectedClan.average_rank && selectedClan.average_rank_image ? (
                        <>
                          <img
                            src={selectedClan.average_rank_image}
                            alt={selectedClan.average_rank}
                            className="w-28 h-28 object-contain"
                          />
                          <p className="text-lg font-bold text-center">{selectedClan.average_rank}</p>
                        </>
                      ) : (
                        <>
                          <div className="relative w-28 h-28 opacity-30 flex items-center justify-center">
                            <Trophy className="w-20 h-20" />
                          </div>
                          <p className="text-xs text-muted-foreground text-center">Nicht eingestuft</p>
                        </>
                      )}
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5" />
                      Mitglieder
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {selectedClan.member_count}/30
                    </span>
                  </div>
                  <div className="space-y-2">
                    {clanMembers.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Noch keine Mitglieder</p>
                      </div>
                    ) : (
                      clanMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
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
                      ))
                    )}
                  </div>
                  <div className="flex justify-between pt-4 border-t mt-4">
                    {isMember(selectedClan.id) ? (
                      <Button
                        variant="outline"
                        onClick={() => setInviteDialogOpen(true)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Freund einladen
                      </Button>
                    ) : (
                      <div></div>
                    )}
                    {selectedClan.created_by === user?.id ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEditClan(selectedClan)}
                        >
                          Bearbeiten
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteClan(selectedClan.id)}
                        >
                          Löschen
                        </Button>
                      </div>
                    ) : (
                      <>
                        {isMember(selectedClan.id) ? (
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
                      </>
                    )}
                  </div>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Clan Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Clan bearbeiten</DialogTitle>
            <DialogDescription>
              Passe Namen, Emoji, Beschreibung und Avatar an
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 cursor-pointer" onClick={() => editFileInputRef.current?.click()}>
                  <AvatarImage src={editAvatarPreview || undefined} />
                  <AvatarFallback className="text-3xl">{editClanEmoji}</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={() => editFileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditFileSelect}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Emoji</label>
                <Input
                  value={editClanEmoji}
                  onChange={(e) => setEditClanEmoji(e.target.value)}
                  maxLength={2}
                  className="text-2xl text-center"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Clan Name *</label>
              <Input
                value={editClanName}
                onChange={(e) => setEditClanName(e.target.value)}
                placeholder="z.B. Die Unbesiegbaren"
                maxLength={50}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Beschreibung</label>
              <Textarea
                value={editClanDescription}
                onChange={(e) => setEditClanDescription(e.target.value)}
                placeholder="Beschreibe deinen Clan..."
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {editClanDescription.length}/500
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSaveEdit} disabled={loading || !editClanName.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Speichern'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FriendInviteDialog 
        open={inviteDialogOpen} 
        onOpenChange={setInviteDialogOpen}
        type="clan"
        clanId={selectedClan?.id}
      />

      <PublicProfileView
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="max-w-md">
          <AuthForm
            onSuccess={() => {
              setShowAuthDialog(false);
              loadClans();
            }}
            mode="signin"
            message="Um einen Clan zu erstellen, logge dich bitte ein"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
