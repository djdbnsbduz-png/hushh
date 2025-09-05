import { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';

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
          <p className="text-xs font-medium mb-1 text-telegram-blue">
            {message.profiles?.display_name || 'Unknown User'}
          </p>
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