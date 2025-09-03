-- Fix RLS policy circular dependency issue

-- Drop and recreate the problematic policy for conversation_participants
DROP POLICY IF EXISTS "Users can add participants to conversations they're in" ON public.conversation_participants;

-- Create a better policy that allows users to add themselves and others to new conversations
CREATE POLICY "Users can add participants to conversations" 
ON public.conversation_participants 
FOR INSERT 
WITH CHECK (
  -- Users can always add themselves
  user_id = auth.uid() 
  OR 
  -- Users can add others to conversations they created or are part of
  (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp 
      WHERE cp.conversation_id = conversation_participants.conversation_id 
      AND cp.user_id = auth.uid()
    )
  )
  OR
  -- Allow adding participants to newly created conversations (within the same transaction)
  NOT EXISTS (
    SELECT 1 FROM public.conversation_participants cp 
    WHERE cp.conversation_id = conversation_participants.conversation_id
  )
);