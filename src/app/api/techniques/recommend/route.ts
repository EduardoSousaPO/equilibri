import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { recommendTherapyTechniques } from '@/lib/openai';
import { Database } from '@/types/supabase';

export async function POST(request: NextRequest) {
  try {
    // Obter cliente Supabase usando createServerClient em vez de createRouteHandlerClient
    const cookieStore = await cookies();
    
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    );
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Buscar histórico emocional do usuário
    
    // 1. Buscar check-ins emocionais recentes (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: recentCheckins, error: checkinsError } = await supabase
      .from('emotion_checkins')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });
    
    if (checkinsError) {
      throw checkinsError;
    }
    
    // 2. Contar ocorrências de cada emoção
    const emotionCounts: Record<string, number> = {};
    recentCheckins?.forEach(checkin => {
      emotionCounts[checkin.emotion] = (emotionCounts[checkin.emotion] || 0) + 1;
    });
    
    const recentEmotions = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count
    })).sort((a, b) => b.count - a.count);
    
    // 3. Buscar padrões de pensamento recentes (das análises de diário e áudio)
    const { data: recentEntries, error: entriesError } = await supabase
      .from('journal_entries')
      .select('analysis')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (entriesError) {
      throw entriesError;
    }
    
    const { data: recentAudio, error: audioError } = await supabase
      .from('audio_entries')
      .select('analysis')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (audioError) {
      throw audioError;
    }
    
    // Extrair padrões das análises
    const recentPatterns: string[] = [];
    
    recentEntries?.forEach(entry => {
      if (entry.analysis && typeof entry.analysis === 'object' && 'patterns' in entry.analysis) {
        const patterns = (entry.analysis as any).patterns;
        if (Array.isArray(patterns)) {
          recentPatterns.push(...patterns);
        }
      }
    });
    
    recentAudio?.forEach(entry => {
      if (entry.analysis && typeof entry.analysis === 'object' && 'patterns' in entry.analysis) {
        const patterns = (entry.analysis as any).patterns;
        if (Array.isArray(patterns)) {
          recentPatterns.push(...patterns);
        }
      }
    });
    
    // Remover duplicatas
    const uniquePatterns = [...new Set(recentPatterns)];
    
    // 4. Buscar técnicas utilizadas anteriormente
    const { data: userTechniques, error: techniquesError } = await supabase
      .from('user_techniques')
      .select('*, therapy_techniques(*)')
      .eq('user_id', user.id)
      .order('last_used', { ascending: false });
    
    if (techniquesError) {
      throw techniquesError;
    }
    
    const previousTechniques = userTechniques?.map(ut => ({
      name: ut.therapy_techniques?.name || '',
      timesUsed: ut.times_used,
      effectiveness: ut.effectiveness_rating
    })) || [];
    
    // Preparar dados para a recomendação
    const userHistory = {
      recentEmotions,
      recentPatterns: uniquePatterns,
      previousTechniques
    };
    
    // Gerar recomendações com OpenAI
    const recommendations = await recommendTherapyTechniques(userHistory);
    
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error recommending techniques:', error);
    return NextResponse.json(
      { error: 'Erro ao recomendar técnicas terapêuticas' },
      { status: 500 }
    );
  }
}
