'use client';

import React from 'react';
import { useState, useRef, FormEvent, KeyboardEvent, ChangeEvent } from 'react';
import { cn } from '@/utils/cn';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({ onSend, disabled = false, className }: ChatInputProps) {
  const [message, setMessage] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    
    onSend(message.trim());
    setMessage('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col w-full max-w-[720px] mx-auto rounded-lg border border-gray-200 bg-white shadow-sm",
        disabled && "opacity-70",
        className
      )}
    >
      <div className="relative flex items-end w-full">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Digite sua mensagem aqui..."
          className="flex-1 resize-none max-h-32 p-4 pr-12 bg-transparent border-none focus:ring-0 focus:outline-none"
          rows={1}
        />
        
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={cn(
            "absolute right-2 bottom-3 p-2 rounded-full",
            "bg-brand hover:bg-brandSecondary transition-colors",
            "text-white disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m22 2-7 20-4-9-9-4Z"/>
            <path d="M22 2 11 13"/>
          </svg>
        </button>
      </div>
      <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
        Pressione Enter para enviar, Shift+Enter para quebrar linha
      </div>
    </form>
  );
} 