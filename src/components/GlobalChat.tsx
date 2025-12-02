import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Send, Image, Video, Flag, UserPlus, Users, Eye, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { PublicProfileView } from './PublicProfileView';

interface GlobalMessage {
  id: string;
  user_id: string;
  username: string;
  message: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  avatar_url?: string;
  selected_clan?: string;
}

interface GlobalChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalChat({ open, onOpenChange }: GlobalChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [currentUsername, setCurrentUsername] = useState('');

  // Load current user's username
  useEffect(() => {
    const loadUsername = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setCurrentUsername(data.username);
      }
    };
    loadUsername();
  }, [user]);

  // Load messages
  useEffect(() => {
    if (!open) return;

    const loadMessages = async () => {
      setLoading(true);
      const { data: messagesData, error } = await supabase
        .from('global_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error loading messages:', error);
        setLoading(false);
        return;
      }

      // Load profile info for each unique user
      const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, avatar_url, selected_clan')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const messagesWithProfiles = (messagesData || []).map(msg => ({
        ...msg,
        avatar_url: profileMap.get(msg.user_id)?.avatar_url,
        selected_clan: profileMap.get(msg.user_id)?.selected_clan,
      }));

      setMessages(messagesWithProfiles);
      setLoading(false);

      // Update last read
      if (user) {
        await supabase
          .from('user_global_chat_reads')
          .upsert({ user_id: user.id, last_read_at: new Date().toISOString() }, { onConflict: 'user_id' });
      }
    };

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('global_chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'global_messages' },
        async (payload) => {
          const newMsg = payload.new as GlobalMessage;
          // Load profile for new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url, selected_clan')
            .eq('user_id', newMsg.user_id)
            .single();

          setMessages(prev => [...prev, {
            ...newMsg,
            avatar_url: profile?.avatar_url,
            selected_clan: profile?.selected_clan,
          }]);

          // Update last read if chat is open
          if (user) {
            await supabase
              .from('user_global_chat_reads')
              .upsert({ user_id: user.id, last_read_at: new Date().toISOString() }, { onConflict: 'user_id' });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'global_messages' },
        (payload) => {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, user]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !currentUsername) return;

    const { error } = await supabase
      .from('global_messages')
      .insert({
        user_id: user.id,
        username: currentUsername,
        message: newMessage.trim(),
      });

    if (error) {
      toast.error('Nachricht konnte nicht gesendet werden');
      return;
    }

    setNewMessage('');
  };

  const uploadMedia = async (file: File, type: 'image' | 'video') => {
    if (!user || !currentUsername) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('global-chat-media')
      .upload(fileName, file);

    if (uploadError) {
      toast.error('Upload fehlgeschlagen');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('global-chat-media')
      .getPublicUrl(fileName);

    const insertData: any = {
      user_id: user.id,
      username: currentUsername,
    };

    if (type === 'image') {
      insertData.image_url = publicUrl;
    } else {
      insertData.video_url = publicUrl;
    }

    const { error } = await supabase
      .from('global_messages')
      .insert(insertData);

    if (error) {
      toast.error('Nachricht konnte nicht gesendet werden');
    }

    setUploading(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMedia(file, 'image');
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMedia(file, 'video');
    }
  };

  const handleReport = (messageId: string) => {
    toast.success('Nachricht wurde gemeldet');
  };

  const handleAddFriend = async (userId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: user.id,
        receiver_id: userId,
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('Freundschaftsanfrage existiert bereits');
      } else {
        toast.error('Fehler beim Senden der Anfrage');
      }
      return;
    }

    toast.success('Freundschaftsanfrage gesendet');
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 bg-background/80 backdrop-blur-xl border-border/50">
          <DialogHeader className="p-4 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Global Chat
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Lade Nachrichten...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Noch keine Nachrichten. Sei der Erste!
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <ContextMenu key={msg.id}>
                    <ContextMenuTrigger>
                      <div className={`flex gap-3 ${msg.user_id === user?.id ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="h-10 w-10 flex-shrink-0 cursor-pointer" onClick={() => setSelectedUserId(msg.user_id)}>
                          <AvatarImage src={msg.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {msg.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold cursor-pointer hover:underline" onClick={() => setSelectedUserId(msg.user_id)}>
                              {msg.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                          <div className={`rounded-2xl px-4 py-2 max-w-md ${
                            msg.user_id === user?.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            {msg.message && <p className="break-words">{msg.message}</p>}
                            {msg.image_url && (
                              <img 
                                src={msg.image_url} 
                                alt="Shared image" 
                                className="rounded-lg max-w-full max-h-64 object-cover mt-2"
                              />
                            )}
                            {msg.video_url && (
                              <video 
                                src={msg.video_url} 
                                controls 
                                className="rounded-lg max-w-full max-h-64 mt-2"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => setSelectedUserId(msg.user_id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Profil anschauen
                      </ContextMenuItem>
                      {msg.user_id !== user?.id && (
                        <ContextMenuItem onClick={() => handleAddFriend(msg.user_id)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Freund hinzufügen
                        </ContextMenuItem>
                      )}
                      <ContextMenuItem onClick={() => handleReport(msg.id)} className="text-destructive">
                        <Flag className="h-4 w-4 mr-2" />
                        Nachricht melden
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploading}
              >
                <Video className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Nachricht schreiben..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 bg-background/50"
                disabled={uploading}
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim() || uploading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
}

export default GlobalChat;
