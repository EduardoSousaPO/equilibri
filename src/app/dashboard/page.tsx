'use client'

import { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PlanBanner from '@/components/PlanBanner'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [messageCount, setMessageCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientSupabaseClient()
  const router = useRouter()
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar sessão
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          console.log('Usuário não autenticado, redirecionando para login')
          router.push('/login?redirectTo=/dashboard')
          return
        }
        
        // Buscar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, plan, msg_count, streak_days')
          .eq('id', session.user.id)
          .single()
        
        if (profileError || !profile) {
          console.error('Erro ao buscar perfil do usuário:', profileError)
          setError('Erro ao carregar seu perfil. Tente novamente mais tarde.')
          setIsLoading(false)
          return
        }
        
        setUserProfile({
          name: profile.name,
          plan: profile.plan || 'free',
          status: 'active', // Valor padrão pois não existe coluna de status
          streakDays: profile.streak_days || 0
        })
        
        setMessageCount(profile.msg_count || 0)
        setIsLoading(false)
      } catch (err) {
        console.error('Exceção ao verificar autenticação:', err)
        setError('Erro ao verificar autenticação. Tente novamente mais tarde.')
        setIsLoading(false)
      }
    }
    
    // Verificar autenticação ao montar o componente
    checkAuth()
  }, [router, supabase])
  
  const handleUpgrade = () => {
    router.push('/upgrade')
  }
  
  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Carregando dashboard...</div>
      </div>
    )
  }
  
  // Mostrar erro se houver
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const limitReached = userProfile?.plan === 'free' && messageCount >= 30
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {userProfile && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-2">Olá, {userProfile.name || 'Usuário'}</h2>
          
          <PlanBanner 
            plan={userProfile.plan} 
            messageCount={messageCount}
            limitReached={limitReached}
            onUpgrade={handleUpgrade}
          />
          
          {userProfile.streakDays > 0 && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-amber-600 text-lg mr-2">🔥</span>
                <div>
                  <p className="font-medium">Sequência de {userProfile.streakDays} {userProfile.streakDays === 1 ? 'dia' : 'dias'}</p>
                  <p className="text-sm text-gray-600">Continue usando o app diariamente para manter sua sequência!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Chat com Lari</h3>
            <p className="text-gray-600 mb-4">Converse com a Lari, sua terapeuta digital, sobre como você está se sentindo.</p>
            <Button 
              onClick={() => router.push('/chat')}
              disabled={limitReached && userProfile?.plan === 'free'}
              className="w-full"
            >
              Iniciar Conversa
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Transcrição de Áudio</h3>
            <p className="text-gray-600 mb-4">Grave um áudio sobre como você está se sentindo e obtenha uma transcrição.</p>
            <Button 
              onClick={() => router.push('/audio')}
              className="w-full"
            >
              Gravar Áudio
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {userProfile?.plan === 'clinical' && (
        <Card className="mb-8 border-2 border-emerald-200 bg-emerald-50">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Sessões com Psicóloga</h3>
            <p className="text-gray-600 mb-4">Como assinante do plano Premium Clínico, você tem direito a uma sessão mensal com nossa psicóloga.</p>
            <Button 
              onClick={() => router.push('/agenda')}
              className="w-full"
              variant="outline"
            >
              Agendar Sessão
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
