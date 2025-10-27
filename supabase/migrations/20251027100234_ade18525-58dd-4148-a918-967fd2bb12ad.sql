-- Create stripe_user_subscriptions table for tracking Stripe subscription data
CREATE TABLE IF NOT EXISTS public.stripe_user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  subscription_id TEXT,
  subscription_status TEXT,
  price_id TEXT,
  current_period_start BIGINT,
  current_period_end BIGINT,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_method_brand TEXT,
  payment_method_last4 TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.stripe_user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stripe_user_subscriptions
CREATE POLICY "Users can view own subscription data"
  ON public.stripe_user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription data"
  ON public.stripe_user_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription data"
  ON public.stripe_user_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create user_settings table for app-specific user preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  server_region TEXT DEFAULT 'auto',
  animations_enabled BOOLEAN DEFAULT true,
  image_quality TEXT DEFAULT 'high',
  notifications_enabled BOOLEAN DEFAULT true,
  fullscreen_mode BOOLEAN DEFAULT false,
  blur_enabled BOOLEAN DEFAULT false,
  blur_intensity INTEGER DEFAULT 5,
  profile_visibility TEXT DEFAULT 'public',
  statistics_public BOOLEAN DEFAULT true,
  analytics_enabled BOOLEAN DEFAULT true,
  fps_display_enabled BOOLEAN DEFAULT false,
  font_family TEXT DEFAULT 'system',
  performance_mode BOOLEAN DEFAULT false,
  high_contrast_mode BOOLEAN DEFAULT false,
  network_stats_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings"
  ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add missing column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_deactivated BOOLEAN DEFAULT false;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_stripe_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stripe_subscriptions_updated_at
  BEFORE UPDATE ON public.stripe_user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stripe_subscriptions_updated_at();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();