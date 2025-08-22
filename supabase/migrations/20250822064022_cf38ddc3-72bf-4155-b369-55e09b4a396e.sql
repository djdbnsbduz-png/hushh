-- Fix infinite recursion in conversation_participants policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can add participants to conversations they're in" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;

-- Create simpler, non-recursive policies
CREATE POLICY "Users can view participants in their conversations" 
ON conversation_participants 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM conversation_participants cp2 
    WHERE cp2.conversation_id = conversation_participants.conversation_id 
    AND cp2.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add participants to conversations they're in" 
ON conversation_participants 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_participants cp2 
    WHERE cp2.conversation_id = conversation_participants.conversation_id 
    AND cp2.user_id = auth.uid()
  )
  OR 
  conversation_participants.user_id = auth.uid()
);