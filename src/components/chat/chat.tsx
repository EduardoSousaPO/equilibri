'use client';

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatMessage } from './message';
import { ChatInput } from './chat-input';
import { createClientSupabaseClient, uploadAudio } from '@/lib/supabase/client-queries';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Buscar ID do usuário
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClientSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    
    fetchUser();
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  const handleSendMessage = async (content: string) => {
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
    try {
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      setIsTyping(true);
      
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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map(message => (
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
      
      <div className="p-4 border-t border-gray-100">
        <ChatInput 
          onSend={handleSendMessage}
          onAudioRecorded={handleAudioRecorded}
          disabled={isTyping}
        />
      </div>
    </div>
  );
} 