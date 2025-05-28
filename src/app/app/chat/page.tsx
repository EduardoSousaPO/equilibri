'use client';

import React from 'react';
import { Chat } from '@/components/chat/chat';

export default function ChatWithLariPage() {
  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-georgia text-primary">Chat com Lari</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-brand/20 overflow-hidden">
        <div className="bg-brand/10 px-4 py-3 border-b border-brand/20">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-brand/20 flex items-center justify-center">
              <span className="text-brand font-medium">L</span>
            </div>
            <div className="ml-3">
              <h2 className="font-medium text-primary">Lari</h2>
              <p className="text-xs text-text-secondary">Sua terapeuta digital</p>
            </div>
            <div className="ml-auto text-xs px-2 py-1 rounded-full bg-success/20 text-success flex items-center">
              <span className="h-2 w-2 rounded-full bg-success mr-1.5"></span>
              Online
            </div>
          </div>
        </div>
        
        <div className="h-[calc(100vh-300px)] min-h-[400px]">
          <Chat />
        </div>
      </div>
      
      <div className="bg-brand/10 border border-brand/20 rounded-lg p-4">
        <h3 className="font-medium text-primary">Sobre a Lari</h3>
        <p className="mt-2 text-sm text-text-primary">
          Oi! Eu sou a Lari, sua companheira virtual para conversas sobre bem-estar emocional. 
          Estou aqui para te ouvir, entender seus sentimentos e caminhar junto com você. 
          Podemos conversar sobre suas alegrias, preocupações, sonhos e desafios do dia a dia. 
          Juntos, vamos explorar maneiras de você se sentir melhor e encontrar mais sentido na sua jornada.
        </p>
        <p className="mt-2 text-sm text-text-primary">
          <strong>Lembre-se:</strong> Embora eu esteja aqui para te apoiar, não substituo o acompanhamento com um profissional de saúde mental. 
          Se estiver passando por um momento difícil, além de conversar comigo, você pode contar com o apoio do CVV (188) 24 horas por dia.
        </p>
      </div>
    </div>
  );
} 