import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Users, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Invitation {
  id: string;
  type: 'lobby' | 'clan';
  sender_username: string;
  lobby_id?: string;
  lobby_code?: string;
  clan_id?: string;
  clan_name?: string;
}

export function InvitationBanner() {
  const { user, loading } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    if (!user || loading) return;

    loadInvitations();
    
    // Subscribe to new invitations
    const lobbyChannel = supabase
      .channel('lobby-invitations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lobby_invitations',
          filter: `receiver_id=eq.${user.id}`
        },
        () => loadInvitations()
      )
      .subscribe();

    const clanChannel = supabase
      .channel('clan-invitations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clan_invitations',
          filter: `receiver_id=eq.${user.id}`
        },
        () => loadInvitations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(lobbyChannel);
      supabase.removeChannel(clanChannel);
    };
  }, [user]);

  const loadInvitations = async () => {
    if (!user) return;

    try {
      // Load lobby invitations
      const { data: lobbyInvites, error: lobbyError } = await supabase
        .from('lobby_invitations')
        .select(`
          id,
          lobby_id,
          sender_id
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (lobbyError) throw lobbyError;

      // Load clan invitations
      const { data: clanInvites, error: clanError } = await supabase
        .from('clan_invitations')
        .select(`
          id,
          clan_id,
          sender_id,
          clans!inner(name)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (clanError) throw clanError;

      // Get sender profiles
      const allSenderIds = [
        ...(lobbyInvites?.map(inv => inv.sender_id) || []),
        ...(clanInvites?.map(inv => inv.sender_id) || [])
      ];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', allSenderIds);

      const profileMap = new Map<string, string>(profiles?.map(p => [p.user_id, p.username]) || []);

      // Get lobby codes
      const lobbyIds = lobbyInvites?.map(inv => inv.lobby_id) || [];
      const { data: lobbies } = lobbyIds.length > 0 ? await supabase
        .from('matches')
        .select('id, room_code')
        .in('id', lobbyIds) : { data: [] };

      const lobbyMap = new Map<string, string>();
      lobbies?.forEach(l => {
        if (l.id && l.room_code) {
          lobbyMap.set(l.id, l.room_code);
        }
      });

      const formattedInvitations: Invitation[] = [
        ...(lobbyInvites?.map(inv => ({
          id: inv.id,
          type: 'lobby' as const,
          sender_username: profileMap.get(inv.sender_id) || 'Unbekannt',
          lobby_id: inv.lobby_id,
          lobby_code: lobbyMap.get(inv.lobby_id) || ''
        })) || []),
        ...(clanInvites?.map(inv => ({
          id: inv.id,
          type: 'clan' as const,
          sender_username: profileMap.get(inv.sender_id) || 'Unbekannt',
          clan_id: inv.clan_id,
          clan_name: (inv.clans as any)?.name
        })) || [])
      ];

      setInvitations(formattedInvitations);
    } catch (error: any) {
      console.error('Error loading invitations:', error);
    }
  };

  const handleAccept = async (invitation: Invitation) => {
    if (!user) return;

    try {
      if (invitation.type === 'lobby') {
        // Update invitation status
        await supabase
          .from('lobby_invitations')
          .update({ status: 'accepted' })
          .eq('id', invitation.id);

        // Get lobby data first
        const { data: lobby, error: lobbyError } = await supabase
          .from('lobbies')
          .select('*')
          .eq('id', invitation.lobby_id)
          .single();

        if (lobbyError) {
          console.error('Error fetching lobby:', lobbyError);
          throw new Error('Lobby nicht gefunden');
        }

        // Check if lobby is still waiting (not started yet)
        if (lobby.status !== 'waiting') {
          toast({
            title: 'Lobby bereits gestartet',
            description: 'Diese Lobby hat bereits begonnen',
            variant: 'destructive'
          });
          return;
        }

        // Join the lobby
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();

        const { error: insertError } = await supabase
          .from('match_participants')
          .insert({
            lobby_id: invitation.lobby_id,
            user_id: user.id,
            username: profile?.username || 'Unbekannt',
            status: 'alive',
            score: 0,
            lives: 5
          });

        if (insertError) {
          console.error('Error joining lobby:', insertError);
          throw insertError;
        }

        console.log('✅ Successfully joined lobby via invitation');

        toast({
          title: 'Lobby beigetreten!',
          description: `Du bist der Lobby ${invitation.lobby_code} beigetreten`
        });

        // Navigate to multiplayer page with lobby data in localStorage for immediate load
        localStorage.setItem('pendingLobbyJoin', JSON.stringify({
          lobbyId: invitation.lobby_id,
          roomCode: lobby.room_code
        }));
        
        window.location.hash = '#/multiplayer';
      } else if (invitation.type === 'clan') {
        // Update invitation status
        await supabase
          .from('clan_invitations')
          .update({ status: 'accepted' })
          .eq('id', invitation.id);

        // Join the clan
        await supabase
          .from('clan_members')
          .insert({
            clan_id: invitation.clan_id,
            user_id: user.id,
            role: 'member'
          });

        toast({
          title: 'Clan beigetreten!',
          description: `Du bist dem Clan ${invitation.clan_name} beigetreten`
        });
      }

      loadInvitations();
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: 'Fehler',
        description: 'Einladung konnte nicht angenommen werden',
        variant: 'destructive'
      });
    }
  };

  const handleDecline = async (invitation: Invitation) => {
    try {
      const table = invitation.type === 'lobby' ? 'lobby_invitations' : 'clan_invitations';
      await supabase
        .from(table)
        .update({ status: 'declined' })
        .eq('id', invitation.id);

      loadInvitations();
    } catch (error: any) {
      console.error('Error declining invitation:', error);
    }
  };

  if (invitations.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {invitations.map((invitation) => (
        <Card key={invitation.id} className="bg-primary/95 backdrop-blur border-primary-foreground/20 shadow-xl animate-in slide-in-from-right">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-foreground/10 rounded-lg">
                {invitation.type === 'lobby' ? (
                  <Users className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <Shield className="h-5 w-5 text-primary-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary-foreground">
                  {invitation.type === 'lobby' ? 'Lobby-Einladung' : 'Clan-Einladung'}
                </p>
                <p className="text-sm text-primary-foreground/80 mt-1">
                  {invitation.sender_username} hat dich {invitation.type === 'lobby' 
                    ? `zu einer Lobby eingeladen (${invitation.lobby_code})`
                    : `zum Clan "${invitation.clan_name}" eingeladen`}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAccept(invitation)}
                  >
                    Annehmen
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary-foreground hover:bg-primary-foreground/10"
                    onClick={() => handleDecline(invitation)}
                  >
                    Ablehnen
                  </Button>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => handleDecline(invitation)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
