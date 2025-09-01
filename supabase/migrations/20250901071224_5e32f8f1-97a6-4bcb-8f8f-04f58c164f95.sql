-- First, create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.is_profile_owner(profile_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN profile_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(conversation_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = $1 AND cp.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop and recreate the problematic policies that cause infinite recursion

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can view conversation participants profiles" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles
FOR SELECT USING (
  public.is_profile_owner(user_id) OR 
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp1 
    JOIN public.conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = auth.uid() AND cp2.user_id = profiles.user_id
  )
);

-- Fix conversations policies  
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
CREATE POLICY "Users can view conversations they participate in" ON public.conversations
FOR SELECT USING (public.is_conversation_participant(id));

-- Fix conversation_participants policies
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.is_conversation_participant(conversation_id)
);

DROP POLICY IF EXISTS "Users can add participants to conversations they're in" ON public.conversation_participants;
CREATE POLICY "Users can add participants to conversations they're in" ON public.conversation_participants
FOR INSERT WITH CHECK (
  user_id = auth.uid() OR 
  public.is_conversation_participant(conversation_id)
);