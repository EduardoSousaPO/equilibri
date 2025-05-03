'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PaymentFailurePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Registrar erro de pagamento em analytics (implementação futura)
  }, [])
  
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-background rounded-lg p-8 shadow-sm text-center">
        <div className="w-20 h-20 bg-error-light rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-text-primary mb-4">Pagamento não Aprovado</h1>
        
        <p className="text-text-secondary mb-6">
          Infelizmente, houve um problema com o seu pagamento e ele não foi aprovado. Isso pode acontecer por diversos motivos, como problemas com o cartão, saldo insuficiente ou questões de segurança.
        </p>
        
        <div className="bg-background-secondary rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-text-primary mb-2">O que você pode fazer:</h2>
          <ul className="text-text-secondary text-left list-disc list-inside space-y-1">
            <li>Verificar se os dados do cartão estão corretos</li>
            <li>Tentar outro método de pagamento</li>
            <li>Verificar se há saldo suficiente</li>
            <li>Entrar em contato com seu banco para verificar se há restrições</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/app/upgrade')}
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
          >
            Tentar Novamente
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/app/dashboard')}
            className="px-6 py-3 border border-border text-text-secondary rounded-md hover:bg-background-secondary transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
