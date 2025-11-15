import { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { usePresence } from '@/hooks/usePresence';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useReadReceipts } from '@/hooks/useReadReceipts';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useMutedUsers } from '@/hooks/useMutedUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Send, Settings, Plus, MoreHorizontal, LogOut, UserPlus, Scan, Shield, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ConversationCard } from './ConversationCard';
import { OptimizedMessageBubble } from './OptimizedMessageBubble';
import { supabase } from '@/integrations/supabase/client';

interface UpdatedLayoutProps {
  onNewChat: () => void;
}

const UpdatedLayout = ({ onNewChat }: UpdatedLayoutProps) => {
  const navigate = useNavigate();
  const { 
    conversations, 
    messages, 
    sendMessage, 
    setActiveConversation, 
    activeConversation: activeConversationFromHook 
  } = useMessages();
  const { profile } = useProfile();
  const { signOut, user } = useAuth();
  const { isAdmin } = useRole();
  const { isUserOnline } = usePresence();
  const { typingUsers, setTyping } = useTypingIndicator(activeConversationFromHook);
  const { markAsRead, isMessageRead } = useReadReceipts(activeConversationFromHook);
  const { getMessageReactions, addReaction, removeReaction } = useMessageReactions(activeConversationFromHook);
  const { muteUser, isUserMuted } = useMutedUsers();
  const [newMessage, setNewMessage] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedAccounts, setSavedAccounts] = useState<Array<{ email: string; id: string }>>([]);
  const [hiddenMessageIds, setHiddenMessageIds] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Load saved accounts from localStorage
  useMemo(() => {
    const accounts = localStorage.getItem('saved_accounts');
    if (accounts) {
      setSavedAccounts(JSON.parse(accounts));
    }
  }, []);

  const handleLogout = useCallback(async () => {
    // Save current account to localStorage before logging out
    if (profile) {
      const currentAccounts = JSON.parse(localStorage.getItem('saved_accounts') || '[]');
      const accountExists = currentAccounts.some((acc: any) => acc.id === profile.user_id);
      
      if (!accountExists) {
        const updatedAccounts = [...currentAccounts, { 
          email: profile.display_name || 'User', 
          id: profile.user_id 
        }];
        localStorage.setItem('saved_accounts', JSON.stringify(updatedAccounts));
      }
    }
    
    await signOut();
  }, [signOut, profile]);

  const handleSwitchAccount = useCallback(() => {
    // For now, just logout - the user will need to login with another account
    // In a real implementation, you'd maintain multiple session tokens
    signOut();
  }, [signOut]);

  const handleSendMessage = useCallback(async () => {
    if (newMessage.trim()) {
      // Stop typing indicator before sending
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setTyping(false, profile?.display_name || 'User');
      
      await sendMessage(newMessage.trim());
      setNewMessage('');
    }
  }, [newMessage, sendMessage, setTyping, profile?.display_name]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleConversationClick = useCallback((conversationId: string) => {
    setActiveConversation(conversationId);
  }, [setActiveConversation]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!profile?.display_name) return;
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set typing status
    setTyping(true, profile.display_name);
    
    // Clear typing status after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false, profile.display_name);
    }, 2000);
  }, [setTyping, profile?.display_name]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

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
  const activeMessages = useMemo(() => {
    const filtered = messages
      .filter(message => message.conversation_id === activeConversationFromHook)
      .filter(message => !hiddenMessageIds.has(message.id))
      .filter(message => !isUserMuted(message.sender_id));
    return filtered;
  }, [messages, activeConversationFromHook, hiddenMessageIds, isUserMuted]);

  // Mark messages as read when viewing them
  useEffect(() => {
    if (!activeConversationFromHook || !user) return;

    const markMessagesAsRead = async () => {
      for (const message of activeMessages) {
        if (message.sender_id !== user.id) {
          await markAsRead(message.id);
        }
      }
    };

    markMessagesAsRead();
  }, [activeMessages, activeConversationFromHook, user, markAsRead]);

  const handleClearMessage = useCallback((messageId: string) => {
    setHiddenMessageIds(prev => new Set([...prev, messageId]));
  }, []);

  const handleMuteMessageUser = useCallback((userId: string) => {
    muteUser(userId);
  }, [muteUser]);

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
                <h2 className="font-semibold text-sidebar-foreground flex items-center gap-2">
                  {profile?.display_name || 'User'}
                  {isAdmin && <Crown className="h-4 w-4 text-white" fill="white" />}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {user && isUserOnline(user.id) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black border-border">
                  <DropdownMenuLabel>Account Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {savedAccounts.length > 0 && (
                    <>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Switch Account
                      </DropdownMenuLabel>
                      {savedAccounts.map((account) => (
                        <DropdownMenuItem 
                          key={account.id}
                          onClick={handleSwitchAccount}
                          className="cursor-pointer"
                        >
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="text-xs">
                              {account.email[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{account.email}</span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem onClick={handleSwitchAccount} className="cursor-pointer">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Add Account</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Lookup Tools Button */}
          <Button 
            variant="outline" 
            className="w-full mb-3 justify-start"
            onClick={() => navigate('/lookup-tools')}
          >
            <Scan className="h-4 w-4 mr-2" />
            Lookup Tools
          </Button>
          
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
          <div key={activeConversationFromHook} className="flex flex-col h-full animate-fade-in">
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
                  <p className="text-sm text-muted-foreground">
                    {typingUsers.length > 0 
                      ? `${typingUsers[0].display_name} is typing...`
                      : activeConv?.participant_profile?.user_id && isUserOnline(activeConv.participant_profile.user_id)
                        ? 'Online'
                        : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 animate-scale-in">
              <div className="space-y-4">
                {activeMessages.map((message) => {
                  const messageReactions = getMessageReactions(message.id);
                  const isRead = isMessageRead(message.id, message.sender_id);
                  
                  return (
                    <OptimizedMessageBubble
                      key={message.id}
                      message={message}
                      isCurrentUser={message.sender_id === profile?.user_id}
                      isRead={isRead}
                      reactions={messageReactions}
                      onAddReaction={(emoji) => addReaction(message.id, emoji)}
                      onRemoveReaction={(emoji) => removeReaction(message.id, emoji)}
                      onMuteUser={() => handleMuteMessageUser(message.sender_id)}
                      onClearMessage={() => handleClearMessage(message.id)}
                    />
                  );
                })}
                
                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-message-received">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-telegram-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-telegram-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-telegram-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {typingUsers[0].display_name} is typing...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center animate-fade-in">
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