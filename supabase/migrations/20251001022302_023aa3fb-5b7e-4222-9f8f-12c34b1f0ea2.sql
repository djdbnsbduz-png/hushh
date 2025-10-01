-- Fix phone number exposure in profiles table
-- Drop the overly permissive RLS policy that exposes phone numbers
DROP POLICY IF EXISTS "Users can view profiles in shared conversations" ON public.profiles;

-- Drop existing functions to recreate them with proper signatures
DROP FUNCTION IF EXISTS public.get_safe_profile_view(uuid);
DROP FUNCTION IF EXISTS public.get_profile_for_conversation(uuid);

-- Create a more secure function to get profiles for conversations (without phone)
CREATE OR REPLACE FUNCTION public.get_profile_for_conversation_safe(target_user_id uuid)
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
  -- Only return profile if users share a conversation
  -- Phone number is explicitly excluded for privacy
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

-- Create function that returns phone ONLY for the owner, NULL for others
CREATE OR REPLACE FUNCTION public.get_safe_profile_view(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  display_name text,
  username text,
  avatar_url text,
  bio text,
  phone text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the requester is the profile owner, return all data INCLUDING phone
  IF auth.uid() = target_user_id THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.user_id,
      p.display_name,
      p.username,
      p.avatar_url,
      p.bio,
      p.phone,
      p.created_at,
      p.updated_at
    FROM public.profiles p
    WHERE p.user_id = target_user_id;
  ELSE
    -- For non-owners, phone is NULL and only show if they're in a shared conversation
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
        NULL::text as phone,
        p.created_at,
        p.updated_at
      FROM public.profiles p
      WHERE p.user_id = target_user_id;
    END IF;
  END IF;
END;
$$;