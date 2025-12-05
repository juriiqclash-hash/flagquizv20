import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface StripeSubscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: 'not_started' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused' | null;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export interface Subscription {
  plan: 'free' | 'premium' | 'ultimate';
  status: 'active' | 'canceled' | 'expired' | 'past_due' | 'incomplete';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: Date | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  fromPerk?: boolean; // Indicates if the subscription comes from a redeemed code
  perkExpiresAt?: Date | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSubscription = async () => {
    if (!user) {
      setSubscription({
        plan: 'free',
        status: 'active',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
      });
      setLoading(false);
      return;
    }

    try {
      // First check for perks from redeemed codes
      const { data: perks } = await supabase
        .from('user_perks')
        .select('*')
        .eq('user_id', user.id)
        .in('perk_type', ['premium_time', 'ultimate_time'])
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false });

      // Check if user has ultimate or premium perk
      const ultimatePerk = perks?.find(p => p.perk_type === 'ultimate_time');
      const premiumPerk = perks?.find(p => p.perk_type === 'premium_time');

      // Then check Stripe subscription
      const { data, error } = await (supabase as any)
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error loading subscription:', error);
        throw error;
      }

      let stripePlan: 'free' | 'premium' | 'ultimate' = 'free';
      let stripeStatus: 'active' | 'canceled' | 'expired' | 'past_due' | 'incomplete' = 'active';
      
      if (data && data.subscription_id) {
        const stripeData = data as StripeSubscription;
        const priceId = stripeData.price_id || '';

        if (priceId === 'price_1SLrHPEgHdKvS0zO8QKasnnZ' || priceId === 'price_1SLrKnEgHdKvS0zOzzDlmFkI') {
          stripePlan = 'premium';
        } else if (priceId === 'price_1SLrIOEgHdKvS0zOXc8g0xvR' || priceId === 'price_1SLrL8EgHdKvS0zOFy0VgBSD') {
          stripePlan = 'ultimate';
        }

        stripeStatus = stripeData.subscription_status === 'active' ? 'active' :
                      stripeData.subscription_status === 'canceled' ? 'canceled' :
                      stripeData.subscription_status === 'past_due' ? 'past_due' :
                      stripeData.subscription_status === 'incomplete' ? 'incomplete' : 'expired';
      }

      // Determine final plan - perks can upgrade but not downgrade
      let finalPlan: 'free' | 'premium' | 'ultimate' = stripePlan;
      let fromPerk = false;
      let perkExpiresAt: Date | null = null;

      // Ultimate perk overrides everything except active stripe ultimate
      if (ultimatePerk && (stripePlan !== 'ultimate' || stripeStatus !== 'active')) {
        finalPlan = 'ultimate';
        fromPerk = true;
        perkExpiresAt = new Date(ultimatePerk.expires_at);
      }
      // Premium perk upgrades free plan
      else if (premiumPerk && stripePlan === 'free') {
        finalPlan = 'premium';
        fromPerk = true;
        perkExpiresAt = new Date(premiumPerk.expires_at);
      }

      setSubscription({
        plan: finalPlan,
        status: stripeStatus,
        stripe_customer_id: data?.customer_id || null,
        stripe_subscription_id: data?.subscription_id || null,
        current_period_start: data?.current_period_start
          ? new Date(data.current_period_start * 1000)
          : null,
        current_period_end: data?.current_period_end
          ? new Date(data.current_period_end * 1000)
          : null,
        cancel_at_period_end: data?.cancel_at_period_end || false,
        fromPerk,
        perkExpiresAt,
      });
    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscription({
        plan: 'free',
        status: 'active',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();

    if (!user) return;

    // Subscribe to stripe subscription changes
    const stripeChannel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stripe_user_subscriptions',
        },
        () => {
          loadSubscription();
        }
      )
      .subscribe();

    // Subscribe to perk changes (for code-based subscriptions)
    const perkChannel = supabase
      .channel('perk_subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_perks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stripeChannel);
      supabase.removeChannel(perkChannel);
    };
  }, [user]);

  const cancelSubscription = async () => {
    if (!user || !subscription?.stripe_subscription_id) {
      throw new Error('No active subscription');
    }

    const response = await fetch(
      `https://oqvbxhirnhdxaezkddtj.supabase.co/functions/v1/cancel-subscription`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    await loadSubscription();
  };

  return {
    subscription,
    loading,
    cancelSubscription,
    refresh: loadSubscription,
  };
};
