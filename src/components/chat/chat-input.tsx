'use client';

import React, { useState, useRef, FormEvent, KeyboardEvent, ChangeEvent } from 'react';
import { cn } from '@/utils/cn';
import { AudioRecorder } from '@/components/audio-recorder';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({ onSend, disabled = false, className }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };
  
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  const handleAudioCaptured = (_audioBlob: Blob, transcript: string) => {
    // Apenas trabalhamos com a transcrição neste momento
    if (transcript) {
      onSend(transcript);
      }
    setShowAudioRecorder(false);
  };
  
  const toggleAudioRecorder = () => {
    setShowAudioRecorder(prev => !prev);
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
      {showAudioRecorder ? (
        <div className="p-4 flex flex-col items-center w-full">
          <AudioRecorder 
            onAudioCaptured={handleAudioCaptured} 
            disabled={disabled} 
          />
          <button
            type="button"
            onClick={toggleAudioRecorder}
            className="mt-3 text-sm text-muted-foreground hover:text-destructive"
          >
            Cancelar
          </button>
        </div>
      ) : (
      <div className="relative flex items-end w-full">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Digite sua mensagem aqui ou use o microfone..."
          className="flex-1 resize-none max-h-32 p-4 pr-24 bg-transparent border-none focus:ring-0 focus:outline-none"
          rows={1}
        />
        
          <div className="absolute right-2 bottom-3 flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleAudioRecorder}
              disabled={disabled}
              className={cn(
                "p-2 rounded-full",
                "bg-muted hover:bg-muted/80 transition-colors",
                "text-primary disabled:opacity-40 disabled:cursor-not-allowed"
              )}
              title="Enviar mensagem de voz"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </button>
            
            <button
              type="submit"
              disabled={(!message.trim() || disabled)}
              className={cn(
                "p-2 rounded-full",
                "bg-brand hover:bg-brandSecondary transition-colors",
                "text-white disabled:opacity-40 disabled:cursor-not-allowed"
          )}
              title="Enviar mensagem"
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
      </div>
      )}
    </form>
  );
} 