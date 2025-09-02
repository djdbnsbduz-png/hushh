-- Fix the remaining functions that need proper search_path

CREATE OR REPLACE FUNCTION public.is_profile_owner(profile_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN profile_user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(conversation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = $1 AND cp.user_id = auth.uid()
  );
END;
$$;