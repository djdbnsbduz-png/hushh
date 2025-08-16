import { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Sidebar } from './Sidebar';
import { ChatView } from './ChatView';
import { WelcomeScreen } from './WelcomeScreen';

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
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      lastMessage: 'Hey! How are you doing?',
      timestamp: '2:34 PM',
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: '2',
      name: 'Bob Smith',
      lastMessage: 'Let\'s meet tomorrow',
      timestamp: '1:15 PM',
      isOnline: false,
    },
    {
      id: '3',
      name: 'Design Team',
      lastMessage: 'Sarah: The new mockups are ready',
      timestamp: '12:45 PM',
      unreadCount: 5,
      isOnline: true,
    },
    {
      id: '4',
      name: 'Mom',
      lastMessage: 'Don\'t forget dinner tonight!',
      timestamp: 'Yesterday',
      isOnline: true,
      isTyping: false,
    },
  ]);

  const [messages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey! How are you doing?',
      timestamp: '2:34 PM',
      isSent: false,
      isRead: true,
      contactId: '1',
    },
    {
      id: '2',
      content: 'I\'m doing great! Just working on some new projects. How about you?',
      timestamp: '2:35 PM',
      isSent: true,
      isRead: true,
      contactId: '1',
    },
    {
      id: '3',
      content: 'That sounds awesome! I\'d love to hear more about it.',
      timestamp: '2:36 PM',
      isSent: false,
      isRead: true,
      contactId: '1',
    },
  ]);

  const currentMessages = messages.filter(m => m.contactId === selectedContact?.id);

  return (
    <div className="h-screen bg-gradient-bg">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
          <Sidebar
            contacts={contacts}
            selectedContact={selectedContact}
            onSelectContact={setSelectedContact}
          />
        </ResizablePanel>
        
        <ResizableHandle className="w-1 bg-card-border hover:bg-telegram-blue transition-colors" />
        
        <ResizablePanel defaultSize={70}>
          {selectedContact ? (
            <ChatView
              contact={selectedContact}
              messages={currentMessages}
            />
          ) : (
            <WelcomeScreen />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};