import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import { generateWeeklyReport } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    // Obter cliente Supabase
    const supabase = await createRouteClient();
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Obter dados da requisição
    const { week_start, week_end, user_id } = await request.json();
    
    if (!week_start || !week_end || !user_id) {
      return NextResponse.json(
        { error: 'Parâmetros incompletos' },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário tem permissão para acessar os dados
    if (user.id !== user_id) {
      return NextResponse.json(
        { error: 'Não autorizado a acessar dados de outro usuário' },
        { status: 403 }
      );
    }
    
    // Verificar se o usuário é do plano gratuito e já atingiu o limite
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();
    
    if (profile?.plan === 'free') {
      // Contar relatórios existentes
      const { count, error: countError } = await supabase
        .from('weekly_reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (countError) {
        throw countError;
      }
      
      // Limite para plano gratuito: 4 relatórios
      if ((count || 0) >= 4) {
        return NextResponse.json(
          { error: 'Limite de relatórios atingido', limitReached: true },
          { status: 403 }
        );
      }
    }
    
    // Buscar entradas de diário da semana
    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', week_start)
      .lte('created_at', week_end)
      .order('created_at', { ascending: false });
    
    if (journalError) {
      throw journalError;
    }
    
    // Buscar entradas de áudio da semana
    const { data: audioEntries, error: audioError } = await supabase
      .from('audio_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', week_start)
      .lte('created_at', week_end)
      .order('created_at', { ascending: false });
    
    if (audioError) {
      throw audioError;
    }
    
    // Buscar check-ins emocionais da semana
    const { data: emotionCheckins, error: emotionError } = await supabase
      .from('emotion_checkins')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', week_start)
      .lte('created_at', week_end)
      .order('created_at', { ascending: false });
    
    if (emotionError) {
      throw emotionError;
    }
    
    // Calcular média de humor
    let totalMoodScore = 0;
    let moodEntries = 0;
    
    journalEntries?.forEach(entry => {
      if (entry.mood_score) {
        totalMoodScore += entry.mood_score;
        moodEntries++;
      }
    });
    
    audioEntries?.forEach(entry => {
      if (entry.mood_score) {
        totalMoodScore += entry.mood_score;
        moodEntries++;
      }
    });
    
    const averageMood = moodEntries > 0 ? totalMoodScore / moodEntries : null;
    
    // Gerar relatório com OpenAI
    const reportContent = await generateWeeklyReport(
      journalEntries || [],
      audioEntries || [],
      emotionCheckins || []
    );
    
    // Extrair insights do relatório
    const insights = [
      ...(reportContent.emotionalPatterns || []),
      ...(reportContent.recommendedActions?.slice(0, 3) || [])
    ].slice(0, 5);
    
    // Criar relatório no banco de dados
    const { data: report, error: reportError } = await supabase
      .from('weekly_reports')
      .insert({
        user_id,
        week_start,
        week_end,
        content: reportContent,
        average_mood: averageMood,
        insights
      })
      .select()
      .single();
    
    if (reportError) {
      throw reportError;
    }
    
    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório semanal' },
      { status: 500 }
    );
  }
}
