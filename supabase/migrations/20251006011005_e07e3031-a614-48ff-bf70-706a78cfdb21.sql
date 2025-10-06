-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Create a helper function to check if two users share a conversation
CREATE OR REPLACE FUNCTION public.users_share_conversation(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = user1_id AND cp2.user_id = user2_id
  );
END;
$$;

-- Create a new restrictive policy that only allows viewing profiles of conversation partners
CREATE POLICY "Users can view own profile and conversation partners"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  users_share_conversation(auth.uid(), user_id)
);