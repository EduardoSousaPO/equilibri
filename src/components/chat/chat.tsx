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
import { Button } from '@/components/ui/button';
import { EmotionType } from '@/types/database';
import { AnalysisProgress } from './AnalysisProgress';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [messageCount, setMessageCount] = useState<number>(0);
  const [sessionUsed, setSessionUsed] = useState<boolean>(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showEmotionCheckinModal, setShowEmotionCheckinModal] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [totalInteractions, setTotalInteractions] = useState(0);
  const [canCreatePlan, setCanCreatePlan] = useState(false);
  
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Função para renovar a sessão periodicamente
  const refreshSession = async () => {
    try {
      console.log("🔄 Tentando sincronizar sessão...");
      const response = await fetch('/api/sync-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.warn('❌ Erro ao sincronizar sessão:', data.error, "Status:", response.status);
        if (response.status === 401) {
          console.log("🔑 Sessão expirada (401), necessário novo login");
          setAuthError('Sessão expirada. Redirecionando para login...');
          setTimeout(() => router.push('/login'), 1500);
        }
        return false;
      }
      
      console.log("✅ Sessão sincronizada com sucesso:", data);
      return true;
    } catch (error) {
      console.error('❌ Erro ao tentar renovar sessão:', error);
      return false;
    }
  };
  
  // Verificar autenticação e buscar dados do usuário
  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      try {
        setIsAuthenticating(true);
        setAuthError(null);
        
        console.log("🔍 Iniciando verificação de autenticação");
        
        // Tentar renovar a sessão primeiro
        const sessionValid = await refreshSession();
        console.log("🔄 Resultado da renovação de sessão:", sessionValid);
        
        if (!sessionValid) {
          console.log("❌ Sessão inválida, redirecionando para login");
          setAuthError('Erro de autenticação. Por favor, faça login novamente.');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }
        
        // Cria um novo cliente Supabase a cada chamada para evitar problemas de sessão
        const supabase = createClientSupabaseClient();
        
        // Obter dados do usuário com tratamento de erro aprimorado
        console.log("👤 Buscando dados do usuário...");
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('❌ Erro de autenticação:', authError.message);
          setAuthError('Erro de autenticação. Por favor, faça login novamente.');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }
        
        if (!authData || !authData.user) {
          console.log('❌ Usuário não autenticado, redirecionando para login');
          router.push('/login');
          return;
        }
        
        console.log("✅ Usuário autenticado:", authData.user.email);
        setUserId(authData.user.id);
        
        // Buscar perfil do usuário no banco com tratamento de erro aprimorado
        console.log("📋 Buscando perfil do usuário...");
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan, msg_count, name')
          .eq('id', authData.user.id)
          .single();
          
        if (profileError) {
          console.error('❌ Erro ao buscar perfil:', profileError.message, profileError.code);
          
          // Se o erro for de permissão (PGRST116), pode ser problema de RLS
          if (profileError.code === 'PGRST116') {
            console.log("🔒 Possível problema de permissão RLS na tabela profiles");
          }
          
          setAuthError('Perfil de usuário não encontrado. Faça login novamente.');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }
          
        if (!profile) {
          console.log("❌ Perfil não encontrado para o usuário:", authData.user.id);
          setAuthError('Perfil de usuário não encontrado. Faça login novamente.');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }
        
        console.log("✅ Perfil encontrado:", profile);
        setUserPlan(profile.plan || 'free');
        setMessageCount(profile.msg_count || 0);
        
        // Adicionar mensagem de boas-vindas após autenticação
        setMessages([{
          id: 'welcome',
          content: `Olá${profile.name ? `, ${profile.name}` : ''}! Sou a Lari, sua terapeuta digital. Como posso ajudar você hoje?`,
          role: 'assistant',
          createdAt: new Date()
        }]);
        
      } catch (error) {
        console.error('❌ Erro na autenticação:', error);
        setAuthError('Erro ao verificar autenticação. Tente novamente.');
        setTimeout(() => router.push('/login'), 2000);
      } finally {
        setIsAuthenticating(false);
      }
    };
    
    checkAuthAndFetchUser();
    
    // Configurar renovação periódica da sessão (a cada 1 minuto)
    const sessionRefreshInterval = setInterval(refreshSession, 60 * 1000);
    
    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(sessionRefreshInterval);
  }, [router]);
  
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
  
  useEffect(() => {
    // Buscar total de interações analisadas
    const fetchInteractionCount = async () => {
      const supabase = createClientSupabaseClient();
      const { count } = await supabase
        .from('interaction_analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      setTotalInteractions(count || 0);
    };
    
    if (userId) {
      fetchInteractionCount();
    }
  }, [userId]);
  
  const handleSendMessage = async (content: string) => {
    try {
      setAuthError(null);
      
      const newMessage: ChatMessage = {
        id: uuidv4(),
        content,
        role: 'user',
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(true);
      
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
        throw new Error('Falha ao enviar mensagem');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        content: data.message,
        role: 'assistant',
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setTotalInteractions(prev => prev + 1);
      setCanCreatePlan(data.canCreatePlan);
      
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Função para registrar um check-in emocional no banco de dados
  const createEmotionCheckin = async (checkinData: {
    user_id: string;
    emotion: EmotionType;
    intensity: number;
    note: string | null;
    triggers?: string[] | null;
  }) => {
    const supabase = createClientSupabaseClient();
    
    try {
      const { data, error } = await supabase
        .from('emotion_checkins')
        .insert([{
          ...checkinData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar check-in emocional:', error);
      return { data: null, error: error.message };
    }
  };
  
  // Registrar check-in emocional
  const handleEmotionCheckin = async (emotion: EmotionType, intensity: number, note: string) => {
      if (!userId) {
      setAuthError('Sessão expirada. Redirecionando para login...');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }
    
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
          userId: userId,
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
  
  // Tela de loading durante autenticação
  if (isAuthenticating) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Tela de erro de autenticação
  if (authError) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-4">Erro de Autenticação</h2>
          <p className="text-gray-600 mb-6">{authError}</p>
          <Button onClick={() => router.push('/login')}>
            Ir para Login
          </Button>
        </div>
      </div>
    );
  }

  // Interface principal do chat (apenas para usuários autenticados)
  return (
    <div className="flex flex-col h-screen">
      {/* Banner de plano */}
      {userPlan && (
        <div className="mb-4">
          <PlanBanner
            plan={userPlan}
            messageCount={messageCount}
            limitReached={showUpgradeModal}
            onUpgrade={() => router.push('/upgrade')}
          />
        </div>
      )}
      
      {/* Botão de check-in emocional */}
      <div className="py-2 px-4 border-b">
        <Button 
          onClick={() => setShowEmotionCheckinModal(true)}
          variant="outline"
          className="text-sm w-full"
        >
          <span className="mr-2">😊</span>
          Como você está se sentindo?
        </Button>
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
        <AnalysisProgress
          totalInteractions={totalInteractions}
          canCreatePlan={canCreatePlan}
        />
        
        <div className="mt-4">
          <ChatInput 
            onSend={handleSendMessage} 
            disabled={!userId || isAuthenticating}
          />
        </div>
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