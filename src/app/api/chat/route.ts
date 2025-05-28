import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import { 
  analyzeInteraction, 
  analyzeInteractionPatterns,
  type InteractionAnalysis 
} from '@/lib/therapy-plan';

type PatternAnalysis = {
  predominantDistortions: string[];
  commonTriggers: string[];
  valueThemes: string[];
  behavioralPatterns: string[];
  recommendedApproach: 'TCC' | 'ACT' | 'DBT' | 'Logoterapia';
};

export async function POST(req: Request) {
  try {
    console.log('🤖 [CHAT] Iniciando processamento de mensagem...');
    
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
    const { message, history } = await req.json();
    
    // Criar entrada de mensagem no chat
    const { data: messageData, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        content: message,
        role: 'user'
      })
      .select()
      .single();
      
    if (messageError) throw messageError;
    
    // Buscar check-ins emocionais recentes
    const { data: recentCheckins } = await supabase
      .from('emotion_checkins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    // Analisar a interação atual
    const analysis = await analyzeInteraction(message, recentCheckins || []);
    
    // Salvar análise no banco
    const { error: analysisError } = await supabase
      .from('interaction_analyses')
      .insert({
        user_id: userId,
        message_id: messageData.id,
        cognitive_automatic_thoughts: analysis.cognitive.automaticThoughts,
        cognitive_distortions: analysis.cognitive.cognitiveDistortions,
        cognitive_core_beliefs: analysis.cognitive.coreBeliefs,
        values_areas: analysis.values.valuedAreas,
        values_conflicts: analysis.values.valueConflicts,
        values_purpose_crisis: analysis.values.purposeCrisis,
        emotional_intensity: analysis.emotional.emotionalIntensity,
        emotional_coping_strategies: analysis.emotional.copingStrategies,
        emotional_triggers: analysis.emotional.triggers,
        behavioral_avoidance: analysis.behavioral.avoidancePatterns,
        behavioral_functional: analysis.behavioral.functionalBehaviors,
        behavioral_dysfunctional: analysis.behavioral.dysfunctionalBehaviors,
        behavioral_context: analysis.behavioral.contextualFactors,
        engagement_insight: analysis.engagement.insightLevel,
        engagement_motivation: analysis.engagement.changeMotivation,
        engagement_interventions: analysis.engagement.preferredInterventions
      });
      
    if (analysisError) throw analysisError;
    
    // Buscar total de interações analisadas
    const { count: interactionCount } = await supabase
      .from('interaction_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    // Se atingiu 7 interações, fazer análise completa
    let patterns: PatternAnalysis | null = null;
    if (interactionCount && interactionCount >= 7) {
      // Buscar todas as análises
      const { data: allAnalyses } = await supabase
        .from('interaction_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(7);
        
      if (allAnalyses) {
        const analysisArray: InteractionAnalysis[] = allAnalyses.map(a => ({
          cognitive: {
            automaticThoughts: a.cognitive_automatic_thoughts || [],
            cognitiveDistortions: a.cognitive_distortions || [],
            coreBeliefs: a.cognitive_core_beliefs || []
          },
          values: {
            valuedAreas: a.values_areas || [],
            valueConflicts: a.values_conflicts || [],
            purposeCrisis: a.values_purpose_crisis || false
          },
          emotional: {
            emotionalIntensity: a.emotional_intensity || 1,
            copingStrategies: a.emotional_coping_strategies || [],
            triggers: a.emotional_triggers || []
          },
          behavioral: {
            avoidancePatterns: a.behavioral_avoidance || [],
            functionalBehaviors: a.behavioral_functional || [],
            dysfunctionalBehaviors: a.behavioral_dysfunctional || [],
            contextualFactors: a.behavioral_context || []
          },
          engagement: {
            insightLevel: a.engagement_insight || 1,
            changeMotivation: a.engagement_motivation || 1,
            preferredInterventions: a.engagement_interventions || []
          },
          timestamp: new Date(a.created_at)
        }));
        
        patterns = analyzeInteractionPatterns(analysisArray);
      }
    }
    
    // Preparar o prompt baseado na análise
    let systemPrompt = `Você é a Lari, uma terapeuta digital especializada em TCC, ACT, DBT e Logoterapia.
    Está conversando com um usuário que demonstra:

    ANÁLISE ATUAL:
    Nível de Insight: ${analysis.engagement.insightLevel}/5
    Motivação para Mudança: ${analysis.engagement.changeMotivation}/5
    Intensidade Emocional: ${analysis.emotional.emotionalIntensity}/5
    
    Distorções Cognitivas: ${analysis.cognitive.cognitiveDistortions.join(', ')}
    Gatilhos Emocionais: ${analysis.emotional.triggers.join(', ')}
    Áreas de Valor: ${analysis.values.valuedAreas.join(', ')}
    
    DIRETRIZES DE INTERVENÇÃO:

    1. VALIDAÇÃO E ACOLHIMENTO:
    - Use validação emocional antes de qualquer intervenção
    - Mantenha postura não julgamental
    - Demonstre escuta ativa com paráfrases
    - Adapte tom ao estado emocional atual

    2. ABORDAGEM PRINCIPAL (escolha baseada no perfil):
    - Se distorções cognitivas predominam → TCC
      * Questione gentilmente pensamentos automáticos
      * Proponha experimentos comportamentais simples
    
    - Se evitação experiencial/valores difusos → ACT
      * Use metáforas para explicar conceitos
      * Explore valores e ações comprometidas
    
    - Se desregulação emocional → DBT
      * Ofereça técnicas TIPP se necessário
      * Ensine habilidades de mindfulness
    
    - Se crise de sentido → Logoterapia
      * Use questionamento socrático
      * Conecte ações com propósito pessoal

    3. INTERVENÇÕES PRÁTICAS:
    - Foque em forças e recursos do usuário
    - Sugira exercícios curtos e mensuráveis
    - Faça micro-psicoeducação quando relevante
    - Proponha tarefas entre conversas realizáveis

    4. MONITORAMENTO DE RISCO:
    - Atenção a sinais de ideação suicida/autoagressão
    - Protocolo de crise: validar, expressar preocupação, recomendar CVV (188)`;

    if (patterns) {
      systemPrompt += `
      
      ANÁLISE DE PADRÃO (7 interações):
      Abordagem Recomendada: ${patterns.recommendedApproach}
      Distorções Predominantes: ${patterns.predominantDistortions.join(', ')}
      Gatilhos Comuns: ${patterns.commonTriggers.join(', ')}
      Temas de Valor: ${patterns.valueThemes.join(', ')}
      Padrões Comportamentais: ${patterns.behavioralPatterns.join(', ')}
      
      IMPORTANTE: 
      - Considere sugerir um plano terapêutico estruturado
      - Conecte intervenções aos temas de valor identificados
      - Use exemplos dos padrões observados para psicoeducação
      - Proponha exercícios específicos para os padrões identificados`;
    }
    
    // Preparar mensagens para IA
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history?.slice(-8) || [],
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
    const shouldShowPlanButton = patterns && 
                                 aiMessage.toLowerCase().includes('plano');
    
    console.log('✅ [CHAT] Processamento completo');
    
    return NextResponse.json({ 
      message: aiMessage,
      shouldShowPlanCreation: shouldShowPlanButton,
      messageCount: interactionCount + 1,
      canCreatePlan: patterns,
      plan: 'free'
    });
    
  } catch (error: any) {
    console.error('❌ [CHAT] Erro na API de chat:', error);
    return NextResponse.json(
      { message: 'Desculpe, tive um problema ao processar sua mensagem. Poderia tentar novamente?' },
      { status: 200 }
    );
  }
}
