import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Ban, Trash2 } from 'lucide-react';

interface MessageContextMenuProps {
  children: React.ReactNode;
  onMuteUser: () => void;
  onClearFromFeed: () => void;
  isCurrentUser: boolean;
}

export const MessageContextMenu = ({
  children,
  onMuteUser,
  onClearFromFeed,
  isCurrentUser,
}: MessageContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-black border-border w-56">
        <ContextMenuItem onClick={onClearFromFeed} className="cursor-pointer">
          <Trash2 className="mr-2 h-4 w-4" />
          Clear from feed
        </ContextMenuItem>
        {!isCurrentUser && (
          <ContextMenuItem onClick={onMuteUser} className="cursor-pointer">
            <Ban className="mr-2 h-4 w-4" />
            Mute user
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
