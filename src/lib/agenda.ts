import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Função para criar o cliente Supabase no servidor
const getSupabaseServer = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};

// Tipos
export interface Slot {
  id: string;
  therapist_id: string;
  start_utc: string;
  end_utc: string;
  status: 'free' | 'booked';
  therapist_name?: string; // Nome da psicóloga associada ao slot
}

export interface Appointment {
  id: string;
  slot_id: string;
  user_id: string;
  meet_link: string;
  notes: string;
  created_at: string;
  slot?: Slot; // Slot relacionado ao agendamento
}

/**
 * Lista todos os slots disponíveis
 */
export async function listFreeSlots(): Promise<Slot[]> {
  const supabase = getSupabaseServer();
  
  // Busca todos os slots com status 'free'
  const { data, error } = await supabase
    .from('slots')
    .select(`
      *,
      therapists(name)
    `)
    .eq('status', 'free')
    .gte('start_utc', new Date().toISOString()) // Somente slots futuros
    .order('start_utc', { ascending: true });
    
  if (error) {
    console.error('Erro ao buscar slots:', error);
    throw new Error('Falha ao buscar slots disponíveis');
  }
  
  // Formata os dados para incluir o nome da psicóloga
  return (data || []).map(slot => ({
    ...slot,
    therapist_name: slot.therapists?.name || 'Psicóloga',
  }));
}

/**
 * Reserva um slot e cria um agendamento
 */
export async function bookSlot(userId: string, slotId: string): Promise<Appointment> {
  const supabase = getSupabaseServer();

  // Começar uma transação (simulada com bloqueio de linha)
  const { data: slot, error: slotError } = await supabase
    .from('slots')
    .select('*')
    .eq('id', slotId)
    .eq('status', 'free')
    .single();

  if (slotError || !slot) {
    console.error('Erro ou slot não disponível:', slotError);
    throw new Error('Slot não está disponível para agendamento');
  }

  // Verificar se o usuário já tem uma sessão agendada (para plano Clinical)
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Erro ao verificar perfil:', profileError);
    throw new Error('Não foi possível verificar seu plano');
  }

  if (profileData.plan !== 'clinical') {
    throw new Error('Somente usuários do plano Premium Clínico podem agendar sessões');
  }

  // 1. Atualizar o status do slot para 'booked'
  const { error: updateError } = await supabase
    .from('slots')
    .update({ status: 'booked' })
    .eq('id', slotId);

  if (updateError) {
    console.error('Erro ao atualizar slot:', updateError);
    throw new Error('Falha ao reservar o horário');
  }

  // Gerar link do Google Meet (será substituído pelo link real do Google Calendar)
  const meetId = `equilibri-${Math.random().toString(36).substring(2, 9)}`;
  const meetLink = `https://meet.google.com/${meetId}`;

  // 2. Criar o agendamento
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      slot_id: slotId,
      user_id: userId,
      meet_link: meetLink,
      notes: 'Sessão agendada'
    })
    .select()
    .single();

  if (appointmentError) {
    // Rollback - restaurar slot para 'free' se falhar
    await supabase
      .from('slots')
      .update({ status: 'free' })
      .eq('id', slotId);
      
    console.error('Erro ao criar agendamento:', appointmentError);
    throw new Error('Falha ao criar o agendamento');
  }

  // 4. Integração com Google Calendar API
  try {
    // Buscar informações do usuário e terapeuta
    const [userRes, therapistRes] = await Promise.all([
      supabase.from('profiles').select('name, email').eq('id', userId).single(),
      supabase.from('therapists').select('name, email, calendar_credentials').eq('id', slot.therapist_id).single()
    ]);
    
    if (!userRes.error && !therapistRes.error && therapistRes.data.calendar_credentials) {
      // Chamar a API para criar o evento no Google Calendar
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/calendar/create-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          therapistId: slot.therapist_id,
          startTime: slot.start_utc,
          endTime: slot.end_utc,
          meetLink: meetLink
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.meetLink) {
        // Atualizar o link da reunião com o link real do Google Meet
        await supabase
          .from('appointments')
          .update({ meet_link: data.meetLink })
          .eq('id', appointment.id);
          
        // Atualizar o objeto de retorno
        appointment.meet_link = data.meetLink;
      }
    }
  } catch (error) {
    console.error('Erro na integração com Google Calendar:', error);
    // Não impede o fluxo principal se a integração falhar
  }

  return appointment;
}

