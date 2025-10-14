-- Add RLS policy to allow admins to update any user's stats
CREATE POLICY "Admins can update any user stats"
ON public.user_stats
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));