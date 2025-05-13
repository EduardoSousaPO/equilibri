'use client';

import React, { useEffect } from 'react';
import { Chat } from '@/components/chat/chat';
import { Navbar } from '@/components/layout/navbar';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Verificar autenticação
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirecionar para login se não estiver autenticado
        router.push('/login');
      }
    }
    
    checkAuth();
  }, [router, supabase]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-[720px] flex flex-col">
        <Chat />
      </main>
    </div>
  );
} 