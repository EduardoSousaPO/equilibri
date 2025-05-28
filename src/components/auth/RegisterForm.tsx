'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'

export function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect')
  const supabase = createClientSupabaseClient()

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
      // Registrar usuário com Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name // Armazenar nome como metadado do usuário
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        throw error
      }

      // Verificar se o email precisa de confirmação
      if (data.session === null) {
        // Email de verificação enviado
        router.push('/verify')
      } else {
        // Autenticado automaticamente
        if (redirectPath) {
          router.push(`/${redirectPath}`)
        } else {
          router.push('/app/dashboard')
        }
      }
    } catch (error: any) {
      console.error('Erro no registro:', error)
      setError(error.message || 'Ocorreu um erro ao criar sua conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">Criar conta no Equilibri.IA</h1>
        <p className="text-text-secondary">
          {redirectPath === 'chat' 
            ? 'Preencha os dados para conversar com Lari, sua terapeuta digital'
            : 'Preencha os dados para começar sua jornada terapêutica'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 p-3 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-text-primary">
            Nome completo
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            placeholder="Seu nome"
          />
        </div>
        
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
          <label htmlFor="password" className="block text-sm font-medium text-text-primary">
            Senha
          </label>
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
        
        <div className="space-y-2">
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-text-primary">
            Confirmar senha
          </label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            placeholder="••••••••"
          />
        </div>
        
        <div className="text-sm text-text-secondary">
          Ao se cadastrar, você concorda com nossos{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Termos de Serviço
          </Link>{' '}
          e{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Política de Privacidade
          </Link>
          .
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>
      
      <div className="text-center">
        <p className="text-sm text-text-secondary">
          Já tem uma conta?{' '}
          <Link href={redirectPath ? `/login?redirect=${redirectPath}` : "/login"} className="text-primary hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  )
} 