import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

interface CollapsibleChatProps {
  contextId: string;
  contextType: 'lobby' | 'clan' | 'friend';
  tableName: string;
  filterColumn: string;
}

export function CollapsibleChat({ contextId, contextType, tableName, filterColumn }: CollapsibleChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadTime, setLastReadTime] = useState<string>(new Date().toISOString());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    if (!contextId) return;
    loadMessages();
  }, [contextId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!contextId) return;

    const channel = supabase
      .channel(`chat-${contextType}-${contextId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: tableName,
          filter: `${filterColumn}=eq.${contextId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
          
          // Increment unread if chat is closed and message is not from me
          if (!isOpen && newMsg.user_id !== user?.id) {
            setUnreadCount(prev => prev + 1);
          }
          
          // Auto-scroll to bottom if open
          if (isOpen) {
            setTimeout(() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
              }
            }, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contextId, contextType, tableName, filterColumn, isOpen, user?.id]);

  // Reset unread count when opening chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setLastReadTime(new Date().toISOString());
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [isOpen]);

  const loadMessages = async () => {
    try {
      const query = supabase
        .from(tableName as any)
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      
      const { data, error } = await (query as any).eq(filterColumn, contextId);

      if (error) throw error;

      setMessages((data as Message[]) || []);
      
      // Count unread messages
      const unread = ((data as Message[]) || []).filter(
        msg => msg.created_at > lastReadTime && msg.user_id !== user?.id
      ).length;
      setUnreadCount(unread);
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
      const messageData: Record<string, any> = {
        user_id: user.id,
        username: profile?.username || 'Spieler',
        message: newMessage.trim(),
        [filterColumn]: contextId
      };

      const { error } = await (supabase
        .from(tableName as any) as any)
        .insert([messageData]);

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

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-[500px] bg-card border border-border rounded-lg shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">Chat</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-2">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Noch keine Nachrichten. Schreibe etwas!
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-lg ${
                  msg.user_id === user?.id
                    ? 'bg-primary/20 ml-4'
                    : 'bg-muted mr-4'
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm">
                    {msg.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.created_at).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm mt-1 break-words">
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-3 border-t border-border flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nachricht..."
          maxLength={200}
          disabled={sending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!newMessage.trim() || sending}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
