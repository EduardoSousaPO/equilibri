'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function PaymentSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Aqui você pode adicionar lógica para verificar o status do pagamento
    // e atualizar o estado do usuário se necessário
  }, [])

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-lg mx-auto p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-green-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-4">
          Pagamento Realizado com Sucesso!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Obrigado por assinar o Equilibri! Seu acesso premium já está disponível.
        </p>

        <div className="space-y-4">
          <Button
            className="w-full"
            onClick={() => router.push('/app/dashboard')}
          >
            Ir para o Dashboard
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/app/settings')}
          >
            Configurar Perfil
          </Button>
        </div>
      </Card>
    </div>
  )
}
