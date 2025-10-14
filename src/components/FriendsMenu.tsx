import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserCheck, UserX, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PublicProfileView } from '@/components/PublicProfileView';

interface FriendsMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
  receiver?: {
    username: string;
    avatar_url: string | null;
  };
}

export const FriendsMenu = ({ open, onOpenChange }: FriendsMenuProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      loadFriends();
    }
  }, [open, user]);

  const loadFriends = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Load accepted friends
      const { data: acceptedFriends } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (acceptedFriends) {
        const friendIds = acceptedFriends.map(req => 
          req.sender_id === user.id ? req.receiver_id : req.sender_id
        );

        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .in('user_id', friendIds);

        const friendsWithProfiles = acceptedFriends.map(req => {
          const friendId = req.sender_id === user.id ? req.receiver_id : req.sender_id;
          const profile = profiles?.find(p => p.user_id === friendId);
          
          if (req.sender_id === user.id) {
            return { ...req, receiver: profile };
          } else {
            return { ...req, sender: profile };
          }
        });

        setFriends(friendsWithProfiles);
      }

      // Load pending requests (received)
      const { data: pending } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (pending) {
        const senderIds = pending.map(req => req.sender_id);
        const { data: senderProfiles } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .in('user_id', senderIds);

        const pendingWithProfiles = pending.map(req => ({
          ...req,
          sender: senderProfiles?.find(p => p.user_id === req.sender_id)
        }));

        setPendingRequests(pendingWithProfiles);
      }

      // Load sent requests
      const { data: sent } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('status', 'pending');

      if (sent) {
        const receiverIds = sent.map(req => req.receiver_id);
        const { data: receiverProfiles } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .in('user_id', receiverIds);

        const sentWithProfiles = sent.map(req => ({
          ...req,
          receiver: receiverProfiles?.find(p => p.user_id === req.receiver_id)
        }));

        setSentRequests(sentWithProfiles);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Freundschaftsanfrage angenommen',
        className: 'bg-success text-success-foreground'
      });

      loadFriends();
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Anfrage konnte nicht angenommen werden',
        variant: 'destructive'
      });
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Freundschaftsanfrage abgelehnt'
      });

      loadFriends();
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Anfrage konnte nicht abgelehnt werden',
        variant: 'destructive'
      });
    }
  };

  const removeFriend = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Freund entfernt'
      });

      loadFriends();
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Freund konnte nicht entfernt werden',
        variant: 'destructive'
      });
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Anfrage zurückgezogen'
      });

      loadFriends();
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Anfrage konnte nicht zurückgezogen werden',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Freunde</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends">
                Freunde ({friends.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Anfragen ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="sent">
                Gesendet ({sentRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-4 mt-4">
              {friends.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Noch keine Freunde
                </div>
              ) : (
                friends.map((friend) => {
                  const friendProfile = friend.sender_id === user?.id ? friend.receiver : friend.sender;
                  const friendId = friend.sender_id === user?.id ? friend.receiver_id : friend.sender_id;
                  return (
                    <div key={friend.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <button
                        onClick={() => setSelectedUserId(friendId)}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 text-left"
                      >
                        <Avatar>
                          <AvatarImage src={friendProfile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {friendProfile?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{friendProfile?.username}</span>
                      </button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFriend(friend.id)}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Entfernen
                      </Button>
                    </div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Keine ausstehenden Anfragen
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.sender?.avatar_url || undefined} />
                        <AvatarFallback>
                          {request.sender?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{request.sender?.username}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => acceptRequest(request.id)}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Annehmen
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rejectRequest(request.id)}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Ablehnen
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="sent" className="space-y-4 mt-4">
              {sentRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Keine gesendeten Anfragen
                </div>
              ) : (
                sentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.receiver?.avatar_url || undefined} />
                        <AvatarFallback>
                          {request.receiver?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{request.receiver?.username}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelRequest(request.id)}
                    >
                      Zurückziehen
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
    {selectedUserId && (
      <PublicProfileView
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    )}
    </>
  );
};
