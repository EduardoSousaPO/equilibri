'use client'

import { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function BadgesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userBadges, setUserBadges] = useState<any[]>([])
  const [streakDays, setStreakDays] = useState(0)
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
          router.push('/login?redirectTo=/badges')
          return
        }
        
        // Buscar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('streak_days')
          .eq('id', session.user.id)
          .single()
        
        if (profileError || !profile) {
          console.error('Erro ao buscar perfil do usuário:', profileError)
          setError('Erro ao carregar seu perfil. Tente novamente mais tarde.')
          setIsLoading(false)
          return
        }
        
        setStreakDays(profile.streak_days || 0)
        
        // Buscar badges do usuário
        const { data: badges, error: badgesError } = await supabase
          .from('user_badges')
          .select(`
            badge_id,
            earned_at,
            badges (
              id,
              name,
              description,
              icon,
              category
            )
          `)
          .eq('user_id', session.user.id)
          .order('earned_at', { ascending: false })
        
        if (badgesError) {
          console.error('Erro ao buscar badges do usuário:', badgesError)
          setError('Erro ao carregar suas conquistas. Tente novamente mais tarde.')
          setIsLoading(false)
          return
        }
        
        setUserBadges(badges || [])
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
  
  // Formatar data
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }
  
  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Carregando conquistas...</div>
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
            <Button onClick={() => router.push('/dashboard')}>Voltar para Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Agrupar badges por categoria
  const badgesByCategory: Record<string, any[]> = {}
  userBadges.forEach(badge => {
    const category = badge.badges?.category || 'Outros'
    if (!badgesByCategory[category]) {
      badgesByCategory[category] = []
    }
    badgesByCategory[category].push(badge)
  })
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Suas Conquistas</h1>
      
      {streakDays > 0 && (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <span className="text-amber-600 text-3xl mr-4">🔥</span>
              <div>
                <h2 className="text-lg font-semibold">Sequência Atual: {streakDays} {streakDays === 1 ? 'dia' : 'dias'}</h2>
                <p className="text-gray-600">Continue usando o app diariamente para manter sua sequência e desbloquear novas conquistas!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {Object.keys(badgesByCategory).length === 0 ? (
        <Card className="mb-6">
          <CardContent className="pt-6 text-center">
            <div className="text-gray-500 mb-4">
              <p>Você ainda não conquistou nenhuma badge.</p>
              <p className="mt-2">Continue usando o app para desbloquear conquistas!</p>
            </div>
            <Button onClick={() => router.push('/dashboard')}>Voltar para Dashboard</Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(badgesByCategory).map(([category, badges]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{category}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map(badge => (
                <Card key={badge.badge_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-3">
                      <div className="text-2xl mr-3">{badge.badges?.icon || '🏆'}</div>
                      <div>
                        <h3 className="font-medium">{badge.badges?.name || 'Conquista'}</h3>
                        <p className="text-xs text-gray-500">Conquistada em {formatDate(badge.earned_at)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{badge.badges?.description || 'Parabéns por esta conquista!'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
      
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Continue usando o Equilibri.IA para desbloquear mais conquistas e acompanhar seu progresso!</p>
      </div>
    </div>
  )
}
