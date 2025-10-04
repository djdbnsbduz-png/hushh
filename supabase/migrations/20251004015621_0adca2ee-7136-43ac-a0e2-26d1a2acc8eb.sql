-- Remove the permissive policy that still exposes phone numbers
DROP POLICY IF EXISTS "Users can view profiles in shared conversations" ON public.profiles;

-- Remove the view since we'll use RPC functions instead
DROP VIEW IF EXISTS public.profiles_safe CASCADE;

-- Recreate the secure RPC function for profile access
-- This function explicitly excludes phone numbers for non-owners
CREATE OR REPLACE FUNCTION public.get_conversation_profile(target_user_id uuid)
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
  -- Check if users share a conversation OR if viewing own profile
  IF auth.uid() = target_user_id OR EXISTS (
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

-- Function to get multiple profiles at once (for efficient batch queries)
CREATE OR REPLACE FUNCTION public.get_conversation_profiles(user_ids uuid[])
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
  WHERE p.user_id = ANY(user_ids)
  AND (
    p.user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM conversation_participants cp1
      JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
      WHERE cp1.user_id = auth.uid() AND cp2.user_id = p.user_id
    )
  );
END;
$$;