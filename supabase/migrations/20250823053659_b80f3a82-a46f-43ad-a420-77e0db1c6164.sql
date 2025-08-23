-- Fix critical security issue: Restrict profile visibility to prevent data exposure
-- Drop the overly permissive policy that allows viewing all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Create secure policies that only allow legitimate access patterns:

-- 1. Users can always view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Users can view profiles of people they're in conversations with
CREATE POLICY "Users can view conversation participants profiles" 
ON profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = auth.uid() 
    AND cp2.user_id = profiles.user_id
  )
);

-- 3. Allow limited profile data for user search (username and display_name only)
-- We'll need to create a separate function for safe user searching
CREATE OR REPLACE FUNCTION public.search_users_safely(search_term text)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  display_name text, 
  username text, 
  avatar_url text
) 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = public
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
    AND p.user_id != auth.uid()  -- Don't return current user in search
  LIMIT 20;
$$;

-- Create a function for username availability checking (no personal data exposed)
CREATE OR REPLACE FUNCTION public.check_username_availability(check_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE username = LOWER(check_username)
  );
$$;