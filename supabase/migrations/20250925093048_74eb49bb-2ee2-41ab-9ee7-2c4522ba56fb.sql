-- Just set replica identity to full for both tables to get complete row data in realtime updates
ALTER TABLE public.match_participants REPLICA IDENTITY FULL;
ALTER TABLE public.matches REPLICA IDENTITY FULL;