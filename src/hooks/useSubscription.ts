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
      const { data, error } = await (supabase as any)
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error loading subscription:', error);
        throw error;
      }

      if (!data || !data.subscription_id) {
        setSubscription({
          plan: 'free',
          status: 'active',
          stripe_customer_id: data?.customer_id || null,
          stripe_subscription_id: null,
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: false,
        });
      } else {
        const stripeData = data as StripeSubscription;

        let plan: 'free' | 'premium' | 'ultimate' = 'free';
        const priceId = stripeData.price_id || '';

        if (priceId === 'price_1SLrHPEgHdKvS0zO8QKasnnZ' || priceId === 'price_1SLrKnEgHdKvS0zOzzDlmFkI') {
          plan = 'premium';
        } else if (priceId === 'price_1SLrIOEgHdKvS0zOXc8g0xvR' || priceId === 'price_1SLrL8EgHdKvS0zOFy0VgBSD') {
          plan = 'ultimate';
        }

        const status = stripeData.subscription_status === 'active' ? 'active' :
                      stripeData.subscription_status === 'canceled' ? 'canceled' :
                      stripeData.subscription_status === 'past_due' ? 'past_due' :
                      stripeData.subscription_status === 'incomplete' ? 'incomplete' : 'expired';

        setSubscription({
          plan,
          status,
          stripe_customer_id: stripeData.customer_id,
          stripe_subscription_id: stripeData.subscription_id,
          current_period_start: stripeData.current_period_start
            ? new Date(stripeData.current_period_start * 1000)
            : null,
          current_period_end: stripeData.current_period_end
            ? new Date(stripeData.current_period_end * 1000)
            : null,
          cancel_at_period_end: stripeData.cancel_at_period_end || false,
        });
      }
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

    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const cancelSubscription = async () => {
    if (!user || !subscription?.stripe_subscription_id) {
      throw new Error('No active subscription');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`,
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
