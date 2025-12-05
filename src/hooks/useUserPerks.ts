import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserPerk {
  id: string;
  user_id: string;
  perk_type: string;
  expires_at: string;
  granted_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  badge_name: string;
  badge_emoji: string | null;
  badge_color: string | null;
  expires_at: string | null;
  granted_at: string;
}

export const useUserPerks = (userId?: string) => {
  const { user } = useAuth();
  const [perks, setPerks] = useState<UserPerk[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  const fetchPerks = async () => {
    if (!targetUserId) {
      setPerks([]);
      setBadges([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch active perks (not expired)
      const { data: perksData } = await supabase
        .from('user_perks')
        .select('*')
        .eq('user_id', targetUserId)
        .gt('expires_at', new Date().toISOString());

      // Fetch badges (active ones - either no expiry or not expired)
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', targetUserId)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      setPerks((perksData as UserPerk[]) || []);
      setBadges((badgesData as UserBadge[]) || []);
    } catch (error) {
      console.error('Error fetching perks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerks();

    // Subscribe to changes if we have a target user
    if (targetUserId) {
      const channel = supabase
        .channel(`user_perks_${targetUserId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_perks',
            filter: `user_id=eq.${targetUserId}`,
          },
          () => {
            fetchPerks();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_badges',
            filter: `user_id=eq.${targetUserId}`,
          },
          () => {
            fetchPerks();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [targetUserId]);

  const hasPerk = (perkType: string): boolean => {
    return perks.some(p => p.perk_type === perkType);
  };

  const getPerk = (perkType: string): UserPerk | undefined => {
    return perks.find(p => p.perk_type === perkType);
  };

  const hasBadge = (badgeId: string): boolean => {
    return badges.some(b => b.badge_id === badgeId);
  };

  const hasPremium = (): boolean => {
    return hasPerk('premium_time') || hasPerk('ultimate_time');
  };

  const hasUltimate = (): boolean => {
    return hasPerk('ultimate_time');
  };

  const hasChatStyle = (): boolean => {
    return hasPerk('chat_style');
  };

  const hasDoubleXP = (): boolean => {
    return hasPerk('double_xp');
  };

  const hasAdminPerk = (): boolean => {
    return hasPerk('admin_time');
  };

  // Get remaining time for a perk
  const getPerkTimeRemaining = (perkType: string): string | null => {
    const perk = getPerk(perkType);
    if (!perk) return null;

    const expiresAt = new Date(perk.expires_at);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h`;
  };

  return {
    perks,
    badges,
    loading,
    hasPerk,
    getPerk,
    hasBadge,
    hasPremium,
    hasUltimate,
    hasChatStyle,
    hasDoubleXP,
    hasAdminPerk,
    getPerkTimeRemaining,
    refresh: fetchPerks
  };
};
