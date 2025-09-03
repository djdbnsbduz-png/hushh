-- Fix ambiguous column reference in database functions

-- Update the user_can_access_conversation function with proper table qualification
CREATE OR REPLACE FUNCTION public.user_can_access_conversation(conversation_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  participant_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = user_can_access_conversation.conversation_id 
    AND cp.user_id = auth.uid()
  ) INTO participant_exists;
  
  RETURN participant_exists;
END;
$function$;

-- Update the is_conversation_participant function with proper table qualification  
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conversation_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = is_conversation_participant.conversation_id 
    AND cp.user_id = auth.uid()
  );
END;
$function$;