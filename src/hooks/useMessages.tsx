import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface Conversation {
  id: string;
  title?: string;
  is_group: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const useMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchConversations();
      setupRealtimeSubscription();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      // First get conversations where user is a participant
      const { data: participantData, error: partError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner(*)
        `)
        .eq('user_id', user?.id);

      if (partError) {
        console.error('Error fetching conversations:', partError);
        return;
      }

      // Extract unique conversations
      const uniqueConversations = participantData?.reduce((acc, item) => {
        const conv = item.conversations;
        if (conv && !acc.find(c => c.id === conv.id)) {
          acc.push(conv);
        }
        return acc;
      }, [] as any[]) || [];

      setConversations(uniqueConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        // Fetch profiles for message senders
        const senderIds = [...new Set(data?.map(m => m.sender_id) || [])];
        if (senderIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, display_name, avatar_url')
            .in('user_id', senderIds);

          const profilesMap = new Map(
            profilesData?.map(p => [p.user_id, p]) || []
          );

          const messagesWithProfiles = data?.map(message => ({
            ...message,
            message_type: (message.message_type || 'text') as 'text' | 'image' | 'file',
            profiles: profilesMap.get(message.sender_id)
          })) || [];

          setMessages(messagesWithProfiles);
        } else {
          const typedMessages = data?.map(message => ({
            ...message,
            message_type: (message.message_type || 'text') as 'text' | 'image' | 'file'
          })) || [];
          setMessages(typedMessages);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (content: string, messageType: 'text' | 'image' | 'file' = 'text', fileUrl?: string) => {
    if (!user || !activeConversation) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversation,
          sender_id: user.id,
          content,
          message_type: messageType,
          file_url: fileUrl,
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const createConversation = async (participantIds: string[], title?: string, isGroup = false) => {
    if (!user) return;

    try {
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title,
          is_group: isGroup,
        })
        .select()
        .single();

      if (convError) {
        throw convError;
      }

      // Add all participants including the current user
      const allParticipantIds = [...participantIds, user.id];
      const participantInserts = allParticipantIds.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
      }));

      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert(participantInserts);

      if (participantError) {
        throw participantError;
      }

      setActiveConversation(conversation.id);
      fetchConversations();

      return conversation.id;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.conversation_id === activeConversation) {
            setMessages(prev => [...prev, newMessage]);
          }
          // Update conversation list to show latest message
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    loading,
    sendMessage,
    createConversation,
    fetchConversations,
  };
};