/**
 * Lista os agendamentos de um usuário
 */
export async function listUserAppointments(userId: string): Promise<Appointment[]> {
  const supabase = getSupabaseServer();
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      slot:slot_id(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar agendamentos:', error);
    throw new Error('Falha ao buscar seus agendamentos');
  }
  
  return data || [];
}

/**
 * Lista os slots de um terapeuta (para a página de admin)
 */
export async function listTherapistSlots(therapistId: string): Promise<Slot[]> {
  const supabase = getSupabaseServer();
  
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('therapist_id', therapistId)
    .order('start_utc', { ascending: true });
    
  if (error) {
    console.error('Erro ao buscar slots do terapeuta:', error);
    throw new Error('Falha ao buscar seus horários');
  }
  
  return data || [];
}

/**
 * Cria novos slots para um terapeuta
 */
export async function createSlots(
  therapistId: string, 
  startDate: Date, 
  endDate: Date, 
  durationMinutes: number = 60
): Promise<Slot[]> {
  const supabase = getSupabaseServer();
  
  // Criar slots
  const slots: Omit<Slot, 'id'>[] = [];
  let currentTime = new Date(startDate);
  
  while (currentTime < endDate) {
    const slotEndTime = new Date(currentTime);
    slotEndTime.setMinutes(currentTime.getMinutes() + durationMinutes);
    
    slots.push({
      therapist_id: therapistId,
      start_utc: currentTime.toISOString(),
      end_utc: slotEndTime.toISOString(),
      status: 'free'
    });
    
    // Avançar para o próximo slot
    currentTime = new Date(slotEndTime);
  }
  
  // Inserir no banco
  const { data, error } = await supabase
    .from('slots')
    .insert(slots)
    .select();
    
  if (error) {
    console.error('Erro ao criar slots:', error);
    throw new Error('Falha ao criar horários disponíveis');
  }
  
  return data || [];
}

/**
 * Cancela um agendamento existente
 */
export async function cancelAppointment(userId: string, appointmentId: string): Promise<void> {
  const supabase = getSupabaseServer();
  
  // Verificar se o agendamento pertence ao usuário
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*, slot:slot_id(*)')
    .eq('id', appointmentId)
    .eq('user_id', userId)
    .single();
    
  if (fetchError || !appointment) {
    console.error('Erro ao buscar agendamento:', fetchError);
    throw new Error('Agendamento não encontrado ou não pertence a você');
  }
  
  // Iniciar transação
  // 1. Atualizar o status do slot para 'free'
  const { error: slotError } = await supabase
    .from('slots')
    .update({ status: 'free' })
    .eq('id', appointment.slot_id);
    
  if (slotError) {
    console.error('Erro ao atualizar slot:', slotError);
    throw new Error('Falha ao liberar o horário');
  }
  
  // 2. Excluir o agendamento
  const { error: deleteError } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId);
    
  if (deleteError) {
    console.error('Erro ao excluir agendamento:', deleteError);
    
    // Rollback - restaurar slot para 'booked' se falhar
    await supabase
      .from('slots')
      .update({ status: 'booked' })
      .eq('id', appointment.slot_id);
      
    throw new Error('Falha ao cancelar o agendamento');
  }
  
  // 4. Cancelar evento no Google Calendar
  try {
    // Buscar informações do agendamento e terapeuta
    const { data: slotData } = await supabase
      .from('slots')
      .select('therapist_id')
      .eq('id', appointment.slot_id)
      .single();
      
    if (slotData) {
      const { data: therapist } = await supabase
        .from('therapists')
        .select('calendar_credentials')
        .eq('id', slotData.therapist_id)
        .single();
        
      if (therapist?.calendar_credentials) {
        // Chamar API para cancelar o evento no Google Calendar
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/calendar/cancel-event`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointmentId,
            therapistId: slotData.therapist_id,
          }),
        });
      }
    }
  } catch (error) {
    console.error('Erro ao cancelar evento no Google Calendar:', error);
    // Não impede o fluxo principal se a integração falhar
  }
} 