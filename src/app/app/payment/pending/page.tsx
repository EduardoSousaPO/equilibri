'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function PaymentPendingPage() {
  const router = useRouter()
  
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-lg mx-auto p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-yellow-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">
          Pagamento em Processamento
        </h1>
        
        <p className="text-gray-600 mb-8">
          Seu pagamento está sendo processado. Assim que for confirmado, seu plano será atualizado automaticamente. Isso pode levar alguns minutos.
        </p>
        
        <div className="space-y-4">
          <Button
            className="w-full"
            onClick={() => router.push('/app/dashboard')}
          >
            Voltar ao Dashboard
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/app/settings')}
          >
            Verificar Status
          </Button>
        </div>
      </Card>
    </div>
  )
}
