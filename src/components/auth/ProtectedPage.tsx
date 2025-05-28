'use client'

import { useEffect, useState } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ProtectedPageProps {
  children: React.ReactNode
  requirePlan?: 'premium' | 'clinical' | null
  redirectTo?: string
}

export default function ProtectedPage({ 
  children, 
  requirePlan = null,
  redirectTo = '/login' 
}: ProtectedPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [planError, setPlanError] = useState<string | null>(null)
  const supabase = createClientSupabaseClient()
  const router = useRouter()
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar sessão
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          console.log('Usuário não autenticado, redirecionando para login')
          setIsAuthenticated(false)
          setIsLoading(false)
          
          // Redirecionar para login com URL de retorno
          const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
          router.push(`${redirectTo}?redirectTo=${returnUrl}`)
          return
        }
        
        // Se não requer plano específico, apenas autenticação é suficiente
        if (!requirePlan) {
          setIsAuthenticated(true)
          setIsLoading(false)
          return
        }
        
        // Verificar plano do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', session.user.id)
          .single()
        
        if (profileError || !profile) {
          console.error('Erro ao buscar perfil do usuário:', profileError)
          setPlanError('Não foi possível verificar seu plano. Tente novamente mais tarde.')
          setIsLoading(false)
          return
        }
        
        const userPlanTier = profile.plan || 'free'
        // Como não existe coluna de status no banco, usamos sempre 'active'
        const planStatus = 'active'
        
        setUserPlan(userPlanTier)
        
        // Verificar se o plano atende ao requisito
        if (requirePlan === 'premium' && userPlanTier === 'free') {
          setPlanError('Esta funcionalidade requer o plano Premium ou Premium Clínico.')
          setIsLoading(false)
          return
        }
        
        if (requirePlan === 'clinical' && userPlanTier !== 'clinical') {
          setPlanError('Esta funcionalidade requer o plano Premium Clínico.')
          setIsLoading(false)
          return
        }
        
        // Verificar se o plano está ativo (apenas para planos pagos)
        // Nota: Como não temos mais a coluna de status, esta verificação é redundante
        // mas mantemos para compatibilidade com a lógica existente
        if (userPlanTier !== 'free' && planStatus !== 'active') {
          setPlanError(`Sua assinatura ${userPlanTier} está ${planStatus}. Reative sua assinatura para acessar esta funcionalidade.`)
          setIsLoading(false)
          return
        }
        
        // Tudo ok, usuário autenticado e com plano adequado
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
      if (event === 'SIGNED_OUT') {
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
  }, [router, supabase, redirectTo, requirePlan])
  
  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Verificando acesso...</div>
      </div>
    )
  }
  
  // Mostrar erro de plano se houver
  if (planError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <h2 className="text-xl font-semibold mb-4">Acesso Restrito</h2>
            <p className="mb-6 text-gray-600">{planError}</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Voltar
              </Button>
              <Button onClick={() => router.push('/upgrade')}>
                Ver Planos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Não renderizar nada se não estiver autenticado (redirecionamento em andamento)
  if (!isAuthenticated) {
    return null
  }
  
  // Renderizar conteúdo protegido
  return <>{children}</>
}
