/*
  # Create Subscriptions Table

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key) - Unique subscription identifier
      - `user_id` (uuid) - References auth.users
      - `plan` (text) - Subscription plan type (free, premium, ultimate)
      - `status` (text) - Subscription status (active, canceled, expired)
      - `stripe_customer_id` (text) - Stripe customer ID
      - `stripe_subscription_id` (text) - Stripe subscription ID
      - `stripe_price_id` (text) - Stripe price ID
      - `current_period_start` (timestamptz) - Current billing period start
      - `current_period_end` (timestamptz) - Current billing period end
      - `cancel_at_period_end` (boolean) - Whether subscription will cancel at period end
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policy for users to read their own subscription
    - Add policy for authenticated users to insert their own subscription

  3. Important Notes
    - Users can only view their own subscription data
    - Stripe webhook will handle subscription updates via service role
    - Default plan is 'free' with 'active' status
*/

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own subscription (for initial free plan)
CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);

-- Add trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();