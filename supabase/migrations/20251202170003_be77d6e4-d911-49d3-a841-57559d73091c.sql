-- Create global_messages table for global chat
CREATE TABLE public.global_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  message TEXT,
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.global_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view global messages" 
ON public.global_messages 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can send global messages" 
ON public.global_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
ON public.global_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable realtime for this table
ALTER TABLE public.global_messages REPLICA IDENTITY FULL;

-- Create storage bucket for global chat media
INSERT INTO storage.buckets (id, name, public) VALUES ('global-chat-media', 'global-chat-media', true);

-- Create storage policies for global chat media
CREATE POLICY "Global chat media is publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'global-chat-media');

CREATE POLICY "Authenticated users can upload global chat media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'global-chat-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own global chat media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'global-chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create user_read_messages table to track last read message per user
CREATE TABLE public.user_global_chat_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_global_chat_reads ENABLE ROW LEVEL SECURITY;

-- Create policies for read tracking
CREATE POLICY "Users can view their own read status" 
ON public.user_global_chat_reads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own read status" 
ON public.user_global_chat_reads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own read status" 
ON public.user_global_chat_reads 
FOR UPDATE 
USING (auth.uid() = user_id);