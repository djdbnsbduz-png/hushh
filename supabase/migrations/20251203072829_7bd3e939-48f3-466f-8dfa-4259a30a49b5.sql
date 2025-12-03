-- Add new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'rich';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'pretty';

-- Add banner_url and name_font columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS name_font text DEFAULT 'default';