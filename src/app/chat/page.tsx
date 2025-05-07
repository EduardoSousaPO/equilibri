'use client';

import React from 'react';
import { Chat } from '@/components/chat/chat';
import { Navbar } from '@/components/layout/navbar';  // Assumindo que você já tem este componente

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-[720px] flex flex-col">
        <Chat />
      </main>
    </div>
  );
} 