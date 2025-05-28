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
    const { planId } = body;
    
    if (!planId) {
      return NextResponse.json(
        { error: 'ID do plano é obrigatório' },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário tem um plano ativo
    const { data: existingPlan } = await supabase
      .from('therapy_plans')
      .select('id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    if (existingPlan) {
      // Desativar plano existente
      await supabase
        .from('therapy_plans')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', existingPlan.id);
    }
    
    // Obter detalhes do plano
    const { data: planDetails, error: planError } = await supabase
      .from('therapy_plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (planError || !planDetails) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar se o plano pertence ao usuário
    if (planDetails.user_id !== userId) {
      return NextResponse.json(
        { error: 'Acesso negado a este plano' },
        { status: 403 }
      );
    }
    
    // Ativar o plano
    const { error: updateError } = await supabase
      .from('therapy_plans')
      .update({ 
        status: 'active',
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', planId);
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao ativar plano' },
        { status: 500 }
      );
    }
    
    // Buscar tarefas do plano
    const { data: tasks, error: tasksError } = await supabase
      .from('therapy_tasks')
      .select('*')
      .eq('plan_id', planId)
      .order('day', { ascending: true });
    
    if (tasksError) {
      return NextResponse.json(
        { error: 'Erro ao buscar tarefas do plano' },
        { status: 500 }
      );
    }
    
    // Atualizar perfil do usuário com badge de plano ativo
    await supabase
      .from('profiles')
      .update({ 
        has_active_plan: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    // Registrar evento de ativação de plano
    await supabase
      .from('user_events')
      .insert({
        user_id: userId,
        event_type: 'plan_activated',
        event_data: { plan_id: planId },
        created_at: new Date().toISOString()
      });
    
    return NextResponse.json({ 
      success: true, 
      plan: planDetails,
      tasks: tasks || []
    });
    
  } catch (error) {
    console.error('Erro ao ativar plano:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar solicitação' },
      { status: 500 }
    );
  }
}
