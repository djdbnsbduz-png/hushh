-- Create a separate table for phone numbers with strict RLS
CREATE TABLE public.user_phone_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.user_phone_numbers ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own phone number
CREATE POLICY "Users can view own phone number"
ON public.user_phone_numbers
FOR SELECT
USING (auth.uid() = user_id);

-- Only allow users to insert their own phone number
CREATE POLICY "Users can insert own phone number"
ON public.user_phone_numbers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Only allow users to update their own phone number
CREATE POLICY "Users can update own phone number"
ON public.user_phone_numbers
FOR UPDATE
USING (auth.uid() = user_id);

-- Only allow users to delete their own phone number
CREATE POLICY "Users can delete own phone number"
ON public.user_phone_numbers
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_user_phone_numbers_updated_at
BEFORE UPDATE ON public.user_phone_numbers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing phone numbers to new table
INSERT INTO public.user_phone_numbers (user_id, phone)
SELECT user_id, phone 
FROM public.profiles 
WHERE phone IS NOT NULL;

-- Remove phone column from profiles table
ALTER TABLE public.profiles DROP COLUMN phone;

-- Drop the old policy that only allows viewing own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Add new policy to allow all authenticated users to view profiles (for user discovery)
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Drop and recreate the get_safe_profile_view function with updated signature
DROP FUNCTION IF EXISTS public.get_safe_profile_view(uuid);

CREATE FUNCTION public.get_safe_profile_view(target_user_id uuid)
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
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return profile data for any authenticated user
  -- Phone is now in a separate table with its own RLS
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
END;
$$;