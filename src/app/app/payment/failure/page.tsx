'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function PaymentFailurePage() {
  const router = useRouter()
  
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-lg mx-auto p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-red-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">
          Ops! Houve um problema com o pagamento
        </h1>
        
        <p className="text-gray-600 mb-8">
          Não foi possível processar seu pagamento. Por favor, tente novamente ou entre em contato com o suporte se o problema persistir.
        </p>

        <div className="space-y-4">
          <Button
            className="w-full"
            onClick={() => router.push('/app/upgrade')}
          >
            Tentar Novamente
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/app/dashboard')}
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </Card>
    </div>
  )
}
