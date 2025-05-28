'use client'

import { useState } from 'react'
import { EquilibriLogo } from '@/components/ui/logo'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClientSupabaseClient()
      
      console.log("🔑 Tentando login com:", email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      console.log("✅ Login bem-sucedido, redirecionando...")
      
      // Força uma atualização das rotas
      router.refresh()
      
      // Redireciona para o dashboard
      router.push('/app/dashboard')
      
    } catch (error: any) {
      console.error("❌ Erro no login:", error)
      setError(error.message || "Falha na autenticação")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <EquilibriLogo className="h-12 w-auto mx-auto" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Bem-vindo ao Equilibri.IA
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua plataforma de terapia e bem-estar emocional
          </p>
        </div>
        
        <div className="mt-8 bg-card p-6 rounded-lg shadow-sm border">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Senha
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/auth/reset-password"
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p>
              Não tem uma conta?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:text-primary/90"
              >
                Crie sua conta agora
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
