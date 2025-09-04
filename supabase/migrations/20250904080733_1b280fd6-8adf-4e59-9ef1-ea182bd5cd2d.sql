-- Drop all existing policies on conversations table and create a simple one
DROP POLICY IF EXISTS "Users can access their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;

-- Create simple policies that work
CREATE POLICY "Anyone can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view conversations they participate in" 
ON public.conversations 
FOR SELECT 
USING (user_can_access_conversation(id));