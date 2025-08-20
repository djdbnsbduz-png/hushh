import { UpdatedLayout } from './UpdatedLayout';

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

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent: boolean;
  isRead?: boolean;
  contactId: string;
}

export const Layout = () => {
  return <UpdatedLayout />;
};