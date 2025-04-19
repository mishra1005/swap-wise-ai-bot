
import React from 'react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  content: string;
  isBot: boolean;
  timestamp: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ content, isBot, timestamp }) => {
  return (
    <div className={cn(
      "flex w-full",
      isBot ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 mb-2",
        isBot ? "bg-dark-subtle text-white" : "bg-green-500 text-white"
      )}>
        <p className="text-sm md:text-base">{content}</p>
        <span className="text-xs opacity-60 mt-1 block">{timestamp}</span>
      </div>
    </div>
  );
};
