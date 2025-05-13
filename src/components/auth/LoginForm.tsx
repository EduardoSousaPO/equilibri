'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect')
  const supabase = createClientSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }

      router.refresh()
      
      // Redirecionar com base no parâmetro da URL, se existir
      if (redirectPath) {
        router.push(`/${redirectPath}`)
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Erro no login:', error)
      setError(error.message || 'Ocorreu um erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">Acesse o Equilibri.IA</h1>
        <p className="text-text-secondary">
          {redirectPath === 'chat' 
            ? 'Faça login para conversar com Lari, sua terapeuta digital'
            : 'Faça login para continuar sua jornada terapêutica'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 p-3 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            placeholder="seu@email.com"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-text-primary">
              Senha
            </label>
            <Link href="/auth/reset-password" className="text-sm text-primary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            placeholder="••••••••"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      
      <div className="text-center">
        <p className="text-sm text-text-secondary">
          Não tem uma conta?{' '}
          <Link href={redirectPath ? `/register?redirect=${redirectPath}` : "/register"} className="text-primary hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
} 