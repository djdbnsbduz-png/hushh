-- Create message_read_receipts table
CREATE TABLE IF NOT EXISTS public.message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view read receipts for messages in their conversations
CREATE POLICY "Users can view read receipts in their conversations"
ON public.message_read_receipts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_read_receipts.message_id
    AND cp.user_id = auth.uid()
  )
);

-- Policy: Users can mark messages as read
CREATE POLICY "Users can mark messages as read"
ON public.message_read_receipts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create message_reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view reactions in their conversations
CREATE POLICY "Users can view reactions in their conversations"
ON public.message_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_reactions.message_id
    AND cp.user_id = auth.uid()
  )
);

-- Policy: Users can add reactions
CREATE POLICY "Users can add reactions"
ON public.message_reactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove their own reactions
CREATE POLICY "Users can remove their own reactions"
ON public.message_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Create muted_users table
CREATE TABLE IF NOT EXISTS public.muted_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muted_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, muted_user_id)
);

-- Enable RLS
ALTER TABLE public.muted_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own muted users
CREATE POLICY "Users can view their own muted users"
ON public.muted_users
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can mute other users
CREATE POLICY "Users can mute other users"
ON public.muted_users
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can unmute users
CREATE POLICY "Users can unmute users"
ON public.muted_users
FOR DELETE
USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message_id ON public.message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_muted_users_user_id ON public.muted_users(user_id);