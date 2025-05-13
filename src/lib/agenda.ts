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
    .select('plan, session_used')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Erro ao verificar perfil:', profileError);
    throw new Error('Não foi possível verificar seu plano');
  }

  if (profileData.plan !== 'clinical') {
    throw new Error('Somente usuários do plano Premium Clínico podem agendar sessões');
  }

  if (profileData.session_used) {
    throw new Error('Você já utilizou sua sessão mensal');
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

  // Gerar link do Google Meet (simulado por enquanto)
  const meetLink = `https://meet.google.com/equilibri-${Math.random().toString(36).substring(2, 9)}`;

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

  // 3. Marcar que o usuário utilizou sua sessão mensal
  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({ session_used: true })
    .eq('id', userId);

  if (profileUpdateError) {
    console.error('Erro ao atualizar utilização da sessão:', profileUpdateError);
    // Não precisamos reverter aqui, pois o agendamento já foi criado
  }

  // TODO: Integração com Google Calendar API para criar o evento
  // e gerar o link real do Meet

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
  const slots = [];
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
  
  // 3. Atualizar o perfil do usuário para permitir novo agendamento
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ session_used: false })
    .eq('id', userId);
    
  if (profileError) {
    console.error('Erro ao atualizar perfil:', profileError);
    // Não precisamos reverter aqui pois o agendamento já foi cancelado
  }
  
  // TODO: Cancelar evento no Google Calendar se integrado
} 