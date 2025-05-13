'use client';

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatMessage } from './message';
import { ChatInput } from './chat-input';
import { 
  createClientSupabaseClient, 
  uploadAudio, 
  checkMessageLimit,
  incrementMessageCount 
} from '@/lib/supabase/client-queries';
import { useRouter } from 'next/navigation';
import PlanBanner from '@/components/PlanBanner';
import WhyNotGPT from '@/components/WhyNotGPT';

// Modal para alertar sobre limite de mensagens
function UpgradeModal({ onClose, onUpgrade }: { onClose: () => void; onUpgrade: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-2">Limite de Mensagens Atingido</h3>
        <p className="mb-4">
          Você atingiu o limite de 30 mensagens para o plano gratuito. 
          Faça upgrade para o plano Premium e tenha conversas ilimitadas com a Lari.
        </p>
        
        <div className="mt-4 mb-4">
          <WhyNotGPT variant="sidebar" />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:text-gray-200"
            onClick={onClose}
          >
            Fechar
          </button>
          <button
            className="px-4 py-2 bg-primary text-white rounded-md"
            onClick={onUpgrade}
          >
            Ver Planos
          </button>
        </div>
      </div>
    </div>
  );
}

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      content: 'Olá! Sou a Lari, sua terapeuta digital. Como posso ajudar você hoje?',
      role: 'assistant',
      createdAt: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [messageCount, setMessageCount] = useState<number>(0);
  const [sessionUsed, setSessionUsed] = useState<boolean>(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Buscar ID do usuário e informações do plano
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClientSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Buscar plano e contagem de mensagens
        const { data } = await supabase
          .from('profiles')
          .select('plan, msg_count, session_used')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setUserPlan(data.plan || 'free');
          setMessageCount(data.msg_count || 0);
          setSessionUsed(data.session_used || false);
        }
      }
    };
    
    fetchUser();
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Verificar limite de mensagens (agora usando a função do client-queries)
  const checkMessageLimitLocal = async (): Promise<boolean> => {
    const { limitReached, error, plan } = await checkMessageLimit();
    
    if (limitReached) {
      setShowUpgradeModal(true);
      return false;
    }
    
    if (plan) {
      setUserPlan(plan);
    }
    
    return !limitReached;
  };
  
  const handleSendMessage = async (content: string) => {
    // Verificar limite antes de enviar
    const canSend = await checkMessageLimitLocal();
    if (!canSend) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content,
      role: 'user',
      createdAt: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Incrementar contagem
      const { success } = await incrementMessageCount();
      if (success) {
        setMessageCount(prev => prev + 1);
      }
      
      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao obter resposta');
      }
      
      const data = await response.json();
      
      // Add AI response
      setMessages(prev => [
        ...prev, 
        {
          id: uuidv4(),
          content: data.message,
          role: 'assistant',
          createdAt: new Date()
        }
      ]);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      // Add error message
      setMessages(prev => [
        ...prev, 
        {
          id: uuidv4(),
          content: 'Desculpe, tive um problema ao processar sua mensagem. Poderia tentar novamente?',
          role: 'assistant',
          createdAt: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleAudioRecorded = async (audioBlob: Blob) => {
    // Verificar limite antes de enviar
    const canSend = await checkMessageLimitLocal();
    if (!canSend) return;
    
    try {
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      setIsTyping(true);
      
      // Incrementar contagem
      const { success } = await incrementMessageCount();
      if (success) {
        setMessageCount(prev => prev + 1);
      }
      
      // Adicionar mensagem temporária de áudio
      const audioMessage: ChatMessage = {
        id: uuidv4(),
        content: '🎤 Enviando mensagem de áudio...',
        role: 'user',
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, audioMessage]);
      
      // Upload do áudio para o Supabase Storage
      const file = new File([audioBlob], `chat-audio-${Date.now()}.wav`, { type: 'audio/wav' });
      
      // Verificar tamanho do arquivo
      if (file.size > 15 * 1024 * 1024) { // 15MB
        throw new Error('O arquivo de áudio é muito grande. Limite máximo de 15MB.');
      }
      
      const uploadResult = await uploadAudio(file, userId);
      
      if (uploadResult.error || !uploadResult.data) {
        throw new Error(`Erro ao fazer upload do áudio: ${uploadResult.error}`);
      }
      
      const audioUrl = uploadResult.data;
      
      // Enviar para a API de áudio do chat
      const response = await fetch('/api/chat/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          audioUrl,
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        if (data.limitReached) {
          throw new Error('Você atingiu o limite de transcrições de áudio para o plano gratuito.');
        }
        throw new Error(data.error || 'Erro ao processar áudio');
      }
      
      const data = await response.json();
      
      // Atualizar a mensagem de áudio com a transcrição
      setMessages(prev => 
        prev.map(msg => 
          msg.id === audioMessage.id 
            ? { ...msg, content: `🎤 ${data.transcription}` } 
            : msg
        )
      );
      
      // Adicionar resposta da Lari
      setMessages(prev => [
        ...prev, 
        {
          id: uuidv4(),
          content: data.message,
          role: 'assistant',
          createdAt: new Date()
        }
      ]);
      
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      
      // Adicionar mensagem de erro
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          content: error instanceof Error ? error.message : 'Erro ao processar áudio',
          role: 'assistant',
          createdAt: new Date()
        }
      ]);
      
    } finally {
      setIsTyping(false);
    }
  };
  
  return (
    <div className="flex flex-col h-screen">
      {/* Banner de plano */}
      <div className="py-2 px-4 border-b">
        <PlanBanner 
          plan={userPlan as any} 
          msgCount={messageCount} 
          usedSession={sessionUsed} 
          variant="sidebar" 
        />
      </div>
      
      {/* Chat container */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <Message 
            message={{
              id: 'typing',
              content: '',
              role: 'assistant',
              isTyping: true,
              createdAt: new Date()
            }} 
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input container */}
      <div className="border-t p-4">
        <ChatInput onSendMessage={handleSendMessage} onAudioRecorded={handleAudioRecorded} />
      </div>
      
      {/* Modal de upgrade */}
      {showUpgradeModal && (
        <UpgradeModal 
          onClose={() => setShowUpgradeModal(false)} 
          onUpgrade={() => router.push('/settings')} 
        />
      )}
    </div>
  );
} 