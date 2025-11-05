import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

interface LobbyChatProps {
  lobbyId: string;
}

export function LobbyChat({ lobbyId }: LobbyChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    if (!lobbyId) return;

    loadMessages();
  }, [lobbyId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!lobbyId) return;

    const channel = supabase
      .channel(`lobby-chat-${lobbyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lobby_messages',
          filter: `lobby_id=eq.${lobbyId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
          
          // Auto-scroll to bottom
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lobbyId]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('lobby_messages')
        .select('*')
        .eq('lobby_id', lobbyId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      setMessages(data || []);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    } catch (error: any) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newMessage.trim() || sending) return;

    // Get username
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .single();

    setSending(true);
    
    try {
      const { error } = await supabase
        .from('lobby_messages')
        .insert({
          lobby_id: lobbyId,
          user_id: user.id,
          username: profile?.username || 'Spieler',
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Fehler',
        description: 'Nachricht konnte nicht gesendet werden',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur border-white/20 h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5" />
          Lobby-Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 pt-0 gap-3 min-h-0">
        {/* Messages Area */}
        <ScrollArea 
          className="flex-1 pr-4 min-h-0" 
          ref={scrollRef}
        >
          <div className="space-y-2">
            {messages.length === 0 ? (
              <p className="text-white/60 text-sm text-center py-4">
                Noch keine Nachrichten. Schreibe etwas!
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-lg ${
                    msg.user_id === user?.id
                      ? 'bg-blue-500/20 ml-4'
                      : 'bg-white/10 mr-4'
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white text-sm">
                      {msg.username}
                    </span>
                    <span className="text-xs text-white/50">
                      {new Date(msg.created_at).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm mt-1 break-words">
                    {msg.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nachricht schreiben..."
            maxLength={200}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            disabled={sending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || sending}
            className="bg-blue-500 hover:bg-blue-600 text-white shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
