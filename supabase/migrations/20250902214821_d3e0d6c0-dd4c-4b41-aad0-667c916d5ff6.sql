-- Fix security warnings by setting proper search_path for all functions

-- Update existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.search_users_safely(search_term text)
RETURNS TABLE(id uuid, user_id uuid, display_name text, username text, avatar_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.username,
    p.avatar_url
  FROM public.profiles p
  WHERE 
    (p.username ILIKE '%' || search_term || '%' 
     OR p.display_name ILIKE '%' || search_term || '%')
    AND p.user_id != auth.uid()
  LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.check_username_availability(check_username text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE username = LOWER(check_username)
  );
$$;

CREATE OR REPLACE FUNCTION public.user_can_access_conversation(conversation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  participant_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = $1 AND user_id = auth.uid()
  ) INTO participant_exists;
  
  RETURN participant_exists;
END;
$$;