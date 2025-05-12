'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Slot } from '@/lib/agenda';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CalendarIcon, Clock } from 'lucide-react';

export default function AgendaPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [sessionUsed, setSessionUsed] = useState(false);
  const [appointmentLink, setAppointmentLink] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Verificar o plano do usuário e se já usou a sessão mensal
  useEffect(() => {
    async function checkUserPlan() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('plan, session_used')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setUserPlan(data.plan);
        setSessionUsed(data.session_used);
        
        // Redirecionar se não for plano 'clinical'
        if (data.plan !== 'clinical') {
          setError('Você precisa ter o plano Premium Clínico para acessar a agenda');
          return;
        }
        
        // Verificar se já existe um agendamento
        const { data: appointments, error: appointmentError } = await supabase
          .from('appointments')
          .select(`
            *,
            slot:slot_id(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (appointmentError) throw appointmentError;
        
        if (appointments && appointments.length > 0) {
          setAppointmentLink(appointments[0].meet_link);
        }
        
      } catch (err) {
        console.error('Erro ao verificar plano:', err);
        setError('Erro ao verificar suas informações');
      }
    }
    
    checkUserPlan();
  }, [supabase, router]);

  // Buscar slots disponíveis
  useEffect(() => {
    async function fetchSlots() {
      try {
        if (userPlan !== 'clinical') return;
        if (sessionUsed) return;
        
        setLoading(true);
        
        const { data, error } = await supabase
          .from('slots')
          .select(`
            *,
            therapists(name)
          `)
          .eq('status', 'free')
          .gte('start_utc', new Date().toISOString())
          .order('start_utc', { ascending: true });
          
        if (error) throw error;
        
        setSlots(data.map(slot => ({
          ...slot,
          therapist_name: slot.therapists?.name || 'Psicóloga',
        })));
        
      } catch (err) {
        console.error('Erro ao buscar slots:', err);
        setError('Erro ao buscar horários disponíveis');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSlots();
  }, [supabase, userPlan, sessionUsed]);

  // Agrupar slots por data
  const slotsByDate = slots.reduce((acc, slot) => {
    const date = format(parseISO(slot.start_utc), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  // Função para formatar horário
  const formatTime = (isoString: string) => {
    return format(parseISO(isoString), 'HH:mm', { locale: ptBR });
  };

  // Função para formatar data
  const formatDate = (isoString: string) => {
    return format(parseISO(isoString), "d 'de' MMMM", { locale: ptBR });
  };

  // Função para reservar slot
  const bookAppointment = async () => {
    if (!selectedSlot) return;
    
    try {
      setBookingStatus('loading');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      // 1. Atualizar o status do slot para 'booked'
      const { error: updateError } = await supabase
        .from('slots')
        .update({ status: 'booked' })
        .eq('id', selectedSlot.id);
        
      if (updateError) throw updateError;
      
      // 2. Criar o agendamento
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          slot_id: selectedSlot.id,
          user_id: user.id,
          meet_link: `https://meet.google.com/equilibri-${Math.random().toString(36).substring(2, 9)}`,
          notes: 'Sessão agendada'
        })
        .select()
        .single();
        
      if (appointmentError) throw appointmentError;
      
      // 3. Marcar que o usuário utilizou sua sessão mensal
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ session_used: true })
        .eq('id', user.id);
        
      if (profileUpdateError) throw profileUpdateError;
      
      setBookingStatus('success');
      setSessionUsed(true);
      setAppointmentLink(appointment.meet_link);
      
      // Remover o slot reservado da lista
      setSlots(slots.filter(s => s.id !== selectedSlot.id));
      
    } catch (err: any) {
      console.error('Erro ao reservar slot:', err);
      setBookingStatus('error');
      setBookingError(err.message || 'Erro ao reservar horário');
    } finally {
      setConfirmOpen(false);
    }
  };

  if (userPlan !== 'clinical') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Agenda de Sessões</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Restrito</AlertTitle>
          <AlertDescription>
            Apenas usuários do plano Premium Clínico podem acessar a agenda.
            <div className="mt-4">
              <Button onClick={() => router.push('/settings')}>
                Fazer Upgrade
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (sessionUsed && appointmentLink) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Sua Sessão</h1>
        <Alert>
          <CalendarIcon className="h-4 w-4" />
          <AlertTitle>Sessão Agendada</AlertTitle>
          <AlertDescription>
            Você já utilizou sua sessão mensal. A próxima estará disponível no início do próximo mês.
            <div className="mt-4">
              <a 
                href={appointmentLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button className="w-full">
                  Acessar Link da Videochamada
                </Button>
              </a>
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => {
                  const gcalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=Sessão Equilibri.IA&details=Link da sessão: ${appointmentLink}&dates=20230101T120000Z/20230101T130000Z`;
                  window.open(gcalUrl, '_blank');
                }}
              >
                Adicionar ao Google Calendar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Agende sua Sessão</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <p className="mb-6">
        Como assinante do plano Premium Clínico, você tem direito a uma sessão de 60 minutos por mês 
        com nossa psicóloga. Escolha um dos horários disponíveis abaixo.
      </p>
      
      {loading ? (
        <div className="text-center py-8">Carregando horários disponíveis...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(slotsByDate).map(([date, dateSlots]) => (
            <div key={date} className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2 capitalize">
                {formatDate(dateSlots[0].start_utc)}
              </h2>
              <div className="space-y-2">
                {dateSlots.map(slot => (
                  <Button
                    key={slot.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedSlot(slot);
                      setConfirmOpen(true);
                    }}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{formatTime(slot.start_utc)} - {formatTime(slot.end_utc)}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
          
          {slots.length === 0 && !loading && (
            <div className="col-span-full text-center py-8">
              Não há horários disponíveis no momento. Por favor, tente novamente mais tarde.
            </div>
          )}
        </div>
      )}
      
      {/* Modal de confirmação */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Agendamento</DialogTitle>
            <DialogDescription>
              Você está prestes a agendar uma sessão de 60 minutos com nossa psicóloga.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSlot && (
            <div className="py-4">
              <p className="font-semibold">{formatDate(selectedSlot.start_utc)}</p>
              <p>{formatTime(selectedSlot.start_utc)} - {formatTime(selectedSlot.end_utc)}</p>
              <p className="mt-2">Com: {selectedSlot.therapist_name}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmOpen(false)}
              disabled={bookingStatus === 'loading'}
            >
              Cancelar
            </Button>
            <Button 
              onClick={bookAppointment}
              disabled={bookingStatus === 'loading'}
            >
              {bookingStatus === 'loading' ? 'Agendando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
          
          {bookingStatus === 'error' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{bookingError}</AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 