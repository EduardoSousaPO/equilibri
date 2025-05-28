import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-queries';

export async function GET(req: Request) {
  try {
    // Criar cliente Supabase
    const supabase = await createServerSupabaseClient();
    
    // Verificar autenticação
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Usuário não autenticado. Faça login para continuar.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Buscar perfil do usuário para verificar plano
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar se o plano permite acesso à agenda
    if (profile.plan !== 'clinical') {
      return NextResponse.json(
        { error: 'Esta funcionalidade está disponível apenas para o plano Premium Clínico' },
        { status: 403 }
      );
    }
    
    // Obter mês atual e próximo mês
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Calcular início e fim do período (mês atual e próximo)
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 2, 0); // Último dia do próximo mês
    
    // Formatar datas para consulta
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Buscar slots disponíveis
    const { data: availableSlots, error: slotsError } = await supabase
      .from('slots')
      .select(`
        id,
        therapist_id,
        start_time,
        end_time,
        therapists (
          id,
          name,
          specialty,
          bio
        )
      `)
      .gte('start_time', startDateStr)
      .lte('start_time', endDateStr)
      .eq('status', 'available')
      .order('start_time', { ascending: true });
    
    if (slotsError) {
      console.error('Erro ao buscar slots disponíveis:', slotsError);
      return NextResponse.json(
        { error: 'Erro ao buscar horários disponíveis' },
        { status: 500 }
      );
    }
    
    // Buscar agendamentos existentes do usuário
    const { data: userAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        slot_id,
        status,
        created_at,
        slots (
          start_time,
          end_time,
          therapist_id,
          therapists (
            name
          )
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', new Date(currentYear, currentMonth - 1, 1).toISOString()) // Inclui mês anterior
      .order('created_at', { ascending: false });
    
    if (appointmentsError) {
      console.error('Erro ao buscar agendamentos do usuário:', appointmentsError);
    }
    
    // Verificar se o usuário já tem uma sessão agendada para o mês atual
    const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const hasCurrentMonthAppointment = userAppointments?.some(appointment => {
      const appointmentDate = new Date(appointment.slots.start_time);
      const appointmentMonth = `${appointmentDate.getFullYear()}-${String(appointmentDate.getMonth() + 1).padStart(2, '0')}`;
      return appointmentMonth === currentMonthStr && ['confirmed', 'pending'].includes(appointment.status);
    });
    
    return NextResponse.json({
      availableSlots: availableSlots || [],
      userAppointments: userAppointments || [],
      hasCurrentMonthAppointment,
      currentMonth: currentMonthStr
    });
    
  } catch (error) {
    console.error('Erro ao buscar agenda:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar solicitação' },
      { status: 500 }
    );
  }
}
