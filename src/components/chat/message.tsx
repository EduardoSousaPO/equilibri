import React from 'react';
import { cn } from '@/utils/cn';
import { Avatar } from '@/components/ui/avatar';
import { TypingDots } from '@/components/ui/typing-dots';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

interface MessageProps {
  message: ChatMessage;
  isTyping?: boolean;
  className?: string;
}

export function Message({ message, isTyping = false, className }: MessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div 
      className={cn(
        "flex w-full max-w-full transition-opacity duration-200",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div className={cn(
        "flex gap-3 max-w-[720px]",
        isUser && "flex-row-reverse"
      )}>
        <Avatar 
          name={isUser ? "Você" : "Lari"} 
          isAI={!isUser}
          size="sm"
        />
        
        <div 
          className={cn(
            "px-4 py-3 rounded-lg",
            isUser ? "bg-gray-100" : "bg-brand/10",
            "animate-fade-in"
          )}
        >
          {isTyping ? (
            <div className="min-h-[24px] flex items-center">
              <TypingDots />
              <span className="ml-2 text-sm text-gray-500">Lari está escrevendo...</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              {message.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 