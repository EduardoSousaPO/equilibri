'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  // Verificar se o usuário tem uma sessão válida para recuperação de senha
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        setError('Sessão inválida ou expirada. Solicite um novo link de recuperação de senha.')
      }
    }

    checkSession()
  }, [supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validação básica
    if (password !== passwordConfirm) {
      setError('As senhas não coincidem')
      return
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }
    
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) {
        throw error
      }

      setIsSuccess(true)
      
      // Redirecionar para o login após 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error)
      setError(error.message || 'Ocorreu um erro ao atualizar sua senha.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Atualizar Senha</h1>
          <p className="mt-2 text-gray-600">
            Digite sua nova senha
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {isSuccess && (
          <div className="bg-green-50 p-4 rounded-md text-green-700 text-sm">
            Senha atualizada com sucesso! Você será redirecionado para a página de login.
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Nova senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
                Confirme a nova senha
              </label>
              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Atualizando...' : 'Atualizar senha'}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <Link href="/login" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
} 