import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Send, Image, Video, Flag, UserPlus, Users, Eye, Trash2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useUserPerks } from '@/hooks/useUserPerks';
import { toast } from 'sonner';
import { PublicProfileView } from './PublicProfileView';
import { CommandSuggestions } from './CommandSuggestions';
import { FakeAttackOverlay } from './FakeAttackOverlay';
import { chatCommands, parseCommand, getCommandSuggestions, ChatCommand } from '@/hooks/useChatCommands';

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
  has_chat_style?: boolean;
}

interface GlobalChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalChat({ open, onOpenChange }: GlobalChatProps) {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { hasChatStyle } = useUserPerks();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [commandSuggestions, setCommandSuggestions] = useState<ChatCommand[]>([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [attackOverlay, setAttackOverlay] = useState<{ type: 'ddos' | 'attack'; userData?: any } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [currentUsername, setCurrentUsername] = useState('');
  const [userChatStyles, setUserChatStyles] = useState<Set<string>>(new Set());

  // Listen for admin actions (kick, ddos, attack)
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('admin_actions')
      .on('broadcast', { event: 'kick' }, (payload) => {
        if (payload.payload.user_id === user.id) {
          supabase.auth.signOut();
          toast.error('Du wurdest gekickt!');
        }
      })
      .on('broadcast', { event: 'ddos' }, (payload) => {
        if (payload.payload.user_id === user.id) {
          setAttackOverlay({ type: 'ddos' });
        }
      })
      .on('broadcast', { event: 'attack' }, async (payload) => {
        if (payload.payload.user_id === user.id) {
          // Get user stats for display
          const { data: stats } = await supabase
            .from('user_stats')
            .select('xp, level, multiplayer_wins')
            .eq('user_id', user.id)
            .single();
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', user.id)
            .single();
          
          setAttackOverlay({ 
            type: 'attack',
            userData: {
              username: profile?.username,
              xp: stats?.xp,
              level: stats?.level,
              wins: stats?.multiplayer_wins
            }
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Update command suggestions when input changes
  useEffect(() => {
    if (newMessage.startsWith('/')) {
      const suggestions = getCommandSuggestions(newMessage, isAdmin);
      setCommandSuggestions(suggestions);
      setSelectedCommandIndex(0);
    } else {
      setCommandSuggestions([]);
    }
  }, [newMessage, isAdmin]);

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

      // Check which users have chat_style perk
      const { data: chatStylePerks } = await supabase
        .from('user_perks')
        .select('user_id')
        .in('user_id', userIds)
        .eq('perk_type', 'chat_style')
        .gt('expires_at', new Date().toISOString());

      const chatStyleUsers = new Set<string>(chatStylePerks?.map(p => p.user_id as string) || []);
      setUserChatStyles(chatStyleUsers);

      const profileMap = new Map<string, { avatar_url: string | null; selected_clan: string | null }>(
        profiles?.map(p => [p.user_id, { avatar_url: p.avatar_url, selected_clan: p.selected_clan }]) || []
      );

      const messagesWithProfiles = (messagesData || []).map(msg => ({
        ...msg,
        avatar_url: profileMap.get(msg.user_id)?.avatar_url,
        selected_clan: profileMap.get(msg.user_id)?.selected_clan,
        has_chat_style: chatStyleUsers.has(msg.user_id),
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
          
          // Check if message already exists (from optimistic update)
          setMessages(prev => {
            const exists = prev.some(m => m.id === newMsg.id || (m.id.startsWith('temp-') && m.user_id === newMsg.user_id && m.message === newMsg.message));
            if (exists) {
              // Replace temp message with real one
              return prev.map(m => 
                m.id.startsWith('temp-') && m.user_id === newMsg.user_id && m.message === newMsg.message
                  ? { ...newMsg }
                  : m
              );
            }
            return prev;
          });

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

  // Auto scroll to bottom when messages change or dialog opens
  useEffect(() => {
    if (scrollRef.current && open) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, open]);

  const executeCommand = async (command: ChatCommand, args: string[]) => {
    const context = {
      userId: user!.id,
      navigate,
      onClose: () => onOpenChange(false),
      setSelectedUserId,
    };
    
    if (command.adminOnly && !isAdmin) {
      toast.error('Dieser Befehl ist nur für Admins');
      return;
    }
    
    await command.execute(args, context);
  };

  const selectCommand = (command: ChatCommand) => {
    setNewMessage(`/${command.name} `);
    setCommandSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (commandSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev => (prev + 1) % commandSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => (prev - 1 + commandSuggestions.length) % commandSuggestions.length);
      } else if (e.key === 'Tab' || (e.key === 'Enter' && commandSuggestions.length > 0)) {
        e.preventDefault();
        selectCommand(commandSuggestions[selectedCommandIndex]);
      } else if (e.key === 'Escape') {
        setCommandSuggestions([]);
      }
      return;
    }
    
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !currentUsername) return;

    const messageText = newMessage.trim();
    
    // Check if it's a command
    const parsed = parseCommand(messageText);
    if (parsed) {
      setNewMessage('');
      const command = chatCommands.find(c => c.name === parsed.command);
      if (command) {
        if (command.adminOnly && !isAdmin) {
          toast.error('Dieser Befehl ist nur für Admins');
          return;
        }
        await executeCommand(command, parsed.args);
      } else {
        toast.error(`Unbekannter Befehl: /${parsed.command}`);
      }
      return;
    }

    setNewMessage('');

    // Optimistic update - add message immediately
    const optimisticMessage: GlobalMessage = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      username: currentUsername,
      message: messageText,
      image_url: null,
      video_url: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMessage]);

    const { data, error } = await supabase
      .from('global_messages')
      .insert({
        user_id: user.id,
        username: currentUsername,
        message: messageText,
      })
      .select()
      .single();

    if (error) {
      toast.error('Nachricht konnte nicht gesendet werden');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      return;
    }

    // Replace optimistic message with real one
    if (data) {
      setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? { ...data } : m));
    }
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

    // Optimistic update for media
    const optimisticMessage: GlobalMessage = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      username: currentUsername,
      message: null,
      image_url: type === 'image' ? publicUrl : null,
      video_url: type === 'video' ? publicUrl : null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMessage]);

    const { data, error } = await supabase
      .from('global_messages')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      toast.error('Nachricht konnte nicht gesendet werden');
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    } else if (data) {
      setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? { ...data } : m));
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

