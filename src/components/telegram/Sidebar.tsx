import { Search, Settings, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ContactList } from './ContactList';
import type { Contact } from './Layout';

interface SidebarProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}

export const Sidebar = ({ contacts, selectedContact, onSelectContact }: SidebarProps) => {
  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-hover">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex-1 text-lg font-semibold text-sidebar-foreground">
          Telegram
        </div>
        <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-hover">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-10 bg-input border-input-border focus:ring-input-ring"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-hidden">
        <ContactList
          contacts={contacts}
          selectedContact={selectedContact}
          onSelectContact={onSelectContact}
        />
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-telegram-blue text-white">
                ME
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-online border-2 border-sidebar rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-sidebar-foreground truncate">
              You
            </div>
            <div className="text-xs text-muted-foreground">
              online
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};