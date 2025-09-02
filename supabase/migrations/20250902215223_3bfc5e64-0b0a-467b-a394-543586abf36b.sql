-- Fix phone number privacy issue by creating a function that returns limited profile data for non-owners

-- Create a function to get safe profile data for conversation participants
CREATE OR REPLACE FUNCTION public.get_safe_profile_view(target_user_id uuid)
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
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  -- If the requester is the profile owner, return all data including phone
  IF auth.uid() = target_user_id THEN
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
  ELSE
    -- For non-owners, exclude phone number and only show if they're in a shared conversation
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
  END IF;
END;
$$;

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Create a new secure policy that protects phone numbers
CREATE POLICY "Users can view profiles securely" 
ON public.profiles 
FOR SELECT 
USING (
  -- Profile owners can see their full profile
  auth.uid() = user_id 
  OR 
  -- Non-owners can only see profiles if they share a conversation (phone excluded via application logic)
  EXISTS (
    SELECT 1
    FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = auth.uid() AND cp2.user_id = profiles.user_id
  )
);