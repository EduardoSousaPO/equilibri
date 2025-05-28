import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import { 
  createTherapyPlan, 
  analyzeUserNeedsFromChat,
  type TherapyPlan 
} from '@/lib/therapy-plan';

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient();
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await req.json();
    const { userObjective } = body; // Objetivo específico se fornecido
    
    // Verificar se já tem um plano ativo
    const { data: existingPlan } = await supabase
      .from('therapy_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    if (existingPlan) {
      return NextResponse.json(
        { error: 'Você já possui um plano ativo' },
        { status: 400 }
      );
    }
    
    // Buscar mensagens do chat para análise
    const { data: chatMessages } = await supabase
      .from('chat_messages')
      .select('content, role')
      .eq('user_id', userId)
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(10); // Últimas 10 mensagens do usuário
    
    if (!chatMessages || chatMessages.length < 3) {
      return NextResponse.json(
        { error: 'É necessário ter pelo menos 3 conversas antes de criar um plano' },
        { status: 400 }
      );
    }
    
    // Analisar necessidades do usuário baseado no chat
    const planType = analyzeUserNeedsFromChat(chatMessages);
    
    // Criar o plano terapêutico
    const newPlan = await createTherapyPlan(userId, planType, userObjective);
    
    // Registrar evento no sistema
    await supabase
      .from('system_logs')
      .insert({
        event: 'therapy_plan_created',
        details: {
          user_id: userId,
          plan_id: newPlan.id,
          plan_type: planType,
          user_objective: userObjective
        }
      });
    
    // Salvar uma mensagem da Lari confirmando a criação do plano
    const confirmationMessage = `🎉 Perfeito! Criei seu plano terapêutico personalizado: "${newPlan.title}".

Seu plano de 4 semanas já está pronto e inclui:
• Tarefas diárias personalizadas
• Acompanhamento de progresso
• Técnicas específicas para seus objetivos

Você pode acessar seu plano a qualquer momento na aba "Plano" ou clicando no botão abaixo. Vamos começar essa jornada juntos! 💪`;

    await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        role: 'assistant',
        content: confirmationMessage,
        created_at: new Date().toISOString()
      });
    
    return NextResponse.json({
      success: true,
      plan: newPlan,
      message: 'Plano terapêutico criado com sucesso!'
    });
    
  } catch (error: any) {
    console.error('Erro ao criar plano terapêutico:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao criar plano terapêutico',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 