-- Fix the handle_new_user function to prevent duplicate username errors

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 1;
BEGIN
  -- Get the username from metadata if provided, otherwise generate from email
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)), ' ', ''))
  );
  
  -- Ensure username is not empty
  IF base_username IS NULL OR base_username = '' THEN
    base_username := SPLIT_PART(NEW.email, '@', 1);
  END IF;
  
  -- Clean the username (remove spaces, special chars, make lowercase)
  base_username := LOWER(REGEXP_REPLACE(base_username, '[^a-zA-Z0-9_]', '', 'g'));
  
  -- Start with the base username
  final_username := base_username;
  
  -- If username already exists, append numbers until we find a unique one
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    final_username := base_username || counter::text;
    counter := counter + 1;
    
    -- Safety limit to prevent infinite loops
    IF counter > 1000 THEN
      final_username := base_username || extract(epoch from now())::bigint::text;
      EXIT;
    END IF;
  END LOOP;
  
  -- Insert the profile with the unique username
  INSERT INTO public.profiles (
    user_id, 
    display_name, 
    username,
    phone,
    bio
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    final_username,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'bio'
  );
  
  RETURN NEW;
END;
$$;