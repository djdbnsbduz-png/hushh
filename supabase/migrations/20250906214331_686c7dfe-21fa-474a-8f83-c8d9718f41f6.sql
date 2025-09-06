-- Enable real-time updates for messages table (improve data capture)
ALTER TABLE public.messages REPLICA IDENTITY FULL;