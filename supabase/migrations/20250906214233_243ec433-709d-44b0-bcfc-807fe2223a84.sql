-- Enable real-time updates for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add messages table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;