import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-queries';

export async function POST(req: Request) {
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
    
    // Obter dados do corpo da requisição
    const body = await req.json();
    const { slotId } = body;
    
    if (!slotId) {
      return NextResponse.json(
        { error: 'ID do horário é obrigatório' },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário tem plano clínico ativo
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, name, email')
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar se o plano permite agendamento
    if (profile.plan !== 'clinical') {
      return NextResponse.json(
        { error: 'Esta funcionalidade está disponível apenas para o plano Premium Clínico' },
        { status: 403 }
      );
    }
    
    // Verificar se o slot existe e está disponível
    const { data: slot, error: slotError } = await supabase
      .from('slots')
      .select(`
        id,
        therapist_id,
        start_time,
        end_time,
        status,
        therapists (
          name,
          email
        )
      `)
      .eq('id', slotId)
      .single();
    
    if (slotError || !slot) {
      return NextResponse.json(
        { error: 'Horário não encontrado' },
        { status: 404 }
      );
    }
    
    if (slot.status !== 'available') {
      return NextResponse.json(
        { error: 'Este horário não está mais disponível' },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário já tem uma sessão agendada para o mês atual
    const slotDate = new Date(slot.start_time);
    const slotMonth = `${slotDate.getFullYear()}-${String(slotDate.getMonth() + 1).padStart(2, '0')}`;
    
    const { data: existingAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, slots(start_time)')
      .eq('user_id', userId)
      .in('status', ['confirmed', 'pending']);
    
    if (!appointmentsError && existingAppointments && existingAppointments.length > 0) {
      const hasAppointmentThisMonth = existingAppointments.some(appointment => {
        const appointmentDate = new Date(appointment.slots.start_time);
        const appointmentMonth = `${appointmentDate.getFullYear()}-${String(appointmentDate.getMonth() + 1).padStart(2, '0')}`;
        return appointmentMonth === slotMonth;
      });
      
      if (hasAppointmentThisMonth) {
        return NextResponse.json(
          { error: 'Você já tem uma sessão agendada para este mês. O plano Premium Clínico permite uma sessão por mês.' },
          { status: 400 }
        );
      }
    }
    
    // Gerar link do Google Meet (simulado para este exemplo)
    const meetingId = `equilibri-${Math.random().toString(36).substring(2, 10)}`;
    const meetLink = `https://meet.google.com/${meetingId}`;
    
    // Criar agendamento
    const { data: appointment, error: createError } = await supabase
      .from('appointments')
      .insert({
        user_id: userId,
        slot_id: slotId,
        status: 'confirmed',
        meeting_link: meetLink,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Erro ao criar agendamento:', createError);
      return NextResponse.json(
        { error: 'Erro ao criar agendamento' },
        { status: 500 }
      );
    }
    
    // Atualizar status do slot para 'booked'
    await supabase
      .from('slots')
      .update({ status: 'booked' })
      .eq('id', slotId);
    
    // Enviar notificação para o terapeuta (simulado)
    console.log(`Notificação enviada para ${slot.therapists.email} sobre novo agendamento`);
    
    // Registrar evento de agendamento
    await supabase
      .from('user_events')
      .insert({
        user_id: userId,
        event_type: 'appointment_created',
        event_data: { 
          appointment_id: appointment.id,
          slot_id: slotId,
          therapist_name: slot.therapists.name,
          start_time: slot.start_time
        },
        created_at: new Date().toISOString()
      });
    
    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        therapist: slot.therapists.name,
        start_time: slot.start_time,
        end_time: slot.end_time,
        meeting_link: meetLink
      }
    });
    
  } catch (error) {
    console.error('Erro ao agendar sessão:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar solicitação' },
      { status: 500 }
    );
  }
}
