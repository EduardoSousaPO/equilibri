'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SSOCallbackPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirecionar automaticamente para o dashboard
    router.push('/app/dashboard')
  }, [router])
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Processando autenticação...</h1>
          <p className="mt-2 text-gray-600">Por favor, aguarde.</p>
        </div>
      </div>
    </div>
  )
} 