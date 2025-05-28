'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { EquilibriLogo } from '@/components/ui/logo';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  return (
    <nav 
      className={cn(
        "w-full border-b border-gray-100 bg-white shadow-sm py-3",
        className
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <EquilibriLogo className="h-6" textColor="text-brand" />
        </Link>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/chat" 
            className="text-sm font-medium text-gray-600 hover:text-brand transition-colors"
          >
            Chat
          </Link>
          <Link 
            href="/diario" 
            className="text-sm font-medium text-gray-600 hover:text-brand transition-colors"
          >
            Diário
          </Link>
          <Link 
            href="/perfil" 
            className="text-sm font-medium text-gray-600 hover:text-brand transition-colors"
          >
            Perfil
          </Link>
        </div>
      </div>
    </nav>
  );
} 