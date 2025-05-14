'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientSupabaseClient } from '@/lib/supabase'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      console.log('Iniciando processo de login com email:', email)
      
      // Login com email/senha
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Erro de autenticação:', error.message)
        setError('Falha na autenticação: ' + error.message)
        setIsLoading(false)
        return
      }
      
      console.log('Login bem-sucedido, usuário:', data.user?.id)
      console.log('Session:', !!data.session ? 'Disponível' : 'Indisponível')
      
      // Forçar uma atualização da sessão nos cookies
      const { error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) {
        console.warn('Aviso: Não foi possível atualizar a sessão:', refreshError.message)
      } else {
        console.log('Sessão atualizada com sucesso')
      }
      
      // Verificar se já temos uma sessão válida imediatamente 
      const { data: sessionData } = await supabase.auth.getSession()
      console.log('Estado da sessão após login:', !!sessionData.session ? 'Ativa' : 'Inativa')
      
      // Redirecionar para dashboard usando window.location para forçar navegação completa
      console.log('Redirecionando para dashboard usando window.location...')
      window.location.href = '/app/dashboard'
    } catch (e: any) {
      console.error('Exceção durante o login:', e.message || e)
      setError('Erro inesperado: ' + (e.message || 'Falha na conexão'))
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