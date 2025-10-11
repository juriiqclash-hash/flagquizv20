import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Search, Users, UserMinus, Check, X, Clock, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';

interface FriendsMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileSelect?: (userId: string) => void;
}

interface Friend {
  userId: string;
  username: string;
  avatarUrl: string;
  level: number;
  createdAt: string;
}

interface FriendRequest {
  id: string;
  senderId: string;
  senderUsername: string;
  senderAvatar: string;
  senderLevel: number;
  receiverId: string;
  createdAt: string;
}

export const FriendsMenu = ({ open, onOpenChange, onProfileSelect }: FriendsMenuProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      loadFriends();
      loadRequests();
    }
  }, [open, user]);

  const loadFriends = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: friendships } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);

      if (!friendships) {
        setFriends([]);
        return;
      }

      const friendsList: Friend[] = [];

      for (const friendship of friendships) {
        const friendId = friendship.user_id_1 === user.id ? friendship.user_id_2 : friendship.user_id_1;

        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('user_id', friendId)
          .single();

        const { data: stats } = await supabase
          .from('user_stats')
          .select('level')
          .eq('user_id', friendId)
          .single();

        if (profile) {
          friendsList.push({
            userId: friendId,
            username: profile.username || 'User',
            avatarUrl: profile.avatar_url || '',
            level: stats?.level || 0,
            createdAt: friendship.created_at
          });
        }
      }

      setFriends(friendsList.sort((a, b) => a.username.localeCompare(b.username)));
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    if (!user) return;

    try {
      const { data: received } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      const { data: sent } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('status', 'pending');

      const receivedList: FriendRequest[] = [];
      if (received) {
        for (const req of received) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', req.sender_id)
            .single();

          const { data: stats } = await supabase
            .from('user_stats')
            .select('level')
            .eq('user_id', req.sender_id)
            .single();

          if (profile) {
            receivedList.push({
              id: req.id,
              senderId: req.sender_id,
              senderUsername: profile.username || 'User',
              senderAvatar: profile.avatar_url || '',
              senderLevel: stats?.level || 0,
              receiverId: req.receiver_id,
              createdAt: req.created_at
            });
          }
        }
      }

      const sentList: FriendRequest[] = [];
      if (sent) {
        for (const req of sent) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', req.receiver_id)
            .single();

          const { data: stats } = await supabase
            .from('user_stats')
            .select('level')
            .eq('user_id', req.receiver_id)
            .single();

          if (profile) {
            sentList.push({
              id: req.id,
              senderId: req.sender_id,
              senderUsername: profile.username || 'User',
              senderAvatar: profile.avatar_url || '',
              senderLevel: stats?.level || 0,
              receiverId: req.receiver_id,
              createdAt: req.created_at
            });
          }
        }
      }

      setPendingRequests(receivedList);
      setSentRequests(sentList);
    } catch (error) {
      console.error('Error loading requests:', error);
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
        title: 'Freundschaft bestätigt',
        description: 'Ihr seid jetzt Freunde!'
      });

      loadFriends();
      loadRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: 'Fehler',
        description: 'Die Anfrage konnte nicht angenommen werden.',
        variant: 'destructive'
      });
    }
  };

  const declineRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Anfrage abgelehnt',
        description: 'Die Freundschaftsanfrage wurde abgelehnt.'
      });

      loadRequests();
    } catch (error) {
      console.error('Error declining request:', error);
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
        title: 'Anfrage zurückgezogen',
        description: 'Die Freundschaftsanfrage wurde abgebrochen.'
      });

      loadRequests();
    } catch (error) {
      console.error('Error canceling request:', error);
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id_1.eq.${Math.min(user.id, friendId)},user_id_2.eq.${Math.max(user.id, friendId)})`);

      if (error) throw error;

      toast({
        title: 'Freundschaft beendet',
        description: 'Die Freundschaft wurde entfernt.'
      });

      loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: 'Fehler',
        description: 'Die Freundschaft konnte nicht entfernt werden.',
        variant: 'destructive'
      });
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-6 h-6" />
            Freunde
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="friends" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="relative">
              Freunde
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-2">{friends.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Anfragen
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="relative">
              Gesendet
              {sentRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2">{sentRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="flex-1 overflow-y-auto mt-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Freunde suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Lade Freunde...
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'Keine Freunde gefunden' : 'Noch keine Freunde'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {searchQuery
                    ? 'Versuche einen anderen Suchbegriff'
                    : 'Füge Freunde hinzu, um hier zu sehen!'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.userId}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => {
                        if (onProfileSelect) {
                          onProfileSelect(friend.userId);
                          onOpenChange(false);
                        }
                      }}
                    >
                      <Avatar className="h-12 w-12 ring-2 ring-blue-500">
                        <AvatarImage src={friend.avatarUrl} />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {friend.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{friend.username}</p>
                        <p className="text-sm text-muted-foreground">Level {friend.level}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Freundschaft mit ${friend.username} beenden?`)) {
                          removeFriend(friend.userId);
                        }
                      }}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="flex-1 overflow-y-auto mt-4">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Keine offenen Anfragen</h3>
                <p className="text-muted-foreground text-sm">
                  Du hast keine ausstehenden Freundschaftsanfragen
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-blue-500">
                        <AvatarImage src={request.senderAvatar} />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {request.senderUsername.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{request.senderUsername}</p>
                        <p className="text-sm text-muted-foreground">Level {request.senderLevel}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => acceptRequest(request.id)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Annehmen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => declineRequest(request.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="flex-1 overflow-y-auto mt-4">
            {sentRequests.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Keine gesendeten Anfragen</h3>
                <p className="text-muted-foreground text-sm">
                  Du hast keine offenen Freundschaftsanfragen gesendet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={request.senderAvatar} />
                        <AvatarFallback className="bg-gray-500 text-white">
                          {request.senderUsername.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{request.senderUsername}</p>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Anfrage ausstehend
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelRequest(request.id)}
                      className="border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                      Abbrechen
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
