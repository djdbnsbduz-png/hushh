-- Add profile accent color column
ALTER TABLE public.profiles 
ADD COLUMN profile_accent_color text DEFAULT '#6366f1';