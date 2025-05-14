'use client';

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatMessage } from './message';
import { ChatInput } from './chat-input';
import { 
  createClientSupabaseClient, 
  checkMessageLimit,
  incrementMessageCount,
  createEmotionCheckin
} from '@/lib/supabase/client-queries';
import { useRouter } from 'next/navigation';
import PlanBanner from '@/components/PlanBanner';
import WhyNotGPT from '@/components/WhyNotGPT';
import { Button } from '@/components/ui/button';
import { EmotionType } from '@/types/database';

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

// Modal de Check-in Emocional
function EmotionCheckinModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (emotion: EmotionType, intensity: number, note: string) => void }) {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [intensity, setIntensity] = useState<number>(3);
  const [note, setNote] = useState<string>('');

  const emotions: {value: EmotionType, label: string, emoji: string}[] = [
    { value: 'happy', label: 'Feliz', emoji: '😊' },
    { value: 'calm', label: 'Calmo', emoji: '😌' },
    { value: 'neutral', label: 'Neutro', emoji: '😐' },
    { value: 'sad', label: 'Triste', emoji: '😢' },
    { value: 'anxious', label: 'Ansioso', emoji: '😰' },
    { value: 'angry', label: 'Irritado', emoji: '😠' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Como você está se sentindo agora?</h3>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          {emotions.map((emotion) => (
            <button
              key={emotion.value}
              className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 ${
                selectedEmotion === emotion.value 
                  ? 'bg-primary/20 border-2 border-primary' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setSelectedEmotion(emotion.value)}
            >
              <span className="text-2xl">{emotion.emoji}</span>
              <span>{emotion.label}</span>
            </button>
          ))}
        </div>

        {selectedEmotion && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Intensidade</label>
              <input
                type="range"
                min="1"
                max="5"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-1">
                <span>Leve</span>
                <span>Moderado</span>
                <span>Intenso</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="O que está causando esse sentimento?"
                rows={3}
              ></textarea>
            </div>
          </>
        )}
        
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:text-gray-200"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (selectedEmotion) {
                onSubmit(selectedEmotion, intensity, note);
              }
            }}
            disabled={!selectedEmotion}
          >
            Registrar
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
  const [showEmotionCheckinModal, setShowEmotionCheckinModal] = useState(false);
  
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
  
  // Registrar check-in emocional
  const handleEmotionCheckin = async (emotion: EmotionType, intensity: number, note: string) => {
    if (!userId) return;
    
    try {
      // Criar registro de emoção no banco
      const { data, error } = await createEmotionCheckin({
        user_id: userId,
        emotion,
        intensity,
        note: note || null
      });
      
      if (error) throw new Error(error);
      
      // Fechar modal
      setShowEmotionCheckinModal(false);
      
      // Adicionar mensagem indicando o check-in
      const emotionEmoji = {
        'happy': '😊',
        'calm': '😌',
        'neutral': '😐',
        'sad': '😢',
        'anxious': '😰',
        'angry': '😠'
      }[emotion];
      
      const emotionName = {
        'happy': 'feliz',
        'calm': 'calmo',
        'neutral': 'neutro',
        'sad': 'triste',
        'anxious': 'ansioso',
        'angry': 'irritado'
      }[emotion];
      
      // Mensagem do usuário sobre como se sente
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: `Estou me sentindo ${emotionName} ${emotionEmoji} (intensidade: ${intensity}/5)${note ? `: ${note}` : ''}`,
        role: 'user',
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
      
      // Enviar para API para obter resposta da Lari
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao obter resposta');
      }
      
      const data2 = await response.json();
      
      // Adicionar resposta da Lari
      setMessages(prev => [
        ...prev, 
        {
          id: uuidv4(),
          content: data2.message,
          role: 'assistant',
          createdAt: new Date()
        }
      ]);
    } catch (error) {
      console.error('Erro ao processar check-in emocional:', error);
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
      
      {/* Botão de check-in emocional */}
      <div className="py-2 px-4 border-b flex justify-between items-center">
        <Button 
          onClick={() => setShowEmotionCheckinModal(true)}
          variant="outline"
          className="text-sm"
        >
          <span className="mr-2">😊</span>
          Como você está se sentindo?
        </Button>
        <WhyNotGPT variant="sidebar" />
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
              createdAt: new Date()
            }} 
            isTyping={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input container */}
      <div className="border-t p-4">
        <ChatInput onSend={handleSendMessage} />
      </div>
      
      {/* Modal de upgrade */}
      {showUpgradeModal && (
        <UpgradeModal 
          onClose={() => setShowUpgradeModal(false)} 
          onUpgrade={() => router.push('/settings')} 
        />
      )}

      {/* Modal de check-in emocional */}
      {showEmotionCheckinModal && (
        <EmotionCheckinModal 
          onClose={() => setShowEmotionCheckinModal(false)} 
          onSubmit={handleEmotionCheckin} 
        />
      )}
    </div>
  );
} 