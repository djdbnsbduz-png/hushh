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
  participant_profile?: {
    display_name: string;
    username: string;
    avatar_url?: string;
    user_id: string;
  };
}

export const useMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ display_name?: string; avatar_url?: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      // Fetch user's own profile
      supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => setUserProfile(data));
        
      fetchConversations();
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    } else {
      setMessages([]);
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

      // Extract unique conversations and enrich DMs with participant info
      const uniqueConversations = participantData?.reduce((acc, item) => {
        const conv = item.conversations;
        if (conv && !acc.find(c => c.id === conv.id)) {
          acc.push(conv);
        }
        return acc;
      }, [] as any[]) || [];

      // For DM conversations, get the other participant's profile info
      const enrichedConversations = await Promise.all(
        uniqueConversations.map(async (conversation) => {
          if (!conversation.is_group) {
            // Get the other participant
            const { data: participants } = await supabase
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', conversation.id)
              .neq('user_id', user?.id);

            if (participants && participants.length > 0) {
              const otherUserId = participants[0].user_id;
              
              // Get their profile
              const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, username, avatar_url, user_id')
                .eq('user_id', otherUserId)
                .single();

              if (profile) {
                return {
                  ...conversation,
                  participant_profile: profile
                };
              }
            }
          }
          return conversation;
        })
      );

      setConversations(enrichedConversations);
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

    // Create optimistic message for immediate UI update
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      content,
      sender_id: user.id,
      conversation_id: activeConversation,
      created_at: new Date().toISOString(),
      message_type: messageType as 'text' | 'image' | 'file',
      file_url: fileUrl,
      profiles: {
        user_id: user.id,
        display_name: userProfile?.display_name || '',
        avatar_url: userProfile?.avatar_url || null
      }
    };

    // Add optimistic message to UI immediately
    setMessages(prev => [...prev, optimisticMessage]);

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
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
      }
      // No need to refetch - real-time subscription will handle updates
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
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
        async (payload) => {
          const newMessage = payload.new as Message;
          
          // Update messages if this message belongs to the active conversation
          setMessages(prev => {
            // Remove any optimistic message with temp ID first
            const filteredMessages = prev.filter(msg => !msg.id.toString().startsWith('temp-'));
            
            // Check if we're viewing the conversation this message belongs to
            const isActiveConversation = activeConversation === newMessage.conversation_id;
            if (isActiveConversation) {
              // Only add if not already present
              if (!filteredMessages.find(m => m.id === newMessage.id)) {
                // Fetch sender profile if we don't have it
                const existingProfile = filteredMessages.find(msg => msg.sender_id === newMessage.sender_id)?.profiles;
                
                if (existingProfile) {
                  return [...filteredMessages, {
                    ...newMessage,
                    message_type: (newMessage.message_type || 'text') as 'text' | 'image' | 'file',
                    profiles: existingProfile
                  }];
                } else {
                  // Fetch profile and update later
                  supabase
                    .from('profiles')
                    .select('user_id, display_name, avatar_url')
                    .eq('user_id', newMessage.sender_id)
                    .single()
                    .then(({ data: senderProfile }) => {
                      if (senderProfile) {
                        setMessages(currentMessages => 
                          currentMessages.map(msg => 
                            msg.id === newMessage.id 
                              ? { ...msg, profiles: senderProfile }
                              : msg
                          )
                        );
                      }
                    });
                  
                  return [...filteredMessages, {
                    ...newMessage,
                    message_type: (newMessage.message_type || 'text') as 'text' | 'image' | 'file',
                    profiles: undefined
                  }];
                }
              }
            }
            return filteredMessages;
          });

          // Only update conversation list occasionally to reduce API calls
          if (Math.random() < 0.2) { // 20% chance to reduce server load
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const startNewConversation = async (participantUserId: string, participantName: string) => {
    if (!user) {
      console.error('No user found - not authenticated');
      return;
    }

    console.log('User authenticated:', user.id);
    console.log('Auth status:', !!user);

    try {
      console.log('Starting conversation with:', participantUserId, participantName);
      
      // First, check if a DM conversation already exists between these two users
      const { data: existingConversations, error: fetchError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner(*)
        `)
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Error fetching existing conversations:', fetchError);
        throw fetchError;
      }

      // Check each conversation to see if it's a DM with the target user
      for (const convData of existingConversations || []) {
        const conversation = convData.conversations;
        if (!conversation.is_group) {
          // Get all participants for this conversation
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversation.id);

          // Check if this is a DM with the target user (only 2 participants)
          if (participants?.length === 2) {
            const participantIds = participants.map(p => p.user_id);
            if (participantIds.includes(participantUserId)) {
              // Found existing DM conversation
              setActiveConversation(conversation.id);
              fetchConversations();
              return conversation.id;
            }
          }
        }
      }

      // No existing conversation found, create a new one
      console.log('Creating new conversation...');
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title: participantName,
          is_group: false,
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw convError;
      }

      console.log('Created conversation:', conversation);

      // Add both users as participants
      console.log('Adding participants:', [user.id, participantUserId]);
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: user.id },
          { conversation_id: conversation.id, user_id: participantUserId }
        ]);

      if (participantsError) {
        console.error('Error adding participants:', participantsError);
        throw participantsError;
      }

      // Refresh conversations and set as active
      setActiveConversation(conversation.id);
      fetchConversations();
      
      return conversation.id;
    } catch (error) {
      console.error('Error starting new conversation:', error);
      throw error;
    }
  };

  return {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    loading,
    sendMessage,
    createConversation,
    startNewConversation,
    fetchConversations,
  };
};