-- Create a simple security definer function that avoids recursion
CREATE OR REPLACE FUNCTION public.user_can_access_conversation(conversation_id uuid)
RETURNS boolean AS $$
DECLARE
  participant_exists boolean;
BEGIN
  -- Direct query without triggering RLS
  SELECT EXISTS(
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = $1 AND user_id = auth.uid()
  ) INTO participant_exists;
  
  RETURN participant_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update the most problematic policy on conversations table
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
CREATE POLICY "Users can access their conversations" ON public.conversations
FOR SELECT USING (public.user_can_access_conversation(id));