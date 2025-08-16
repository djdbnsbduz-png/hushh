import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Contact } from './Layout';

interface ContactListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}

export const ContactList = ({ contacts, selectedContact, onSelectContact }: ContactListProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    return timestamp;
  };

  return (
    <div className="overflow-y-auto">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          onClick={() => onSelectContact(contact)}
          className={cn(
            "flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-sidebar-hover",
            selectedContact?.id === contact.id && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={contact.avatar} />
              <AvatarFallback className={cn(
                "text-sm font-medium",
                selectedContact?.id === contact.id 
                  ? "bg-white/20 text-white" 
                  : "bg-telegram-blue text-white"
              )}>
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            {contact.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-online border-2 border-sidebar rounded-full"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={cn(
                "text-sm font-medium truncate",
                selectedContact?.id === contact.id 
                  ? "text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground"
              )}>
                {contact.name}
              </h3>
              <span className={cn(
                "text-xs",
                selectedContact?.id === contact.id 
                  ? "text-sidebar-accent-foreground/70" 
                  : "text-muted-foreground"
              )}>
                {formatTime(contact.timestamp || '')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <p className={cn(
                "text-sm truncate flex-1",
                selectedContact?.id === contact.id 
                  ? "text-sidebar-accent-foreground/80" 
                  : "text-muted-foreground"
              )}>
                {contact.isTyping ? (
                  <span className="text-typing font-medium animate-pulse">typing...</span>
                ) : (
                  contact.lastMessage
                )}
              </p>
              
              {contact.unreadCount && contact.unreadCount > 0 && (
                <Badge 
                  variant="default" 
                  className={cn(
                    "ml-2 min-w-[20px] h-5 text-xs flex items-center justify-center rounded-full",
                    selectedContact?.id === contact.id 
                      ? "bg-white text-telegram-blue" 
                      : "bg-telegram-blue text-white"
                  )}
                >
                  {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};