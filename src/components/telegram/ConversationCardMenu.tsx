import { ReactNode, useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Archive } from 'lucide-react';

interface ConversationCardMenuProps {
  children: ReactNode;
  onClearFromFeed: () => void;
  onDeleteAllMessages: () => void;
}

export const ConversationCardMenu = ({ 
  children, 
  onClearFromFeed, 
  onDeleteAllMessages 
}: ConversationCardMenuProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56 bg-black border-border">
          <ContextMenuItem 
            onClick={onClearFromFeed}
            className="cursor-pointer"
          >
            <Archive className="mr-2 h-4 w-4" />
            <span>Clear from feed (keep messages)</span>
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="cursor-pointer text-red-500 focus:text-red-500"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete chat and clear all messages</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-black border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all messages?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this conversation for both parties. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeleteAllMessages();
                setShowDeleteDialog(false);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
