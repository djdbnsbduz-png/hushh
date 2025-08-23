-- Remove the old insecure search function
DROP FUNCTION IF EXISTS public.search_users_by_identifier(text);