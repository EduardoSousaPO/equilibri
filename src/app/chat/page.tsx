'use client';

import React, { useEffect, useState } from 'react';
import { Chat } from '@/components/chat/chat';
import { Navbar } from '@/components/layout/navbar';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '@/lib/supabase/client-queries';
import { Timeline, TimelineItem } from '@/components/timeline/timeline';
import { fetchTimelineData } from '@/lib/timeline';

export default function ChatPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Verificar autenticação
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
      } else {
        // Armazenar o ID do usuário para uso em outros efeitos
        setUserId(session.user.id);
      }
    }
    
    checkAuth();
  }, [router, supabase]);

  // Efeito para carregar dados da linha do tempo
  useEffect(() => {
    const loadTimelineData = async () => {
      if (!userId) return;
      const timeline = await fetchTimelineData(userId);
      setTimelineItems(timeline);
    };
    
    if (userId) {
      loadTimelineData();
    }
  }, [userId]);

  // Função para alternar visibilidade da linha do tempo
  const toggleTimeline = () => {
    setShowTimeline(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Chat principal */}
      <div className={`flex-1 flex flex-col ${showTimeline ? 'md:mr-80' : ''}`}>
        <Navbar />
        <main className="flex-1 container mx-auto max-w-[720px] flex flex-col">
          <Chat />
        </main>
        
        {/* Botão para mostrar/ocultar timeline em dispositivos móveis */}
        <div className="md:hidden fixed bottom-24 right-4 z-10">
          <button
            onClick={toggleTimeline}
            className="bg-primary text-white p-3 rounded-full shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M18.4 7.5l-7.3 7.3-4-4L4 13.5" />
              <path d="M16 7h3v3" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Painel lateral com a linha do tempo */}
      <div 
        className={`fixed md:static top-0 right-0 w-80 h-full bg-background z-20 shadow-lg transition-transform transform ${
          showTimeline ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        } md:hidden ${showTimeline ? 'flex' : 'hidden'} md:flex`}
      >
        <div className="flex flex-col w-full h-full p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Sua Jornada</h2>
            <button 
              onClick={toggleTimeline}
              className="md:hidden p-2 rounded-full hover:bg-muted"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-auto">
            <Timeline items={timelineItems} />
          </div>
        </div>
      </div>
    </div>
  );
} 