import { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { usePresence } from '@/hooks/usePresence';

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

interface ConversationCardProps {
  conversation: Conversation;
  isActive: boolean;
  lastMessage?: string;
  onClick: (conversationId: string) => void;
}

export const ConversationCard = memo(({ 
  conversation, 
  isActive, 
  lastMessage, 
  onClick 
}: ConversationCardProps) => {
  const { isUserOnline } = usePresence();
  const displayName = conversation.participant_profile?.display_name || 
                     conversation.title || 'Conversation';
  const avatarUrl = conversation.participant_profile?.avatar_url || 
                   conversation.avatar_url;
  const displayInitial = displayName[0]?.toUpperCase() || 'C';
  const participantUserId = conversation.participant_profile?.user_id;
  const isOnline = participantUserId ? isUserOnline(participantUserId) : false;

  return (
    <Card
      className={`p-3 cursor-pointer mb-2 transition-colors hover:bg-sidebar-hover ${
        isActive ? 'bg-telegram-blue text-white' : 'bg-transparent'
      }`}
      onClick={() => onClick(conversation.id)}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{displayInitial}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium truncate">{displayName}</h3>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {lastMessage || 'No messages yet'}
          </p>
        </div>
      </div>
    </Card>
  );
});

ConversationCard.displayName = 'ConversationCard';