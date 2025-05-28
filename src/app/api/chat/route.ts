import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-queries';

export async function POST(req: Request) {
  try {
    console.log('🤖 [CHAT] Iniciando processamento de mensagem...');
    
    // Criar cliente Supabase
    const supabase = await createServerSupabaseClient();
    
    // OBRIGATÓRIO: Verificar se o usuário está autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ [CHAT] Erro ao verificar sessão:', sessionError);
      return NextResponse.json(
        { error: 'Erro de autenticação. Tente fazer login novamente.' },
        { status: 401 }
      );
    }
    
    if (!session || !session.user) {
      console.error('❌ [CHAT] Usuário não autenticado');
      return NextResponse.json(
        { error: 'Usuário não autenticado. Faça login para continuar.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    console.log('✅ [CHAT] Usuário autenticado:', userId);
    
    const body = await req.json();
    const { message, history } = body;
    
    // Validações básicas
    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário existe no banco de dados
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, plan, msg_count')
      .eq('id', userId)
      .single();
    
    if (profileError || !userProfile) {
      console.error('❌ [CHAT] Perfil não encontrado:', profileError);
      return NextResponse.json(
        { error: 'Perfil de usuário não encontrado. Faça login novamente.' },
        { status: 404 }
      );
    }
    
    // Verificar plano e limites
    const userPlan = userProfile.plan || 'free';
    const subscriptionStatus = 'active';
    const messageCount = userProfile.msg_count || 0;
    
    console.log('📋 [CHAT] Plano do usuário:', { 
      userPlan, 
      subscriptionStatus, 
      messageCount 
    });
    
    // Verificar se a assinatura está ativa (apenas para planos pagos)
    if (userPlan !== 'free' && subscriptionStatus !== 'active') {
      return NextResponse.json({ 
        error: `Sua assinatura ${userPlan} está ${subscriptionStatus}. Reative sua assinatura para continuar usando o chat.` 
      }, { status: 403 });
    }
    
    // Verificar limite de mensagens para plano gratuito
    if (userPlan === 'free' && messageCount >= 30) {
      return NextResponse.json({ 
        error: 'Você atingiu o limite mensal de 30 mensagens do plano gratuito. Faça upgrade para o plano Premium para mensagens ilimitadas.',
        limitReached: true,
        plan: 'free',
        messageCount: messageCount
      }, { status: 403 });
    }
    
    // Verificar variáveis de ambiente críticas
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [CHAT] OPENAI_API_KEY não configurada');
      return NextResponse.json(
        { error: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.' },
        { status: 503 }
      );
    }
    
    // Salvar mensagem do usuário
    await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        role: 'user',
        content: message,
        created_at: new Date().toISOString()
      });
    
    // Incrementar contador de mensagens
    await supabase.rpc('increment_message_count', {
      user_id_param: userId
    });
    
    // Buscar histórico de mensagens para contexto
    const { data: chatHistory } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Verificar se já tem plano ativo
    const { data: existingPlan } = await supabase
      .from('therapy_plans')
      .select('id, title')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    const userName = userProfile?.name || 'usuário';
    const currentMessageCount = messageCount + 1;
      
    // Lógica de planos mais criteriosa
    const shouldSuggestPlan = currentMessageCount >= 8 && !existingPlan && 
                             chatHistory?.some(msg => 
                               msg.role === 'user' && 
                               (msg.content.toLowerCase().includes('ajuda') ||
                                msg.content.toLowerCase().includes('melhorar') ||
                                msg.content.toLowerCase().includes('mudar'))
                             );
    
    // Sistema de prompts terapêuticos
    let systemPrompt = `Você é a Lari, uma terapeuta digital especializada em TCC, ACT e DBT. 
    Está conversando com ${userName}. Esta é a ${currentMessageCount}ª mensagem deles.
    
    IMPORTANTE: Seja uma terapeuta profissional, empática e científica.`;
    
    if (currentMessageCount <= 3) {
      systemPrompt += `
      
      FASE DE RAPPORT (1-3 mensagens):
      - Foque em construir confiança e compreensão
      - Use validação empática
      - Faça perguntas abertas para entender melhor
      - NÃO proponha soluções ou planos ainda
      - Use técnicas de escuta ativa`;
      
    } else if (currentMessageCount <= 6) {
      systemPrompt += `
      
      FASE DE EXPLORAÇÃO (4-6 mensagens):
      - Explore padrões e gatilhos
      - Use técnicas de reestruturação cognitiva suave
      - Identifique recursos e fortalezas do usuário
      - Comece a normalizar experiências
      - Ofereça técnicas pontuais quando apropriado`;
      
    } else if (shouldSuggestPlan) {
      systemPrompt += `
      
      FASE DE INTERVENÇÃO (7+ mensagens):
      - Agora você pode sugerir um plano estruturado
      - Base a sugestão em padrões observados nas conversas
      - Explique claramente os benefícios
      - Seja específica sobre como funcionará`;
      
    } else {
      systemPrompt += `
      
      FASE DE APROFUNDAMENTO (7+ mensagens):
      - Continue explorando e oferecendo técnicas pontuais
      - Use técnicas específicas de TCC, ACT ou DBT
      - Ajude na conscientização de padrões
      - Ofereça estratégias de enfrentamento`;
    }
    
    systemPrompt += `
    
    DIRETRIZES:
    - Use validação emocional antes de qualquer intervenção
    - Mantenha postura não julgmental
    - Foque em forças e recursos do usuário
    - Use linguagem calorosa mas profissional
    - Responda sempre em português brasileiro`;
    
    // Preparar mensagens para IA
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory?.reverse()?.slice(-8) || [],
      { role: 'user', content: message }
    ];
    
    console.log('🤖 [CHAT] Enviando requisição para OpenAI...');
    
    // Chamar OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [CHAT] Erro OpenAI:', errorText);
      throw new Error('Falha na API do OpenAI');
    }
    
    const data = await response.json();
    const aiMessage = data.choices[0].message.content;
    
    console.log('✅ [CHAT] Resposta recebida da OpenAI');
    
    // Salvar resposta da IA
    await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        role: 'assistant',
        content: aiMessage,
        created_at: new Date().toISOString()
      });
      
    // Verificar se deve mostrar botão de criar plano
    const shouldShowPlanButton = shouldSuggestPlan && 
                                 aiMessage.toLowerCase().includes('plano');
    
    console.log('✅ [CHAT] Processamento completo');
    
    return NextResponse.json({ 
      message: aiMessage,
      shouldShowPlanCreation: shouldShowPlanButton,
      messageCount: currentMessageCount,
      canCreatePlan: shouldSuggestPlan,
      plan: userPlan
    });
    
  } catch (error: any) {
    console.error('❌ [CHAT] Erro na API de chat:', error);
    return NextResponse.json(
      { message: 'Desculpe, tive um problema ao processar sua mensagem. Poderia tentar novamente?' },
      { status: 200 }
    );
  }
}
