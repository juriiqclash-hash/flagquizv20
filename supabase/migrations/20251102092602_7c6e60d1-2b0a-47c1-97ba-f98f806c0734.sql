-- Allow admins to update profiles
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert user stats (for upsert operations in admin tools)
DROP POLICY IF EXISTS "Admins can insert user stats" ON public.user_stats;
CREATE POLICY "Admins can insert user stats"
ON public.user_stats
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));