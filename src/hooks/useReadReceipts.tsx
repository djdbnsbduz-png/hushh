import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ReadReceipt {
  message_id: string;
  user_id: string;
  read_at: string;
}

export const useReadReceipts = (conversationId: string | null) => {
  const { user } = useAuth();
  const [readReceipts, setReadReceipts] = useState<ReadReceipt[]>([]);

  useEffect(() => {
    if (!conversationId) return;

    const fetchReadReceipts = async () => {
      const { data: messages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId);

      if (!messages) return;

      const messageIds = messages.map(m => m.id);
      
      const { data } = await supabase
        .from('message_read_receipts')
        .select('*')
        .in('message_id', messageIds);

      if (data) {
        setReadReceipts(data);
      }
    };

    fetchReadReceipts();

    // Subscribe to new read receipts
    const channel = supabase
      .channel(`read-receipts:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_read_receipts',
        },
        (payload) => {
          const newReceipt = payload.new as ReadReceipt;
          setReadReceipts(prev => [...prev, newReceipt]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('message_read_receipts')
        .insert({ message_id: messageId, user_id: user.id });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const isMessageRead = (messageId: string, senderId: string) => {
    if (senderId === user?.id) {
      // For messages sent by current user, check if anyone else has read it
      return readReceipts.some(r => r.message_id === messageId && r.user_id !== user.id);
    }
    return false;
  };

  const hasCurrentUserRead = (messageId: string) => {
    return readReceipts.some(r => r.message_id === messageId && r.user_id === user?.id);
  };

  return { readReceipts, markAsRead, isMessageRead, hasCurrentUserRead };
};
