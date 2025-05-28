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
    const { userId, therapistId, startTime, endTime, meetLink } = body;
    
    // Validação básica
    if (!userId || !therapistId || !startTime || !endTime || !meetLink) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    // Confirmar que o usuário autenticado é o mesmo do agendamento
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Não autorizado para este usuário' },
        { status: 403 }
      );
    }
    
    // Buscar dados do usuário e terapeuta
    const [userRes, therapistRes] = await Promise.all([
      supabase.from('profiles').select('name, email').eq('id', userId).single(),
      supabase.from('therapists').select('name, email, calendar_credentials').eq('id', therapistId).single()
    ]);
    
    if (userRes.error || therapistRes.error) {
      console.error('Erro ao buscar informações de usuário/terapeuta:', userRes.error || therapistRes.error);
      return NextResponse.json(
        { error: 'Erro ao buscar informações' },
        { status: 500 }
      );
    }
    
    const userData = userRes.data;
    const therapistData = therapistRes.data;
    
    // Verificar credenciais do Calendar
    if (!therapistData.calendar_credentials) {
      console.warn('Terapeuta sem credenciais do Google Calendar configuradas');
      return NextResponse.json(
        { error: 'Terapeuta sem integração com calendário' },
        { status: 200 }  // Não é um erro crítico, apenas informativo
      );
    }
    
    try {
      // Configurar autenticação com Google Calendar
      const credentials = JSON.parse(therapistData.calendar_credentials);
      
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      
      oauth2Client.setCredentials(credentials);
      
      // Criar o cliente do Calendar
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      // Criar o evento
      const event = {
        summary: `Sessão com ${userData.name || 'Paciente'}`,
        description: `Sessão de terapia agendada pela plataforma Equilibri.\n\nLink do Google Meet: ${meetLink}`,
        start: {
          dateTime: startTime,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: endTime,
          timeZone: 'America/Sao_Paulo',
        },
        conferenceData: {
          createRequest: {
            requestId: `equilibri-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        },
        attendees: [
          { email: userData.email || session.user.email, displayName: userData.name || 'Paciente' },
          { email: therapistData.email, displayName: therapistData.name }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };
      
      // Inserir o evento no calendário
      const calendarRes = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: event as any
      });
      
      if (!calendarRes.data || !calendarRes.data.htmlLink) {
        throw new Error('Resposta inesperada ao criar evento');
      }
      
      // Retornar sucesso
      return NextResponse.json({
        success: true,
        message: 'Evento criado com sucesso',
        eventLink: calendarRes.data.htmlLink
      });
      
    } catch (googleError: any) {
      console.error('Erro na API do Google Calendar:', googleError);
      
      return NextResponse.json(
        { 
          error: 'Erro ao criar evento no calendário',
          details: googleError.message 
        },
        { status: 500 }
      );
    }
    
  } catch (err: any) {
    console.error('Erro geral na criação de evento:', err);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 