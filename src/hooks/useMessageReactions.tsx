import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

interface ReactionGroup {
  emoji: string;
  count: number;
  users: string[];
  hasCurrentUser: boolean;
}

export const useMessageReactions = (conversationId: string | null) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<MessageReaction[]>([]);

  useEffect(() => {
    if (!conversationId) return;

    const fetchReactions = async () => {
      const { data: messages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId);

      if (!messages) return;

      const messageIds = messages.map(m => m.id);
      
      const { data } = await supabase
        .from('message_reactions')
        .select('*')
        .in('message_id', messageIds);

      if (data) {
        setReactions(data);
      }
    };

    fetchReactions();

    // Subscribe to reaction changes
    const channel = supabase
      .channel(`reactions:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          const newReaction = payload.new as MessageReaction;
          setReactions(prev => [...prev, newReaction]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          const deletedReaction = payload.old as MessageReaction;
          setReactions(prev => prev.filter(r => r.id !== deletedReaction.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      await supabase
        .from('message_reactions')
        .insert({ message_id: messageId, user_id: user.id, emoji });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const getMessageReactions = (messageId: string): ReactionGroup[] => {
    const messageReactions = reactions.filter(r => r.message_id === messageId);
    const grouped = new Map<string, ReactionGroup>();

    messageReactions.forEach(reaction => {
      const existing = grouped.get(reaction.emoji);
      if (existing) {
        existing.count++;
        existing.users.push(reaction.user_id);
        if (reaction.user_id === user?.id) {
          existing.hasCurrentUser = true;
        }
      } else {
        grouped.set(reaction.emoji, {
          emoji: reaction.emoji,
          count: 1,
          users: [reaction.user_id],
          hasCurrentUser: reaction.user_id === user?.id,
        });
      }
    });

    return Array.from(grouped.values());
  };

  return { reactions, addReaction, removeReaction, getMessageReactions };
};
