import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check permanent admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleError) throw roleError;
        
        if (roleData) {
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        // Check temporary admin perk from codes
        const { data: perkData, error: perkError } = await supabase
          .from('user_perks')
          .select('id')
          .eq('user_id', user.id)
          .eq('perk_type', 'admin_time')
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (perkError) throw perkError;
        
        setIsAdmin(!!perkData);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();

    // Subscribe to perk changes
    if (user) {
      const channel = supabase
        .channel('admin_perk_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_perks',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            checkAdminStatus();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return { isAdmin, loading };
};
