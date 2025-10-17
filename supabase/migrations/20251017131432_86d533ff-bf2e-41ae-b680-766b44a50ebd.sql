-- Fix RLS policies to require authentication for sensitive data
-- This prevents data scraping and privacy violations

-- Profiles table - require authentication
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Leaderboards table - require authentication
DROP POLICY IF EXISTS "Leaderboards are viewable by everyone" ON public.leaderboards;
CREATE POLICY "Leaderboards viewable by authenticated users" ON public.leaderboards
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- User_stats table - require authentication
DROP POLICY IF EXISTS "Anyone can view user stats" ON public.user_stats;
CREATE POLICY "User stats viewable by authenticated users" ON public.user_stats
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Clans table - require authentication
DROP POLICY IF EXISTS "Clans are viewable by everyone" ON public.clans;
CREATE POLICY "Clans viewable by authenticated users" ON public.clans
  FOR SELECT USING (auth.uid() IS NOT NULL);