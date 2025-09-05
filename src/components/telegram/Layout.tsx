import { useState } from 'react';
import UpdatedLayout from './UpdatedLayout';
import { NewChatScreen } from '@/components/chat/NewChatScreen';

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  isOnline?: boolean;
  isTyping?: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  isSent: boolean;
  isRead?: boolean;
  contactId: string;
}

export const Layout = () => {
  const [showNewChat, setShowNewChat] = useState(false);

  if (showNewChat) {
    return <NewChatScreen onBack={() => setShowNewChat(false)} />;
  }

  return <UpdatedLayout onNewChat={() => setShowNewChat(true)} />;
};