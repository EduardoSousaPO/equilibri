'use client'

import Link from 'next/link'

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Verifique seu Email</h1>
          <div className="mt-4 text-gray-600">
            <p className="mb-2">Enviamos um link de verificação para o seu email.</p>
            <p>Por favor, acesse seu email e clique no link de verificação para ativar sua conta.</p>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="bg-blue-50 p-4 rounded-md flex items-start">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-blue-600 mt-0.5 mr-3" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p>Se você não receber o email em alguns minutos, verifique sua pasta de spam ou lixo eletrônico.</p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <Link 
              href="/login" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 