  const handleDeleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from('global_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      toast.error('Nachricht konnte nicht gelöscht werden');
      return;
    }

    setMessages(prev => prev.filter(m => m.id !== messageId));
    toast.success('Nachricht gelöscht');
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
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 bg-blue-950/80 backdrop-blur-xl border-blue-400/20">
          <DialogHeader className="p-4 border-b border-blue-400/20">
            <DialogTitle className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5" />
              Global Chat
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
            {loading ? (
              <div className="flex items-center justify-center h-full text-white/60">
                Lade Nachrichten...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/60">
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
                            <span className="text-sm font-semibold cursor-pointer hover:underline text-white" onClick={() => setSelectedUserId(msg.user_id)}>
                              {msg.username}
                            </span>
                            <span className="text-xs text-white/50">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                          <div className={`rounded-2xl px-4 py-2 max-w-md ${
                            msg.user_id === user?.id 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white/10 text-white'
                          } ${msg.has_chat_style || userChatStyles.has(msg.user_id) ? 'ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-400/20' : ''}`}>
                            {msg.message && (
                              <p className={`break-words ${
                                msg.has_chat_style || userChatStyles.has(msg.user_id)
                                  ? 'text-lg font-bold bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-clip-text text-transparent'
                                  : ''
                              }`}>
                                {msg.has_chat_style || userChatStyles.has(msg.user_id) ? (
                                  <span className="flex items-center gap-1">
                                    <Sparkles className="h-4 w-4 text-yellow-400 inline" />
                                    {msg.message}
                                  </span>
                                ) : msg.message}
                              </p>
                            )}
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
                    <ContextMenuContent className="bg-slate-900/95 backdrop-blur-md border-white/20">
                      <ContextMenuItem onClick={() => setSelectedUserId(msg.user_id)} className="text-white hover:bg-white/10">
                        <Eye className="h-4 w-4 mr-2" />
                        Profil anschauen
                      </ContextMenuItem>
                      {msg.user_id !== user?.id && (
                        <ContextMenuItem onClick={() => handleAddFriend(msg.user_id)} className="text-white hover:bg-white/10">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Freund hinzufügen
                        </ContextMenuItem>
                      )}
                      {msg.user_id === user?.id && (
                        <ContextMenuItem onClick={() => handleDeleteMessage(msg.id)} className="text-red-400 hover:bg-white/10">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Nachricht löschen
                        </ContextMenuItem>
                      )}
                      <ContextMenuItem onClick={() => handleReport(msg.id)} className="text-red-400 hover:bg-white/10">
                        <Flag className="h-4 w-4 mr-2" />
                        Nachricht melden
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-blue-400/20 relative">
            {commandSuggestions.length > 0 && (
              <CommandSuggestions
                commands={commandSuggestions}
                selectedIndex={selectedCommandIndex}
                onSelect={selectCommand}
              />
            )}
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
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-blue-600/30 hover:bg-blue-600/50 text-white border-0"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploading}
                className="bg-blue-600/30 hover:bg-blue-600/50 text-white border-0"
              >
                <Video className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Nachricht oder /befehl..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-blue-900/40 border-blue-400/20 text-white placeholder:text-white/50"
                disabled={uploading}
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim() || uploading} className="bg-blue-600 hover:bg-blue-700">
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

      {attackOverlay && (
        <FakeAttackOverlay
          type={attackOverlay.type}
          userData={attackOverlay.userData}
          onComplete={() => setAttackOverlay(null)}
        />
      )}
    </>
  );
}

export default GlobalChat;
