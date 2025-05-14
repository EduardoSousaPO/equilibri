'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  // Inicializar o cliente Supabase usando a biblioteca auth-helpers-nextjs
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      console.log('[Login] Iniciando processo de autenticação com email:', email)
      console.log('[Login] SUPABASE_URL definida:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('[Login] SUPABASE_ANON_KEY definida:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      // Login com email/senha usando a API do Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      // Se houve erro na autenticação, exibir mensagem e encerrar
      if (error) {
        console.error('[Login] Erro de autenticação:', error.message, error)
        setError('Falha na autenticação: ' + error.message)
        setIsLoading(false)
        return
      }
      
      console.log('[Login] Autenticação bem-sucedida, dados do usuário:', { 
        id: data.user?.id,
        email: data.user?.email
      })
      console.log('[Login] Sessão disponível:', !!data.session)
      
      // Verificar se a sessão foi criada e está disponível
      if (!data.session) {
        console.error('[Login] ALERTA: Sessão não disponível após autenticação')
        setError('Login bem-sucedido, mas sessão não foi criada. Tente novamente.')
        setIsLoading(false)
        return
      }
      
      // Redirecionamento para o dashboard usando window.location
      // Isso garante uma navegação completa, não apenas uma atualização de state do React
      console.log('[Login] Redirecionando para dashboard...')
      
      // Opção 1: Usando window.location (recomendado para garantir navegação completa e novos cookies)
      window.location.href = '/app/dashboard'
      
      // Opção 2: Usando router do Next.js (pode manter contexto React mas requer refresh)
      // router.push('/app/dashboard')
      // router.refresh()
    } catch (e: any) {
      console.error('[Login] Exceção não tratada durante autenticação:', e.message || e)
      setError('Erro inesperado: ' + (e.message || 'Falha na conexão com o servidor'))
      setIsLoading(false)
    }
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Entrar no DiarioTER</h2>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="block text-gray-700">
              Senha
            </label>
            <Link href="/reset-password" className="text-sm text-blue-500 hover:text-blue-700">
              Esqueceu a senha?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full p-2 rounded-md text-white font-medium ${
            isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Ainda não tem uma conta?{' '}
          <Link href="/register" className="text-blue-500 hover:text-blue-700">
            Registre-se
          </Link>
        </p>
      </div>
    </div>
  )
} 