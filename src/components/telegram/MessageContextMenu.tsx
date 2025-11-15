import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Ban } from 'lucide-react';

interface MessageContextMenuProps {
  children: React.ReactNode;
  onMuteUser: () => void;
  isCurrentUser: boolean;
}

export const MessageContextMenu = ({
  children,
  onMuteUser,
  isCurrentUser,
}: MessageContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-black border-border w-56 z-50">
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
