import React from 'react';
import { cn } from '@/utils/cn';

interface TypingDotsProps {
  className?: string;
}

export function TypingDots({ className }: TypingDotsProps) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="w-2 h-2 bg-brand/60 rounded-full animate-pulse-slow"></div>
      <div className="w-2 h-2 bg-brand/60 rounded-full animate-pulse-slow delay-75"></div>
      <div className="w-2 h-2 bg-brand/60 rounded-full animate-pulse-slow delay-150"></div>
    </div>
  );
} 