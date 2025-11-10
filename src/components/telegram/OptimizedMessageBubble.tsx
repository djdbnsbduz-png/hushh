import { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useUserRoles } from '@/hooks/useUserRoles';

interface OptimizedMessageBubbleProps {
  message: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    profiles?: {
      display_name: string;
      avatar_url?: string;
    };
  };
  isCurrentUser: boolean;
}

export const OptimizedMessageBubble = memo(({ message, isCurrentUser }: OptimizedMessageBubbleProps) => {
  const { getUserRoles } = useUserRoles([message.sender_id]);
  const roles = getUserRoles(message.sender_id);
  
  const isAdmin = roles.includes('admin');
  const isModerator = roles.includes('moderator');

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser
            ? 'bg-telegram-blue text-white'
            : 'bg-message-received'
        }`}
      >
        {!isCurrentUser && (
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-medium text-telegram-blue">
              {message.profiles?.display_name || 'Unknown User'}
            </p>
            {isAdmin && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                Admin
              </Badge>
            )}
            {isModerator && !isAdmin && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                Moderator
              </Badge>
            )}
          </div>
        )}
        <p className="text-sm">{message.content}</p>
        <p className="text-xs mt-1 opacity-70">
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
});

OptimizedMessageBubble.displayName = 'OptimizedMessageBubble';