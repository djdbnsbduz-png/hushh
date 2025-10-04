-- Add back RLS policy to profiles table to allow viewing profiles in shared conversations
-- The phone filtering will be handled by the profiles_safe view
CREATE POLICY "Users can view profiles in shared conversations"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can view their own profile  
  (auth.uid() = user_id)
  OR
  -- Users can view profiles of others in shared conversations
  (EXISTS (
    SELECT 1
    FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = auth.uid() AND cp2.user_id = profiles.user_id
  ))
);

-- Create a secure view that automatically filters phone numbers for non-owners
DROP VIEW IF EXISTS public.profiles_safe CASCADE;

CREATE VIEW public.profiles_safe 
WITH (security_barrier = true)
AS
SELECT 
  p.id,
  p.user_id,
  p.display_name,
  p.username,
  p.avatar_url,
  p.bio,
  -- Phone is only visible to the profile owner, NULL for everyone else
  CASE 
    WHEN p.user_id = auth.uid() THEN p.phone
    ELSE NULL
  END as phone,
  p.customization,
  p.created_at,
  p.updated_at
FROM public.profiles p;

-- Grant SELECT on the view
GRANT SELECT ON public.profiles_safe TO authenticated, anon;

-- Add a comment explaining the security mechanism
COMMENT ON VIEW public.profiles_safe IS 'Secure view that automatically filters phone numbers: owners see their phone, others see NULL. Use this view instead of the profiles table to prevent phone number exposure.';