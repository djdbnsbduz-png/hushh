-- Fix conversations table RLS policy for INSERT
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Create a more explicit policy that allows authenticated users to create conversations
CREATE POLICY "Authenticated users can create conversations" 
ON public.conversations 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);