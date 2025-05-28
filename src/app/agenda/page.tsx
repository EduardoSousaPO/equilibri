'use client'

import { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AgendaPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [userAppointments, setUserAppointments] = useState<any[]>([])
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClientSupabaseClient()
  const router = useRouter()
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar sessão
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          console.log('Usuário não autenticado, redirecionando para login')
          router.push('/login?redirectTo=/agenda')
          return
        }
        
        // Buscar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', session.user.id)
          .single()
        
        if (profileError || !profile) {
          console.error('Erro ao buscar perfil do usuário:', profileError)
          setError('Erro ao carregar seu perfil. Tente novamente mais tarde.')
          setIsLoading(false)
          return
        }
        
        // Verificar se o usuário tem plano clínico
        if (profile.plan !== 'clinical') {
          setError('Esta funcionalidade está disponível apenas para assinantes do plano Premium Clínico.')
          setIsLoading(false)
          return
        }
        
        setUserProfile({
          plan: profile.plan,
          status: 'active'
        })
        
        // Buscar slots disponíveis e agendamentos do usuário
        const response = await fetch('/api/agenda/slots')
        const data = await response.json()
        
        if (!response.ok) {
          setError(data.error || 'Erro ao buscar horários disponíveis')
          setIsLoading(false)
          return
        }
        
        setAvailableSlots(data.availableSlots || [])
        setUserAppointments(data.userAppointments || [])
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
  
  const handleBookSlot = async (slotId: string) => {
    try {
      setIsBooking(true)
      setError(null)
      setSuccess(null)
      
      const response = await fetch('/api/agenda/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slotId })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Erro ao agendar sessão')
        setIsBooking(false)
        return
      }
      
      setSuccess('Sessão agendada com sucesso!')
      
      // Atualizar lista de agendamentos
      setUserAppointments([data.appointment, ...userAppointments])
      
      // Remover slot da lista de disponíveis
      setAvailableSlots(availableSlots.filter(slot => slot.id !== slotId))
      
      setIsBooking(false)
    } catch (err) {
      console.error('Erro ao agendar sessão:', err)
      setError('Erro ao processar agendamento. Tente novamente mais tarde.')
      setIsBooking(false)
    }
  }
  
  // Formatar data e hora
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Carregando agenda...</div>
      </div>
    )
  }
  
  // Mostrar erro se houver
  if (error && !success) {
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Agende sua Sessão</h1>
      
      {success && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-green-600 mb-4">{success}</div>
          </CardContent>
        </Card>
      )}
      
      {userAppointments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Suas Sessões</h2>
          
          <div className="space-y-4">
            {userAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-emerald-200">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <Badge className="mb-2 bg-emerald-100 text-emerald-800">
                        {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
                      </Badge>
                      <h3 className="text-lg font-medium mb-1">
                        Sessão com {appointment.slots?.therapists?.name || 'Psicóloga'}
                      </h3>
                      <p className="text-gray-600">
                        {formatDateTime(appointment.slots?.start_time)}
                      </p>
                    </div>
                    
                    {appointment.meeting_link && (
                      <Button 
                        className="mt-4 md:mt-0"
                        onClick={() => window.open(appointment.meeting_link, '_blank')}
                      >
                        Entrar na Sessão
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Horários Disponíveis</h2>
        
        {availableSlots.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">
                Não há horários disponíveis no momento. Por favor, verifique novamente mais tarde.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {availableSlots.map((slot) => (
              <Card key={slot.id} className="hover:shadow-md transition-shadow available-slot">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <h3 className="text-lg font-medium mb-1">
                        {slot.therapists?.name || 'Psicóloga'}
                      </h3>
                      <p className="text-gray-600 mb-1">
                        {formatDateTime(slot.start_time)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {slot.therapists?.specialty || 'Terapia Cognitivo-Comportamental'}
                      </p>
                    </div>
                    
                    <Button 
                      className="mt-4 md:mt-0"
                      onClick={() => handleBookSlot(slot.id)}
                      disabled={isBooking}
                    >
                      {isBooking ? 'Agendando...' : 'Agendar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Como assinante do plano Premium Clínico, você tem direito a uma sessão por mês.</p>
        <p className="mt-2">As sessões têm duração de 50 minutos e são realizadas via Google Meet.</p>
      </div>
    </div>
  )
}
