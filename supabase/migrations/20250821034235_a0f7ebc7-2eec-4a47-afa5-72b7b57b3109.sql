-- Make usernames unique and add phone number uniqueness
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Create index for faster username searches
CREATE INDEX idx_profiles_username ON public.profiles (username);
CREATE INDEX idx_profiles_phone ON public.profiles (phone);

-- Create a function to search users by username or phone
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