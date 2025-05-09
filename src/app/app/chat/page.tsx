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
          Lari é sua psicóloga virtual empática, com expertise em TCC, ACT, DBT e logoterapia.
          Você pode conversar sobre suas emoções, pensamentos e desafios do dia a dia.
          Lari valida suas emoções e oferece perspectivas baseadas em abordagens terapêuticas cientificamente validadas.
        </p>
        <p className="mt-2 text-sm text-text-primary">
          <strong>Importante:</strong> Lari não substitui um profissional de saúde mental. Em caso de crise, busque ajuda especializada ou ligue para o CVV (188).
        </p>
      </div>
    </div>
  );
} 