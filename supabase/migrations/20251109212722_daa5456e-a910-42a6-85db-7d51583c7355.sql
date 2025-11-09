-- Drop existing policies on user_phone_numbers
DROP POLICY IF EXISTS "Users can view own phone number" ON public.user_phone_numbers;
DROP POLICY IF EXISTS "Users can insert own phone number" ON public.user_phone_numbers;
DROP POLICY IF EXISTS "Users can update own phone number" ON public.user_phone_numbers;
DROP POLICY IF EXISTS "Users can delete own phone number" ON public.user_phone_numbers;

-- Recreate policies with authenticated users only
CREATE POLICY "Users can view own phone number"
ON public.user_phone_numbers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own phone number"
ON public.user_phone_numbers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own phone number"
ON public.user_phone_numbers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own phone number"
ON public.user_phone_numbers
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);