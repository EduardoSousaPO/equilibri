import React from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';

interface AvatarProps {
  name: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
  isAI?: boolean;
  className?: string;
}

export function Avatar({ 
  name, 
  image, 
  size = 'md', 
  isAI = false,
  className
}: AvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };
  
  return (
    <div className={cn(
      "relative flex items-center justify-center rounded-full",
      sizeClasses[size],
      isAI ? "bg-brand/10" : "bg-brandSecondary/10",
      className
    )}>
      {image ? (
        <Image 
          src={image} 
          alt={name} 
          fill 
          className="rounded-full object-cover"
        />
      ) : (
        <span className={cn(
          "font-semibold",
          isAI ? "text-brand" : "text-brandSecondary"
        )}>
          {initials}
        </span>
      )}
      {isAI && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-brand rounded-full border border-white"></div>
      )}
    </div>
  );
} 