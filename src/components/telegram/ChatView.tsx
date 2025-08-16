import { useState } from 'react';
import { Phone, Video, MoreVertical, Smile, Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageBubble } from './MessageBubble';
import type { Contact, Message } from './Layout';

interface ChatViewProps {
  contact: Contact;
  messages: Message[];
}

export const ChatView = ({ contact, messages }: ChatViewProps) => {
  const [messageText, setMessageText] = useState('');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Here you would normally send the message to your backend
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-card-border bg-card shadow-sm">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={contact.avatar} />
            <AvatarFallback className="bg-telegram-blue text-white">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          {contact.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-online border-2 border-card rounded-full"></div>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-semibold text-card-foreground">
            {contact.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {contact.isTyping ? (
              <span className="text-typing animate-pulse">typing...</span>
            ) : contact.isOnline ? (
              'online'
            ) : (
              'last seen recently'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-card-foreground">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-card-foreground">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-card-foreground">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-card-border bg-card">
        <div className="flex items-end gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-card-foreground">
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Write a message..."
              className="pr-10 bg-input border-input-border focus:ring-input-ring resize-none"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-card-foreground"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="bg-telegram-blue hover:bg-telegram-blue-dark text-white rounded-full w-10 h-10 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};