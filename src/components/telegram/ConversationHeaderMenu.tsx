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
import { Trash2, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface ConversationHeaderMenuProps {
  children: React.ReactNode;
  onClearFromFeed: () => void;
  onDeleteForBoth: () => void;
}

export const ConversationHeaderMenu = ({
  children,
  onClearFromFeed,
  onDeleteForBoth,
}: ConversationHeaderMenuProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-black border-border w-64 z-50">
          <ContextMenuItem onClick={onClearFromFeed} className="cursor-pointer">
            <EyeOff className="mr-2 h-4 w-4" />
            Clear from feed (keep messages)
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => setShowDeleteDialog(true)} 
            className="cursor-pointer text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete all messages for both
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all messages?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this conversation for both you and the other person. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeleteForBoth();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
