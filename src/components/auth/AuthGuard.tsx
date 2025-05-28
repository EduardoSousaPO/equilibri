'use client'

import { useEffect, useState } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'
import { useRouter } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

export default function AuthGuard({ 
  children, 
  redirectTo = '/login', 
  fallback = <div className="flex items-center justify-center min-h-screen">
    <div className="animate-pulse text-gray-500">Verificando autenticação...</div>
  </div> 
}: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClientSupabaseClient()
  const router = useRouter()
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro ao verificar sessão:', error)
          setIsAuthenticated(false)
          setIsLoading(false)
          
          // Redirecionar para login com URL de retorno
          const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
          router.push(`${redirectTo}?redirectTo=${returnUrl}`)
          return
        }
        
        if (!session) {
          setIsAuthenticated(false)
          setIsLoading(false)
          
          // Redirecionar para login com URL de retorno
          const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
          router.push(`${redirectTo}?redirectTo=${returnUrl}`)
          return
        }
        
        // Usuário autenticado
        setIsAuthenticated(true)
        setIsLoading(false)
      } catch (err) {
        console.error('Exceção ao verificar autenticação:', err)
        setIsAuthenticated(false)
        setIsLoading(false)
        
        // Redirecionar para login com URL de retorno
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
        router.push(`${redirectTo}?redirectTo=${returnUrl}`)
      }
    }
    
    // Verificar autenticação ao montar o componente
    checkAuth()
    
    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true)
        setIsLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setIsLoading(false)
        
        // Redirecionar para login com URL de retorno
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
        router.push(`${redirectTo}?redirectTo=${returnUrl}`)
      }
    })
    
    // Limpar listener ao desmontar
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router, supabase, redirectTo])
  
  // Mostrar fallback enquanto verifica autenticação
  if (isLoading) {
    return <>{fallback}</>
  }
  
  // Não renderizar nada se não estiver autenticado (redirecionamento em andamento)
  if (!isAuthenticated) {
    return null
  }
  
  // Renderizar conteúdo protegido
  return <>{children}</>
}
