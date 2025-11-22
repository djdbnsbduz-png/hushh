-- Create table for temporary verification codes
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own codes
CREATE POLICY "Users can view own verification codes"
  ON public.verification_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert codes (via service role)
CREATE POLICY "Service role can insert verification codes"
  ON public.verification_codes
  FOR INSERT
  WITH CHECK (true);

-- Policy: System can update codes (via service role)
CREATE POLICY "Service role can update verification codes"
  ON public.verification_codes
  FOR UPDATE
  USING (true);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON public.verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON public.verification_codes(code);

-- Function to clean up expired codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.verification_codes
  WHERE expires_at < now() OR used = true;
END;
$$;