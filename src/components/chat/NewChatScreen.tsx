import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Search, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMessages } from '@/hooks/useMessages';

interface SearchResult {
  id: string;
  user_id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  phone?: string;
}

interface NewChatScreenProps {
  onBack: () => void;
}

export const NewChatScreen = ({ onBack }: NewChatScreenProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { startNewConversation } = useMessages();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.rpc('search_users_by_identifier', {
        search_term: searchTerm.trim()
      });

      if (error) {
        throw error;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for users",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = async (user: SearchResult) => {
    try {
      await startNewConversation(user.user_id, user.display_name || user.username);
      onBack();
      toast({
        title: "Chat Started",
        description: `Started a new chat with ${user.display_name || user.username}`,
      });
    } catch (error) {
      console.error('Start chat error:', error);
      toast({
        title: "Error",
        description: "Failed to start new chat",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-card-border bg-card">
        <div className="flex items-center space-x-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">New Chat</h1>
        </div>

        {/* Search Input */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by username or phone number..."
              className="pl-10 bg-input border-input-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-auto p-4">
        {searchResults.length > 0 ? (
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Search Results</h2>
            {searchResults.map((user) => (
              <Card
                key={user.id}
                className="p-4 cursor-pointer hover:bg-sidebar-hover transition-colors"
                onClick={() => handleStartChat(user)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {user.display_name || user.username}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                        {user.phone && ` • ${user.phone}`}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : searchTerm && !isSearching ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
              <p className="text-sm">Try searching with a different username or phone number</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start a new conversation</p>
              <p className="text-sm">Search for users by their username or phone number</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};