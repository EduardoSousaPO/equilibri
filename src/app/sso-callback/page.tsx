'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function SSOCallbackPage() {
  // Este componente irá processar o callback do OAuth automaticamente
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Processando autenticação...</h1>
          <p className="mt-2 text-gray-600">Por favor, aguarde.</p>
        </div>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  )
} 