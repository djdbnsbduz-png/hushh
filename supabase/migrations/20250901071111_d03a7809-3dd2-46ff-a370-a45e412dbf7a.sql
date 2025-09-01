-- Drop all existing policies to start fresh  
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view conversation participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view conversation participants for their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can insert conversation participants for their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can access conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in conversations they participate in" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in conversations they participate in" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

-- Create security definer functions to avoid recursion
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

-- Create new safe RLS policies using security definer functions
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (public.is_profile_owner(user_id));

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (public.is_profile_owner(user_id));

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (public.is_profile_owner(user_id));

-- Fix conversation participants policies
CREATE POLICY "Users can view conversation participants for their conversations" ON public.conversation_participants
FOR SELECT USING (public.is_conversation_participant(conversation_id));

CREATE POLICY "Users can insert conversation participants for their conversations" ON public.conversation_participants
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Fix conversations policies  
CREATE POLICY "Users can view conversations they participate in" ON public.conversations
FOR SELECT USING (public.is_conversation_participant(id));

CREATE POLICY "Users can update conversations they participate in" ON public.conversations
FOR UPDATE USING (public.is_conversation_participant(id));

CREATE POLICY "Users can insert conversations" ON public.conversations
FOR INSERT WITH CHECK (true); -- Allow any authenticated user to create conversations

-- Fix messages policies
CREATE POLICY "Users can view messages in conversations they participate in" ON public.messages
FOR SELECT USING (public.is_conversation_participant(conversation_id));

CREATE POLICY "Users can insert messages in conversations they participate in" ON public.messages
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND 
  public.is_conversation_participant(conversation_id)
);

CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON public.messages
FOR DELETE USING (user_id = auth.uid());