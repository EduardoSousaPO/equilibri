'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PaymentPendingPage() {
  const router = useRouter()
  
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-background rounded-lg p-8 shadow-sm text-center">
        <div className="w-20 h-20 bg-warning-light rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-text-primary mb-4">Pagamento Pendente</h1>
        
        <p className="text-text-secondary mb-6">
          Seu pagamento está sendo processado. Isso pode levar alguns minutos ou até algumas horas, dependendo do método de pagamento escolhido.
        </p>
        
        <div className="bg-background-secondary rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-text-primary mb-2">O que acontece agora:</h2>
          <ul className="text-text-secondary text-left list-disc list-inside space-y-1">
            <li>Você receberá um e-mail assim que o pagamento for confirmado</li>
            <li>Seu plano será atualizado automaticamente após a confirmação</li>
            <li>Você pode verificar o status do pagamento na página de configurações</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/app/dashboard')}
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
          >
            Voltar ao Dashboard
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/app/settings')}
            className="px-6 py-3 border border-border text-text-secondary rounded-md hover:bg-background-secondary transition-colors"
          >
            Verificar Status
          </button>
        </div>
      </div>
    </div>
  )
}
