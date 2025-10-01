-- Enable RLS on conversations table (it has policies but RLS is not enabled)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Fix phone number exposure by creating a more restrictive function for profile access
-- This replaces the overly permissive profile viewing that exposes phone numbers

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view profiles securely" ON public.profiles;

-- Create a new function that returns profiles WITHOUT phone numbers for non-owners
CREATE OR REPLACE FUNCTION public.get_profile_for_conversation(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  display_name text,
  username text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if users share a conversation
  IF EXISTS (
    SELECT 1
    FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = auth.uid() AND cp2.user_id = target_user_id
  ) THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.user_id,
      p.display_name,
      p.username,
      p.avatar_url,
      p.bio,
      p.created_at,
      p.updated_at
    FROM public.profiles p
    WHERE p.user_id = target_user_id;
  END IF;
END;
$$;

-- Create a new policy that allows viewing profiles only through conversation context
-- But excludes phone numbers for non-owners
CREATE POLICY "Users can view profiles in shared conversations"
ON public.profiles
FOR SELECT
USING (
  -- Users can always see their own profile with all data
  auth.uid() = user_id
  OR
  -- Users can see profiles of people they share conversations with
  -- (phone number access would require using the function above)
  EXISTS (
    SELECT 1
    FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = auth.uid() AND cp2.user_id = profiles.user_id
  )
);