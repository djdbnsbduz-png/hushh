import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TypingUser {
  user_id: string;
  display_name: string;
}

export const useTypingIndicator = (conversationId: string | null) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!conversationId || !user) {
      setTypingUsers([]);
      return;
    }

    const typingChannel = supabase.channel(`typing:${conversationId}`);

    typingChannel
      .on('presence', { event: 'sync' }, () => {
        const state = typingChannel.presenceState();
        const users: TypingUser[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id !== user.id && presence.is_typing) {
              users.push({
                user_id: presence.user_id,
                display_name: presence.display_name
              });
            }
          });
        });
        
        setTypingUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setChannel(typingChannel);
        }
      });

    return () => {
      typingChannel.untrack();
      supabase.removeChannel(typingChannel);
      setChannel(null);
      setTypingUsers([]);
    };
  }, [conversationId, user]);

  const setTyping = useCallback(async (isTyping: boolean, displayName: string) => {
    if (!channel || !user) return;

    try {
      if (isTyping) {
        await channel.track({
          user_id: user.id,
          display_name: displayName,
          is_typing: true,
          timestamp: new Date().toISOString(),
        });
      } else {
        await channel.untrack();
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }, [channel, user]);

  return { typingUsers, setTyping };
};
