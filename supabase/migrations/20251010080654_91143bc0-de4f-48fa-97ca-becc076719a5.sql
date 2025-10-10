-- Allow users to delete their own clans
CREATE POLICY "Users can delete their own clans"
ON public.clans
FOR DELETE
USING (auth.uid() = created_by);