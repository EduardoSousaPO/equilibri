import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-queries';

// Função para obter o mês atual no formato YYYY-MM
function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

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
    
    // Obter perfil do usuário com informações de plano
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, msg_count, streak_days')
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }
    
    // Obter uso de recursos
    const currentMonth = getCurrentMonth();
    
    const { data: messageUsage } = await supabase
      .from('resource_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('resource_type', 'message')
      .eq('month', currentMonth)
      .single();
    
    const { data: transcriptionUsage } = await supabase
      .from('resource_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('resource_type', 'transcription')
      .eq('month', currentMonth)
      .single();
    
    // Obter plano ativo
    const { data: activePlan } = await supabase
      .from('therapy_plans')
      .select('id, title, created_at, activated_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    // Obter badges do usuário
    const { data: badges } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
    
    // Calcular limites com base no plano
    const planTier = profile.plan || 'free';
    // Como não existe coluna de status no banco, usamos sempre 'active'
    const planStatus = 'active';
    
    const limits = {
      messages: planTier === 'free' ? 30 : Infinity,
      transcriptions: planTier === 'free' ? 10 : (planTier === 'premium' ? 30 : 100),
      therapySessions: planTier === 'clinical' ? 1 : 0
    };
    
    const usage = {
      messages: profile.msg_count || 0,
      transcriptions: transcriptionUsage?.count || 0
    };
    
    // Verificar se o usuário atingiu algum limite
    const limitations = {
      messagesLimitReached: planTier === 'free' && (profile.msg_count || 0) >= 30,
      transcriptionsLimitReached: (transcriptionUsage?.count || 0) >= limits.transcriptions,
      planExpired: planTier !== 'free' && planStatus !== 'active'
    };
    
    // Calcular dias restantes no mês atual
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemainingInMonth = lastDayOfMonth - today.getDate();
    
    return NextResponse.json({
      profile: {
        plan: planTier,
        status: planStatus,
        streakDays: profile.streak_days || 0
      },
      limits,
      usage,
      limitations,
      activePlan,
      badges: badges || [],
      resetInfo: {
        daysUntilReset: daysRemainingInMonth,
        nextResetDate: new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split('T')[0]
      }
    });
    
  } catch (error) {
    console.error('Erro ao obter limites de uso:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar solicitação' },
      { status: 500 }
    );
  }
}
