import { memo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useUserRoles } from '@/hooks/useUserRoles';
import { MessageContextMenu } from './MessageContextMenu';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { Check, Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

interface OptimizedMessageBubbleProps {
  message: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    profiles?: {
      display_name: string;
      avatar_url?: string;
      username?: string;
      bio?: string;
      banner_url?: string;
      name_font?: string;
    };
  };
  isCurrentUser: boolean;
  isRead?: boolean;
  reactions?: Array<{ emoji: string; count: number; hasCurrentUser: boolean }>;
  onAddReaction?: (emoji: string) => void;
  onRemoveReaction?: (emoji: string) => void;
  onMuteUser?: () => void;
  onProfileClick?: (userId: string) => void;
}

const NAME_FONTS: Record<string, string> = {
  default: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
  cursive: 'font-[cursive]',
  fantasy: 'font-[fantasy]',
};

export const OptimizedMessageBubble = memo(({ 
  message, 
  isCurrentUser, 
  isRead,
  reactions = [],
  onAddReaction,
  onRemoveReaction,
  onMuteUser,
  onProfileClick,
}: OptimizedMessageBubbleProps) => {
  const { getUserRoles } = useUserRoles([message.sender_id]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const roles = getUserRoles(message.sender_id);
  
  const fontClass = NAME_FONTS[message.profiles?.name_font || 'default'] || NAME_FONTS.default;

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onAddReaction?.(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleReactionClick = (emoji: string, hasCurrentUser: boolean) => {
    if (hasCurrentUser) {
      onRemoveReaction?.(emoji);
    } else {
      onAddReaction?.(emoji);
    }
  };

  const handleNameClick = () => {
    if (!isCurrentUser && onProfileClick) {
      onProfileClick(message.sender_id);
    }
  };

  // Filter and order roles to display
  const displayRoles = roles.filter(role => role !== 'user');

  return (
    <MessageContextMenu
      isCurrentUser={isCurrentUser}
      onMuteUser={onMuteUser || (() => {})}
    >
      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}>
        <div className="flex flex-col">
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              isCurrentUser
                ? 'bg-telegram-blue text-white'
                : 'bg-message-received'
            }`}
          >
            {!isCurrentUser && (
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <button 
                  onClick={handleNameClick}
                  className={`text-xs font-medium text-telegram-blue hover:underline cursor-pointer ${fontClass}`}
                >
                  {message.profiles?.display_name || 'Unknown User'}
                </button>
                {displayRoles.map((role) => (
                  <RoleBadge key={role} role={role} size="sm" />
                ))}
              </div>
            )}
            <p className="text-sm">{message.content}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs opacity-70">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </p>
              {isCurrentUser && (
                <span className="text-xs ml-2">
                  <Check className={`h-3 w-3 inline ${isRead ? 'text-green-500' : 'opacity-70'}`} />
                </span>
              )}
            </div>
          </div>
          
          {/* Reactions */}
          {reactions.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  onClick={() => handleReactionClick(reaction.emoji, reaction.hasCurrentUser)}
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    reaction.hasCurrentUser
                      ? 'bg-telegram-blue/20 border-telegram-blue'
                      : 'bg-background/50 border-border'
                  } hover:bg-telegram-blue/30 transition-colors`}
                >
                  {reaction.emoji} {reaction.count}
                </button>
              ))}
            </div>
          )}
          
          {/* Emoji Picker Button */}
          <div className="relative mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-3 w-3" />
            </Button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 z-50" onClick={(e) => e.stopPropagation()}>
                <EmojiPicker 
                  onEmojiClick={handleEmojiClick} 
                  theme={Theme.DARK}
                  lazyLoadEmojis={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </MessageContextMenu>
  );
});

OptimizedMessageBubble.displayName = 'OptimizedMessageBubble';