'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CalendarIcon, Clock } from 'lucide-react';
import Link from 'next/link';

interface Slot {
  id: string;
  therapist_id: string;
  start_utc: string;
  end_utc: string;
  status: 'free' | 'booked';
  therapist_name?: string;
}

interface Appointment {
  id: string;
  slot_id: string;
  user_id: string;
  meet_link: string;
  notes: string;
  created_at: string;
  slot?: Slot;
}

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bookingSlot, setBookingSlot] = useState(false);
  const [cancellingAppointment, setCancellingAppointment] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
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
      
      // Verificar novamente se o slot ainda está livre
      const { data: slotCheck, error: slotCheckError } = await supabase
        .from('slots')
        .select('status')
        .eq('id', selectedSlot.id)
        .single();
      
      if (slotCheckError) throw slotCheckError;
      
      if (slotCheck.status !== 'free') {
        throw new Error('Este horário já foi reservado. Por favor, escolha outro.');
      }
      
      // 1. Atualizar o status do slot para 'booked'
      const { error: updateError } = await supabase
        .from('slots')
        .update({ status: 'booked' })
        .eq('id', selectedSlot.id);
        
      if (updateError) throw updateError;
      
      // 2. Gerar link do Google Meet
      const meetId = `equilibri-${Math.random().toString(36).substring(2, 9)}`;
      const meetLink = `https://meet.google.com/${meetId}`;
      
      // 3. Criar o agendamento
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          slot_id: selectedSlot.id,
          user_id: user.id,
          meet_link: meetLink,
          notes: 'Sessão agendada'
        })
        .select()
        .single();
        
      if (appointmentError) throw appointmentError;
      
      // 4. Marcar como sessão utilizada no perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ session_used: true })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // 5. Integração com Google Calendar (via serverless function)
      try {
        await fetch('/api/calendar/create-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            therapistId: selectedSlot.therapist_id,
            startTime: selectedSlot.start_utc,
            endTime: selectedSlot.end_utc,
            meetLink
          }),
        });
      } catch (calendarError) {
        // Se falhar, não impede o fluxo principal
        console.error('Erro ao criar evento no Google Calendar:', calendarError);
      }
      
      // 6. Configurar estados de sucesso
      setBookingStatus('success');
      setAppointmentLink(meetLink);
      setConfirmOpen(false);
      setSuccess('Sessão agendada com sucesso! O link para a reunião está disponível na sua área do paciente.');
      
      // 7. Atualizar a lista de slots
      setSlots(slots.filter(slot => slot.id !== selectedSlot.id));
      
    } catch (err: any) {
      console.error('Erro ao reservar slot:', err);
      setBookingStatus('error');
      setBookingError(err.message || 'Erro ao reservar o horário. Tente novamente.');
    } finally {
      setBookingSlot(false);
    }
  };

  // Verificar se há agendamentos futuros
  const hasFutureAppointments = appointments.some(appointment => 
    appointment.slot && isAfter(parseISO(appointment.slot.start_utc), new Date())
  );

  // Handler para clicar em um slot
  const handleSlotClick = (slot: Slot) => {
    if (sessionUsed) return; // Não permitir agendamento se já utilizou a sessão
    setSelectedSlot(slot);
    setShowSlotModal(true);
  };

  // Função para cancelar um agendamento
  const cancelAppointment = async () => {
    if (!appointmentToCancel) return;
    
    setCancellingAppointment(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      // 1. Atualizar o status do slot para 'free'
      const { error: slotError } = await supabase
        .from('slots')
        .update({ status: 'free' })
        .eq('id', appointmentToCancel.slot_id);
        
      if (slotError) throw slotError;
      
      // 2. Excluir o agendamento
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentToCancel.id);
        
      if (deleteError) {
        // Rollback - restaurar slot para 'booked' se falhar
        await supabase
          .from('slots')
          .update({ status: 'booked' })
          .eq('id', appointmentToCancel.slot_id);
          
        throw deleteError;
      }
      
      // 3. Atualizar o perfil do usuário para permitir novo agendamento
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ session_used: false })
        .eq('id', user.id);
        
      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
      }
      
      setSessionUsed(false);
      setSuccess('Sessão cancelada com sucesso!');
      
      // Recarregar página após 2 segundos
      setTimeout(() => {
        router.refresh();
      }, 2000);
      
    } catch (err) {
      console.error('Erro ao cancelar sessão:', err);
      setError('Ocorreu um erro ao cancelar sua sessão. Tente novamente.');
    } finally {
      setCancellingAppointment(false);
      setShowCancelModal(false);
    }
  };

  // Handler para clicar em cancelar agendamento
  const handleCancelClick = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  // Componente para renderizar o agendamento confirmado
  const ConfirmedAppointment = () => (
    <div className="bg-green-50 border border-green-200 rounded-md p-6 mb-6">
      <div className="flex items-start mb-4">
        <div className="bg-green-100 p-3 rounded-full mr-4">
          <CalendarIcon className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-green-800">Sua sessão está confirmada!</h3>
          <p className="text-green-700 mt-1">
            A psicóloga entrará em contato para confirmar os detalhes.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-green-100 rounded p-3">
          <p className="text-sm text-gray-500">Data da sessão</p>
          <p className="font-medium">
            {appointments[0]?.slot ? formatDate(appointments[0].slot.start_utc) : "Carregando..."}
          </p>
        </div>
        <div className="bg-white border border-green-100 rounded p-3">
          <p className="text-sm text-gray-500">Horário</p>
          <p className="font-medium">
            {appointments[0]?.slot ? `${formatTime(appointments[0].slot.start_utc)} às ${formatTime(appointments[0].slot.end_utc)}` : "Carregando..."}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button 
          variant="outline" 
          className="border-green-600 text-green-600 hover:bg-green-50"
          onClick={() => window.open(appointmentLink || '#', '_blank')}
          disabled={!appointmentLink}
        >
          Acessar Link da Sessão
        </Button>
        <Button 
          variant="outline" 
          className="border-red-600 text-red-600 hover:bg-red-50"
          onClick={() => handleCancelClick(appointments[0])}
        >
          Cancelar Agendamento
        </Button>
      </div>
    </div>
  );

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Agendamento de Sessão</h1>
      <p className="text-muted-foreground mb-6">
        Escolha um horário disponível para sua sessão com uma de nossas psicólogas.
      </p>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle>Sucesso!</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      {userPlan !== 'clinical' && (
        <div className="bg-primary/10 border border-primary/20 rounded-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Plano Premium Clínico Necessário</h2>
          <p className="mb-4">
            Esta funcionalidade está disponível apenas para assinantes do plano Premium Clínico.
            Faça upgrade para agendar sessões com psicólogas qualificadas.
          </p>
          <Button onClick={() => router.push('/settings')}>
            Ver Planos
          </Button>
        </div>
      )}
      
      {userPlan === 'clinical' && sessionUsed && !appointmentLink && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Sessão Mensal Utilizada</h2>
          <p className="mb-4">
            Você já utilizou sua sessão mensal disponível no plano Premium Clínico.
            Uma nova sessão estará disponível no próximo mês.
          </p>
        </div>
      )}
      
      {userPlan === 'clinical' && appointmentLink && (
        <ConfirmedAppointment />
      )}
      
      {userPlan === 'clinical' && !sessionUsed && !appointmentLink && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Horários Disponíveis</h2>
              {Object.keys(slotsByDate).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(slotsByDate).map(([date, daySlots]) => (
                    <div key={date} className="border rounded-md overflow-hidden">
                      <div className="bg-primary/10 py-2 px-4 font-medium">
                        {format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
                      </div>
                      <div className="divide-y">
                        {daySlots.map(slot => (
                          <button
                    key={slot.id}
                            className="w-full text-left py-3 px-4 hover:bg-gray-50 transition-colors flex justify-between items-center"
                            onClick={() => handleSlotClick(slot)}
                  >
                            <div>
                              <div className="font-medium">
                                {formatTime(slot.start_utc)} - {formatTime(slot.end_utc)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {slot.therapist_name}
                              </div>
                            </div>
                            <div className="text-primary">Agendar →</div>
                          </button>
                ))}
              </div>
            </div>
          ))}
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md bg-gray-50">
                  <div className="text-muted-foreground mb-2">
                    Não há horários disponíveis no momento
                  </div>
                  <div className="text-sm">
                    Por favor, tente novamente mais tarde
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Informações Importantes</h2>
              <div className="bg-gray-50 rounded-md p-6 space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Duração da Sessão</h3>
                  <p className="text-sm text-muted-foreground">
                    Cada sessão tem duração de 60 minutos e é realizada via Google Meet.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Cancelamento</h3>
                  <p className="text-sm text-muted-foreground">
                    Caso precise cancelar, faça com pelo menos 12 horas de antecedência.
                    Cancelamentos de última hora contarão como sessão utilizada.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Preparação</h3>
                  <p className="text-sm text-muted-foreground">
                    Encontre um local tranquilo e privado para sua sessão. Certifique-se 
                    de ter uma conexão estável com a internet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
          )}
      
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4"></div>
          <div>Carregando horários disponíveis...</div>
        </div>
      )}
      
      {/* Modal de confirmação */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Agendamento</DialogTitle>
            <DialogDescription>
              Você está confirmando o agendamento para:
            </DialogDescription>
          </DialogHeader>
          
          {selectedSlot && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border rounded p-3">
                  <span className="text-sm text-muted-foreground">Data</span>
                  <p className="font-medium">{formatDate(selectedSlot.start_utc)}</p>
                </div>
                <div className="border rounded p-3">
                  <span className="text-sm text-muted-foreground">Horário</span>
                  <p className="font-medium">{formatTime(selectedSlot.start_utc)} - {formatTime(selectedSlot.end_utc)}</p>
                </div>
              </div>
              
              <div className="border rounded p-3 mb-4">
                <span className="text-sm text-muted-foreground">Psicóloga</span>
                <p className="font-medium">{selectedSlot.therapist_name}</p>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Ao confirmar, você estará utilizando sua sessão mensal incluída no plano Premium Clínico.
              </p>
            </div>
          )}
          
          {bookingStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{bookingError}</AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={bookingStatus === 'loading'}>
              Cancelar
            </Button>
            <Button onClick={bookAppointment} disabled={bookingStatus === 'loading'}>
              {bookingStatus === 'loading' ? 'Confirmando...' : 'Confirmar Agendamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de cancelamento */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja cancelar sua sessão agendada?
            </DialogDescription>
          </DialogHeader>
          
          {appointmentToCancel && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border rounded p-3">
                  <span className="text-sm text-muted-foreground">Data</span>
                  <p className="font-medium">
                    {appointmentToCancel.slot ? formatDate(appointmentToCancel.slot.start_utc) : "Data não disponível"}
                  </p>
                </div>
                <div className="border rounded p-3">
                  <span className="text-sm text-muted-foreground">Horário</span>
                  <p className="font-medium">
                    {appointmentToCancel.slot 
                      ? `${formatTime(appointmentToCancel.slot.start_utc)} - ${formatTime(appointmentToCancel.slot.end_utc)}` 
                      : "Horário não disponível"}
                  </p>
                </div>
              </div>
              
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                  O cancelamento com menos de 12 horas de antecedência ou não comparecimento
                  contará como sessão utilizada do mês.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)} disabled={cancellingAppointment}>
              Voltar
            </Button>
            <Button 
              variant="destructive" 
              onClick={cancelAppointment} 
              disabled={cancellingAppointment}
            >
              {cancellingAppointment ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 