'use client';

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatMessage } from './message';
import { ChatInput } from './chat-input';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
          disabled={isTyping}
        />
      </div>
    </div>
  );
} 