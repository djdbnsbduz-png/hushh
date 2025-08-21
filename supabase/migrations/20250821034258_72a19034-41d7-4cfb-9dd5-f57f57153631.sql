-- Fix security issue: Update function with secure search path
DROP FUNCTION IF EXISTS public.search_users_by_identifier(text);

CREATE OR REPLACE FUNCTION public.search_users_by_identifier(search_term text)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  display_name text,
  username text,
  avatar_url text,
  phone text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.username,
    p.avatar_url,
    p.phone
  FROM public.profiles p
  WHERE 
    p.username ILIKE '%' || search_term || '%' 
    OR p.phone ILIKE '%' || search_term || '%'
    OR p.display_name ILIKE '%' || search_term || '%'
  LIMIT 20;
$$;