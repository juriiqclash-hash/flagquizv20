import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Shield, Users, Plus, ArrowLeft, Crown, Star, LogOut, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ClanCreator } from './ClanCreator';

interface Clan {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  image_url: string | null;
  created_by: string;
  created_at: string;
  member_count?: number;
}

interface ClanMember {
  id: string;
  user_id: string;
  role: 'member' | 'admin' | 'owner';
  joined_at: string;
  username?: string;
  avatar_url?: string;
}

export default function ClanMenu() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clans, setClans] = useState<Clan[]>([]);
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [clanMembers, setClanMembers] = useState<ClanMember[]>([]);
  const [userClanId, setUserClanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    loadClans();
    loadUserClan();
  }, [user]);

  const loadClans = async () => {
    try {
      const { data, error } = await supabase
        .from('clans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const clansWithCounts = await Promise.all(
          data.map(async (clan) => {
            const { count } = await supabase
              .from('clan_members')
              .select('*', { count: 'exact', head: true })
              .eq('clan_id', clan.id);

            return { ...clan, member_count: count || 0 };
          })
        );

        setClans(clansWithCounts);
      }
    } catch (error: any) {
      console.error('Error loading clans:', error);
      toast({
        title: 'Fehler',
        description: 'Clans konnten nicht geladen werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserClan = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('clan_members')
        .select('clan_id')
        .eq('user_id', user.id)
        .maybeSingle();

      setUserClanId(data?.clan_id || null);
    } catch (error) {
      console.error('Error loading user clan:', error);
    }
  };

  const loadClanMembers = async (clanId: string) => {
    try {
      const { data, error } = await supabase
        .from('clan_members')
        .select(`
          id,
          user_id,
          role,
          joined_at
        `)
        .eq('clan_id', clanId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const membersWithProfiles = await Promise.all(
          data.map(async (member) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('user_id', member.user_id)
              .maybeSingle();

            return {
              ...member,
              username: profile?.username || 'Unbekannt',
              avatar_url: profile?.avatar_url
            };
          })
        );

        setClanMembers(membersWithProfiles);
      }
    } catch (error: any) {
      console.error('Error loading clan members:', error);
      toast({
        title: 'Fehler',
        description: 'Mitglieder konnten nicht geladen werden',
        variant: 'destructive'
      });
    }
  };

  const handleSelectClan = (clan: Clan) => {
    setSelectedClan(clan);
    loadClanMembers(clan.id);
  };

  const handleJoinClan = async (clanId: string) => {
    if (!user) return;

    if (userClanId) {
      toast({
        title: 'Fehler',
        description: 'Du bist bereits in einem Clan. Verlasse zuerst deinen aktuellen Clan.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('clan_members')
        .insert({
          clan_id: clanId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: 'Erfolg!',
        description: 'Du bist dem Clan beigetreten',
      });

      setUserClanId(clanId);
      loadClans();
      if (selectedClan?.id === clanId) {
        loadClanMembers(clanId);
      }
    } catch (error: any) {
      console.error('Error joining clan:', error);
      toast({
        title: 'Fehler',
        description: 'Clan konnte nicht beigetreten werden',
        variant: 'destructive'
      });
    }
  };

  const handleLeaveClan = async () => {
    if (!user || !userClanId) return;

    try {
      const { error } = await supabase
        .from('clan_members')
        .delete()
        .eq('clan_id', userClanId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Erfolg',
        description: 'Du hast den Clan verlassen',
      });

      setUserClanId(null);
      loadClans();
      if (selectedClan?.id === userClanId) {
        loadClanMembers(userClanId);
      }
    } catch (error: any) {
      console.error('Error leaving clan:', error);
      toast({
        title: 'Fehler',
        description: 'Clan konnte nicht verlassen werden',
        variant: 'destructive'
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Star className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Owner</Badge>;
      case 'admin':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Admin</Badge>;
      default:
        return <Badge variant="secondary">Member</Badge>;
    }
  };

  if (showCreator) {
    return (
      <ClanCreator
        onClose={() => setShowCreator(false)}
        onClanCreated={(clan) => {
          setShowCreator(false);
          loadClans();
          loadUserClan();
        }}
      />
    );
  }

  if (selectedClan) {
    const isUserMember = userClanId === selectedClan.id;
    const userMember = clanMembers.find(m => m.user_id === user?.id);
    const isOwner = userMember?.role === 'owner';

    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setSelectedClan(null)}
          className="mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>

        <Card className="overflow-hidden">
          {selectedClan.image_url ? (
            <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
              <img
                src={selectedClan.image_url}
                alt={selectedClan.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Shield className="w-16 h-16 text-primary/40" />
            </div>
          )}

          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-5xl">{selectedClan.emoji}</div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedClan.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    <Users className="w-3 h-3 mr-1" />
                    {selectedClan.member_count}/30 Mitglieder
                  </Badge>
                </div>
              </div>
            </div>

            {selectedClan.description && (
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                {selectedClan.description}
              </p>
            )}

            <div className="flex gap-2 mb-6">
              {!isUserMember && selectedClan.member_count && selectedClan.member_count < 30 && (
                <Button onClick={() => handleJoinClan(selectedClan.id)} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Beitreten
                </Button>
              )}
              {isUserMember && (
                <Button
                  variant="destructive"
                  onClick={handleLeaveClan}
                  className="flex-1"
                  disabled={isOwner}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isOwner ? 'Owner kann nicht verlassen' : 'Verlassen'}
                </Button>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Mitglieder ({clanMembers.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {clanMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {member.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.username}</span>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Beigetreten: {new Date(member.joined_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                    {getRoleBadge(member.role)}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Clans
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tritt einem Clan bei oder erstelle deinen eigenen
          </p>
        </div>
        <Button onClick={() => setShowCreator(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Erstellen
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Lade Clans...</p>
          </CardContent>
        </Card>
      ) : clans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Noch keine Clans</h3>
            <p className="text-muted-foreground mb-4">
              Sei der Erste und erstelle einen Clan!
            </p>
            <Button onClick={() => setShowCreator(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Clan erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clans.map((clan) => {
            const isUserInClan = userClanId === clan.id;
            const isFull = clan.member_count && clan.member_count >= 30;

            return (
              <Card
                key={clan.id}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                  isUserInClan ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelectClan(clan)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {clan.image_url ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-secondary/20">
                        <img
                          src={clan.image_url}
                          alt={clan.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const emoji = document.createElement('div');
                              emoji.className = 'text-3xl flex items-center justify-center h-full';
                              emoji.textContent = clan.emoji;
                              parent.appendChild(emoji);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">{clan.emoji}</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-lg truncate">{clan.name}</h3>
                        {isUserInClan && (
                          <Badge variant="default" className="flex-shrink-0">Dein Clan</Badge>
                        )}
                      </div>

                      {clan.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {clan.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={isFull ? 'destructive' : 'secondary'} className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {clan.member_count}/30
                        </Badge>
                        {isFull && (
                          <Badge variant="outline" className="text-xs">Voll</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
