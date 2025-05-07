'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/utils/cn';

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
          <div className="relative w-8 h-8">
            <Image
              src="/logo.svg"
              alt="Equilibri.IA Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-semibold text-lg text-brand">Equilibri.IA</span>
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