import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from './Layout';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <div className={cn(
      "flex w-full message-appear",
      message.isSent ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[70%] px-4 py-2 rounded-2xl shadow-chat",
        message.isSent 
          ? "bg-message-sent text-message-sent-foreground rounded-br-md" 
          : "bg-message-received text-message-received-foreground rounded-bl-md"
      )}>
        <p className="text-sm leading-relaxed break-words">
          {message.content}
        </p>
        
        <div className={cn(
          "flex items-center justify-end gap-1 mt-1",
          message.isSent ? "text-message-sent-foreground/70" : "text-message-received-foreground/70"
        )}>
          <span className="text-xs">
            {message.timestamp}
          </span>
          
          {message.isSent && (
            <div className="flex items-center">
              {message.isRead ? (
                <CheckCheck className="h-3 w-3 text-read" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};