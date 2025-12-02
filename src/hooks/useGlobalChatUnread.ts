import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useGlobalChatUnread() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const loadUnreadCount = async () => {
      // Get user's last read timestamp
      const { data: readData } = await supabase
        .from('user_global_chat_reads')
        .select('last_read_at')
        .eq('user_id', user.id)
        .single();

      const lastReadAt = readData?.last_read_at || new Date(0).toISOString();

      // Count messages after last read
      const { count, error } = await supabase
        .from('global_messages')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', lastReadAt);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    loadUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel('global_chat_unread')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'global_messages' },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async () => {
    if (!user) return;
    
    await supabase
      .from('user_global_chat_reads')
      .upsert({ user_id: user.id, last_read_at: new Date().toISOString() }, { onConflict: 'user_id' });
    
    setUnreadCount(0);
  };

  return { unreadCount, markAsRead };
}
