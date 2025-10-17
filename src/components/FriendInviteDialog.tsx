import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Friend {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  isOnline: boolean;
}

interface FriendInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'lobby' | 'clan';
  lobbyId?: string;
  clanId?: string;
}

export function FriendInviteDialog({ open, onOpenChange, type, lobbyId, clanId }: FriendInviteDialogProps) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [lastInviteTime, setLastInviteTime] = useState<number>(0);

  useEffect(() => {
    if (open && user) {
      loadFriends();
      subscribeToPresence();
    }
  }, [open, user]);

  const subscribeToPresence = async () => {
    if (!user) return;

    // Get user's friends list to restrict presence to friends only
    const { data: friendsList } = await supabase
      .from('friend_requests')
      .select('sender_id, receiver_id')
      .eq('status', 'accepted')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    const friendIds = friendsList?.map(f => 
      f.sender_id === user.id ? f.receiver_id : f.sender_id
    ) || [];

    // Create user-specific presence channel
    const channel = supabase.channel(`presence:friends:${user.id}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineIds = Object.values(state)
          .flat()
          .map((presence: any) => presence.user_id)
          .filter(id => friendIds.includes(id)); // Only show friends
        setOnlineUsers(onlineIds);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadFriends = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get accepted friends
      const { data: friendRequests, error } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) throw error;

      if (!friendRequests || friendRequests.length === 0) {
        setFriends([]);
        return;
      }

      // Get friend user IDs
      const friendIds = friendRequests.map(req => 
        req.sender_id === user.id ? req.receiver_id : req.sender_id
      );

      // Get friend profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .in('user_id', friendIds);

      if (profilesError) throw profilesError;

      const friendsData = profiles?.map(profile => ({
        id: profile.user_id,
        user_id: profile.user_id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        isOnline: onlineUsers.includes(profile.user_id)
      })) || [];

      setFriends(friendsData);
    } catch (error: any) {
      console.error('Error loading friends:', error);
      toast({
        title: 'Fehler',
        description: 'Freunde konnten nicht geladen werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (friendId: string) => {
    if (!user) return;

    // Rate limiting - prevent invitation spam
    const now = Date.now();
    if (now - lastInviteTime < 5000) {
      toast({
        title: 'Bitte warten',
        description: 'Du kannst nur alle 5 Sekunden Einladungen senden',
        variant: 'destructive'
      });
      return;
    }
    setLastInviteTime(now);

    try {
      if (type === 'lobby' && lobbyId) {
        const { error } = await supabase
          .from('lobby_invitations')
          .insert({
            lobby_id: lobbyId,
            sender_id: user.id,
            receiver_id: friendId,
            status: 'pending'
          });

        if (error) throw error;

        toast({
          title: 'Einladung gesendet!',
          description: 'Dein Freund wurde zur Lobby eingeladen'
        });
      } else if (type === 'clan' && clanId) {
        const { error } = await supabase
          .from('clan_invitations')
          .insert({
            clan_id: clanId,
            sender_id: user.id,
            receiver_id: friendId,
            status: 'pending'
          });

        if (error) throw error;

        toast({
          title: 'Einladung gesendet!',
          description: 'Dein Freund wurde zum Clan eingeladen'
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Einladung konnte nicht gesendet werden',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Freund einladen
          </DialogTitle>
          <DialogDescription>
            Wähle einen Freund aus, den du {type === 'lobby' ? 'zur Lobby' : 'zum Clan'} einladen möchtest
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Du hast noch keine Freunde</p>
            <p className="text-sm mt-2">Füge Freunde hinzu, um sie einzuladen</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={friend.avatar_url || undefined} />
                    <AvatarFallback>
                      {friend.username?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${
                    onlineUsers.includes(friend.user_id) ? 'bg-green-500' : 'bg-gray-400'
                  } rounded-full border-2 border-background`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{friend.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {onlineUsers.includes(friend.user_id) ? '🟢 Online' : '🔴 Offline'}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => sendInvitation(friend.id)}
                >
                  Einladen
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
