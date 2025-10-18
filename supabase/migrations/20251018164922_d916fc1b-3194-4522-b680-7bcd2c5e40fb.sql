-- Allow authorized clan managers to update clan member roles
-- (fixes: roles not persisting because UPDATE was blocked by RLS)

-- Create UPDATE policy on clan_members
CREATE POLICY "Clan managers can update roles"
ON public.clan_members
FOR UPDATE
USING (
  -- Clan owner can manage members
  EXISTS (
    SELECT 1 FROM public.clans c
    WHERE c.id = clan_members.clan_id
      AND c.created_by = auth.uid()
  )
  OR
  -- Leaders / moderators in the same clan can manage members
  EXISTS (
    SELECT 1 FROM public.clan_members cm
    WHERE cm.clan_id = clan_members.clan_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('leader','vice_leader','moderator')
  )
)
WITH CHECK (
  -- Same condition for the new values
  EXISTS (
    SELECT 1 FROM public.clans c
    WHERE c.id = clan_members.clan_id
      AND c.created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.clan_members cm
    WHERE cm.clan_id = clan_members.clan_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('leader','vice_leader','moderator')
  )
);
