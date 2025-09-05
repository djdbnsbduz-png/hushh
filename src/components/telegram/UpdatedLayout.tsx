import { useState, useMemo, useCallback, memo } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { Separator } from '@/components/ui/separator';
import { Search, Send, Settings, Plus, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ConversationCard } from './ConversationCard';
import { OptimizedMessageBubble } from './OptimizedMessageBubble';

interface UpdatedLayoutProps {
  onNewChat: () => void;
}

const UpdatedLayout = ({ onNewChat }: UpdatedLayoutProps) => {
  const { 
    conversations, 
    messages, 
    sendMessage, 
    setActiveConversation, 
    activeConversation: activeConversationFromHook 
  } = useMessages();
  const { profile } = useProfile();
  const [newMessage, setNewMessage] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSendMessage = useCallback(async () => {
    if (newMessage.trim()) {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    }
  }, [newMessage, sendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleConversationClick = useCallback((conversationId: string) => {
    setActiveConversation(conversationId);
  }, [setActiveConversation]);

  // Memoize filtered conversations to prevent unnecessary re-renders
  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return conversations.filter(conv => {
      const searchName = conv.participant_profile?.display_name || conv.title || '';
      return searchName.toLowerCase().includes(lowerSearchTerm);
    });
  }, [conversations, searchTerm]);

  // Memoize active conversation messages for better performance
  const activeMessages = useMemo(() => 
    messages.filter(message => message.conversation_id === activeConversationFromHook),
    [messages, activeConversationFromHook]
  );

  const activeConv = conversations.find(c => c.id === activeConversationFromHook);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>{profile?.display_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-sidebar-foreground">{profile?.display_name || 'User'}</h2>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 bg-input border-input-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map((conversation) => {
              // Find last message for this conversation
              const lastMessage = messages
                .filter(m => m.conversation_id === conversation.id)
                .pop()?.content;
              
              return (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  isActive={activeConversationFromHook === conversation.id}
                  lastMessage={lastMessage}
                  onClick={handleConversationClick}
                />
              );
            })}
          </div>
        </ScrollArea>

        {/* New Chat Button */}
        <div className="p-4 border-t border-sidebar-border">
          <Button className="w-full" variant="outline" onClick={onNewChat}>
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversationFromHook ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activeConv?.participant_profile?.avatar_url || activeConv?.avatar_url} />
                  <AvatarFallback>
                    {activeConv?.participant_profile?.display_name?.[0]?.toUpperCase() || 
                     activeConv?.title?.[0]?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {activeConv?.participant_profile?.display_name || 
                     activeConv?.title || 'Conversation'}
                  </h3>
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {activeMessages.map((message) => (
                  <OptimizedMessageBubble
                    key={message.id}
                    message={message}
                    isCurrentUser={message.sender_id === profile?.user_id}
                  />
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to 隱私</h2>
              <p className="text-muted-foreground mb-8">
                Select a conversation to start chatting
              </p>
              <Button onClick={onNewChat}>
                <Plus className="mr-2 h-4 w-4" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default memo(UpdatedLayout);