-- Check and fix RLS policies that might cause ambiguous column references

-- First, let's see the current policies
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages');