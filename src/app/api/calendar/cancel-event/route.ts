import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { google } from 'googleapis';

export async function POST(req: Request) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Extrair dados do body
    const body = await req.json();
    const { appointmentId, therapistId } = body;
    
    // Validação básica
    if (!appointmentId || !therapistId) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    // Buscar o agendamento
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();
      
    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário tem permissão
    if (appointment.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado para este agendamento' },
        { status: 403 }
      );
    }
    
    // Buscar credenciais do terapeuta
    const { data: therapist, error: therapistError } = await supabase
      .from('therapists')
      .select('calendar_credentials, calendar_event_id')
      .eq('id', therapistId)
      .single();
      
    if (therapistError || !therapist || !therapist.calendar_credentials) {
      return NextResponse.json(
        { error: 'Terapeuta não encontrado ou sem credenciais' },
        { status: 404 }
      );
    }
    
    // Se não houver ID do evento, não há o que cancelar
    if (!therapist.calendar_event_id) {
      return NextResponse.json(
        { message: 'Nenhum evento do Google Calendar para cancelar' },
        { status: 200 }
      );
    }
    
    // Configurar cliente do Google Calendar
    try {
      const credentials = JSON.parse(therapist.calendar_credentials);
      
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      
      oauth2Client.setCredentials(credentials);
      
      // Criar o cliente do Calendar
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      // Cancelar o evento
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: therapist.calendar_event_id
      });
      
      // Retornar sucesso
      return NextResponse.json({
        success: true,
        message: 'Evento cancelado com sucesso'
      });
      
    } catch (googleError: any) {
      console.error('Erro na API do Google Calendar:', googleError);
      
      return NextResponse.json(
        { 
          error: 'Erro ao cancelar evento no calendário',
          details: googleError.message 
        },
        { status: 500 }
      );
    }
    
  } catch (err: any) {
    console.error('Erro geral ao cancelar evento:', err);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 