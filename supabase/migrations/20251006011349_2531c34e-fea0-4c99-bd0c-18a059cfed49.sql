-- Fix RLS policies for conversations and conversation_participants tables

-- 1. Drop the overly permissive conversations INSERT policy
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;

-- 2. Create a more restrictive policy for conversations
-- Users can only create conversations (will be validated in app logic)
CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Update conversation_participants INSERT policy to prevent unauthorized additions
-- Drop existing policy first
DROP POLICY IF EXISTS "Users can add participants to conversations" ON public.conversation_participants;

-- 4. Create a new restrictive policy for adding participants
-- Users can only add themselves as participants OR add others if they're already in the conversation
CREATE POLICY "Users can join conversations or add participants"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  -- User can add themselves
  auth.uid() = user_id 
  OR 
  -- User is already in the conversation and can add others
  EXISTS (
    SELECT 1 
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id 
    AND cp.user_id = auth.uid()
  )
  OR
  -- First participant in a new conversation (no existing participants)
  NOT EXISTS (
    SELECT 1 
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
  )
);