import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Check, X, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  total_xp: number;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender?: UserProfile;
  receiver?: UserProfile;
}

interface Friendship {
  id: string;
  user_id_1: string;
  user_id_2: string;
  friend?: UserProfile;
}

export default function FriendsView() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFriendData();
    }
  }, [user]);

  const loadFriendData = async () => {
    try {
      await Promise.all([
        loadFriendRequests(),
        loadSentRequests(),
        loadFriends()
      ]);
    } catch (error) {
      console.error('Error loading friend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('*, sender:user_profiles!friend_requests_sender_id_fkey(id, username, avatar_url, total_xp)')
      .eq('receiver_id', user?.id)
      .eq('status', 'pending');

    if (!error && data) {
      setFriendRequests(data as any);
    }
  };

  const loadSentRequests = async () => {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('*, receiver:user_profiles!friend_requests_receiver_id_fkey(id, username, avatar_url, total_xp)')
      .eq('sender_id', user?.id)
      .eq('status', 'pending');

    if (!error && data) {
      setSentRequests(data as any);
    }
  };

  const loadFriends = async () => {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .or(`user_id_1.eq.${user?.id},user_id_2.eq.${user?.id}`);

    if (!error && data) {
      const friendsWithProfiles = await Promise.all(
        data.map(async (friendship) => {
          const friendId = friendship.user_id_1 === user?.id ? friendship.user_id_2 : friendship.user_id_1;
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id, username, avatar_url, total_xp')
            .eq('id', friendId)
            .maybeSingle();

          return {
            ...friendship,
            friend: profile
          };
        })
      );
      setFriends(friendsWithProfiles);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, username, avatar_url, total_xp')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user?.id)
        .limit(10);

      if (!error && data) {
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Fehler beim Suchen');
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user?.id,
          receiver_id: receiverId
        });

      if (error) throw error;

      toast.success('Freundschaftsanfrage gesendet!');
      setSearchResults([]);
      setSearchQuery('');
      loadSentRequests();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Freundschaftsanfrage bereits gesendet');
      } else {
        toast.error('Fehler beim Senden der Anfrage');
      }
    }
  };

  const handleFriendRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(accept ? 'Freundschaftsanfrage angenommen!' : 'Freundschaftsanfrage abgelehnt');
      loadFriendData();
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast.error('Fehler beim Bearbeiten der Anfrage');
    }
  };

  const cancelFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Freundschaftsanfrage zurückgezogen');
      loadSentRequests();
    } catch (error) {
      console.error('Error canceling friend request:', error);
      toast.error('Fehler beim Zurückziehen der Anfrage');
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Freund entfernt');
      loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Fehler beim Entfernen des Freundes');
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
      <h1 className="text-3xl font-bold mb-6">Freunde</h1>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="friends">
            Freunde ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Anfragen ({friendRequests.length})
          </TabsTrigger>
          <TabsTrigger value="search">Suchen</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <div className="space-y-4">
            {friends.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Noch keine Freunde. Suche nach Nutzern und sende Freundschaftsanfragen!
                </CardContent>
              </Card>
            ) : (
              friends.map((friendship) => (
                <Card key={friendship.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friendship.friend?.avatar_url} />
                        <AvatarFallback>
                          {friendship.friend?.username?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{friendship.friend?.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {friendship.friend?.total_xp || 0} XP
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeFriend(friendship.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Erhaltene Anfragen</h3>
              <div className="space-y-4">
                {friendRequests.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      Keine ausstehenden Freundschaftsanfragen
                    </CardContent>
                  </Card>
                ) : (
                  friendRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={request.sender?.avatar_url} />
                            <AvatarFallback>
                              {request.sender?.username?.[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{request.sender?.username}</p>
                            <p className="text-sm text-muted-foreground">
                              {request.sender?.total_xp || 0} XP
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="default"
                            onClick={() => handleFriendRequest(request.id, true)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleFriendRequest(request.id, false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Gesendete Anfragen</h3>
              <div className="space-y-4">
                {sentRequests.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      Keine gesendeten Anfragen
                    </CardContent>
                  </Card>
                ) : (
                  sentRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={request.receiver?.avatar_url} />
                            <AvatarFallback>
                              {request.receiver?.username?.[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{request.receiver?.username}</p>
                            <Badge variant="secondary">Ausstehend</Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelFriendRequest(request.id)}
                        >
                          Zurückziehen
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Nutzer suchen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Nutzername eingeben..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                {searchResults.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.username?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.total_xp || 0} XP
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => sendFriendRequest(user.id)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Anfrage senden
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
