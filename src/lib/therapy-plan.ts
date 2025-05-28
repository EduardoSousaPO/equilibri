import { createBrowserClient } from '@supabase/ssr';
import OpenAI from 'openai';

// Constante para o modelo OpenAI
const MODEL = 'gpt-4-turbo-preview';

// Cliente Supabase
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Função para criar cliente OpenAI
function createOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY não está definida');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Tipos básicos
export interface TherapyPlan {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  start_date: string;
  end_date: string;
}

export interface TherapyTask {
  id: string;
  plan_id: string;
  title: string;
  description: string;
  task_type: 'daily' | 'weekly';
  week_number: number;
  day_number: number;
  estimated_minutes: number;
  completed?: boolean;
}

// Tipos para análise multidimensional
export type CognitivePattern = {
  automaticThoughts: string[];
  cognitiveDistortions: string[];
  coreBeliefs: string[];
};

export type ValuesPurpose = {
  valuedAreas: string[];
  valueConflicts: string[];
  purposeCrisis: boolean;
};

export type EmotionalRegulation = {
  emotionalIntensity: number;
  copingStrategies: string[];
  triggers: string[];
};

export type BehavioralContext = {
  avoidancePatterns: string[];
  functionalBehaviors: string[];
  dysfunctionalBehaviors: string[];
  contextualFactors: string[];
};

export type EngagementReadiness = {
  insightLevel: number;
  changeMotivation: number;
  preferredInterventions: string[];
};

export type InteractionAnalysis = {
  cognitive: CognitivePattern;
  values: ValuesPurpose;
  emotional: EmotionalRegulation;
  behavioral: BehavioralContext;
  engagement: EngagementReadiness;
  timestamp: Date;
};

// Função principal para buscar plano ativo
export async function getUserActivePlan(userId: string): Promise<TherapyPlan | null> {
  const { data, error } = await supabase
    .from('therapy_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Função para criar plano básico
export async function createBasicPlan(userId: string, planType: string = 'general'): Promise<TherapyPlan> {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 28);
  
  const planTitles = {
    anxiety: 'Superando a Ansiedade com Mindfulness',
    depression: 'Reconectando com a Alegria de Viver', 
    general: 'Desenvolvimento Pessoal e Bem-estar'
  };
  
  const planDescriptions = {
    anxiety: 'Um plano de 4 semanas focado em técnicas de mindfulness e gestão da ansiedade',
    depression: 'Um plano de 4 semanas focado em ativação comportamental e mudança de perspectiva',
    general: 'Um plano de 4 semanas focado em autoconhecimento e crescimento pessoal'
  };
  
  const { data, error } = await supabase
    .from('therapy_plans')
    .insert({
      user_id: userId,
      title: planTitles[planType as keyof typeof planTitles] || planTitles.general,
      description: planDescriptions[planType as keyof typeof planDescriptions] || planDescriptions.general,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      duration_weeks: 4,
      status: 'active',
      progress: 0
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Criar tarefas básicas
  await createBasicTasks(data.id, planType);
  
  return data;
}

// Criar tarefas básicas para o plano
async function createBasicTasks(planId: string, planType: string) {
  const basicTasks = [
    // Semana 1
    { week: 1, day: 1, title: 'Reflexão Inicial', description: 'Reflita sobre seus objetivos para este plano' },
    { week: 1, day: 2, title: 'Check-in Emocional', description: 'Como você está se sentindo hoje?' },
    { week: 1, day: 3, title: 'Gratidão Diária', description: 'Liste 3 coisas pelas quais você é grato' },
    
    // Semana 2  
    { week: 2, day: 1, title: 'Respiração Consciente', description: 'Pratique 5 minutos de respiração profunda' },
    { week: 2, day: 2, title: 'Identificar Padrões', description: 'Observe seus padrões de pensamento hoje' },
    
    // Semana 3
    { week: 3, day: 1, title: 'Pequena Ação', description: 'Faça uma pequena ação em direção a seus objetivos' },
    { week: 3, day: 2, title: 'Conexão Social', description: 'Entre em contato com alguém importante para você' },
    
    // Semana 4
    { week: 4, day: 1, title: 'Avaliação do Progresso', description: 'Avalie seu progresso nas últimas semanas' },
    { week: 4, day: 2, title: 'Planejamento Futuro', description: 'Defina próximos passos para continuar crescendo' }
  ];
  
  const tasks = basicTasks.map(task => ({
    plan_id: planId,
    title: task.title,
    description: task.description,
    task_type: 'daily' as const,
    week_number: task.week,
    day_number: task.day,
    estimated_minutes: 10,
    instructions: [task.description]
  }));
  
  await supabase.from('therapy_tasks').insert(tasks);
}

// Buscar tarefas de uma semana
export async function getWeekTasks(planId: string, weekNumber: number): Promise<TherapyTask[]> {
  const { data: tasks, error } = await supabase
    .from('therapy_tasks')
    .select('*')
    .eq('plan_id', planId)
    .eq('week_number', weekNumber)
    .order('day_number');
    
  if (error) throw error;
  
  // Verificar completions
  const { data: completions } = await supabase
    .from('task_completions')
    .select('task_id')
    .in('task_id', tasks.map(t => t.id));
    
  const completedIds = new Set(completions?.map(c => c.task_id) || []);
  
  return tasks.map(task => ({
    ...task,
    completed: completedIds.has(task.id)
  }));
}

// Marcar tarefa como completa
export async function completeTask(taskId: string, userId: string): Promise<void> {
  await supabase
    .from('task_completions')
    .insert({
      task_id: taskId,
      user_id: userId,
      completed_at: new Date().toISOString()
    });
}

// Função simplificada para análise de necessidades
export function analyzeUserNeedsFromMessages(messages: any[]): string {
  const allText = messages.map(m => m.content?.toLowerCase() || '').join(' ');
  
  if (allText.includes('ansiedade') || allText.includes('nervoso') || allText.includes('preocup')) {
    return 'anxiety';
  }
  
  if (allText.includes('triste') || allText.includes('deprimi') || allText.includes('desanim')) {
    return 'depression'; 
  }
  
  return 'general';
}

// Buscar badges do usuário
export async function getUserBadges(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badge_name, description, icon')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
}

// Função para analisar uma única interação
export async function analyzeInteraction(
  message: string,
  emotionCheckins: any[] = [],
  previousAnalyses: InteractionAnalysis[] = []
): Promise<InteractionAnalysis> {
  const client = createOpenAIClient();
  
  const prompt = `Analise a seguinte interação do usuário em um contexto terapêutico, considerando as principais abordagens (TCC, ACT, DBT e Logoterapia):

1. Padrões Cognitivos (TCC):
- Identifique pensamentos automáticos negativos e sua intensidade (1-5)
- Aponte distorções cognitivas específicas e exemplos
- Sugira crenças centrais subjacentes e temas recorrentes
- Identifique evidências que confirmam/desafiam os pensamentos

2. Valores e Propósito (ACT/Logoterapia):
- Identifique áreas de vida valorizadas mencionadas
- Detecte ações alinhadas ou em conflito com valores
- Avalie sinais de crise de sentido/propósito
- Identifique oportunidades de autotranscendência
- Note temas existenciais presentes (liberdade, responsabilidade, sentido)

3. Regulação Emocional (DBT):
- Avalie intensidade emocional (1-5)
- Identifique emoções primárias e secundárias
- Liste gatilhos emocionais específicos
- Avalie habilidades de mindfulness presentes/ausentes
- Identifique estratégias de enfrentamento funcionais/disfuncionais
- Note sinais de desregulação que precisam de TIPP

4. Comportamentos e Contexto:
- Identifique padrões de evitação experiencial
- Liste comportamentos funcionais que podem ser reforçados
- Detecte comportamentos disfuncionais que precisam de mudança
- Aponte fatores contextuais que mantêm padrões
- Identifique recursos e suporte social disponível

5. Engajamento e Prontidão:
- Avalie nível de insight (1-5)
- Avalie motivação para mudança (1-5)
- Identifique barreiras para mudança
- Note preferências por tipo de intervenção
- Avalie aliança terapêutica e resistências

6. Avaliação de Risco:
- Identifique sinais de ideação suicida
- Note comportamentos autolesivos
- Avalie urgência de encaminhamento
- Detecte fatores de proteção presentes

Mensagem do usuário: "${message}"

Responda em formato JSON seguindo exatamente esta estrutura:
{
  "cognitive": {
    "automaticThoughts": [],
    "cognitiveDistortions": [],
    "coreBeliefs": [],
    "thoughtIntensity": 0,
    "evidences": {
      "supporting": [],
      "challenging": []
    }
  },
  "values": {
    "valuedAreas": [],
    "valueConflicts": [],
    "purposeCrisis": false,
    "existentialThemes": [],
    "transcendenceOpportunities": []
  },
  "emotional": {
    "emotionalIntensity": 0,
    "primaryEmotions": [],
    "secondaryEmotions": [],
    "copingStrategies": {
      "functional": [],
      "dysfunctional": []
    },
    "triggers": [],
    "mindfulnessSkills": {
      "present": [],
      "needed": []
    },
    "needsTIPP": false
  },
  "behavioral": {
    "avoidancePatterns": [],
    "functionalBehaviors": [],
    "dysfunctionalBehaviors": [],
    "contextualFactors": [],
    "socialSupport": []
  },
  "engagement": {
    "insightLevel": 0,
    "changeMotivation": 0,
    "barriers": [],
    "preferredInterventions": [],
    "therapeuticAlliance": {
      "strength": 0,
      "resistances": []
    }
  },
  "risk": {
    "suicidalIdeation": false,
    "selfHarmBehaviors": false,
    "urgencyLevel": 0,
    "protectiveFactors": []
  }
}`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'Você é um terapeuta especializado em análise multidimensional de interações terapêuticas.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      ...analysis,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Erro na análise da interação:', error);
    throw error;
  }
}

// Função para analisar padrões em múltiplas interações
export function analyzeInteractionPatterns(analyses: InteractionAnalysis[]): {
  predominantDistortions: string[];
  commonTriggers: string[];
  valueThemes: string[];
  behavioralPatterns: string[];
  recommendedApproach: 'TCC' | 'ACT' | 'DBT' | 'Logoterapia';
} {
  // Contadores para análise de frequência
  const distortions: { [key: string]: number } = {};
  const triggers: { [key: string]: number } = {};
  const values: { [key: string]: number } = {};
  const behaviors: { [key: string]: number } = {};
  
  // Acumuladores para médias
  let totalEmotionalIntensity = 0;
  let totalInsightLevel = 0;
  let totalChangeMotivation = 0;
  let purposeCrisisCount = 0;
  
  // Analisar cada interação
  analyses.forEach(analysis => {
    // Contabilizar distorções cognitivas
    analysis.cognitive.cognitiveDistortions.forEach(d => {
      distortions[d] = (distortions[d] || 0) + 1;
    });
    
    // Contabilizar gatilhos
    analysis.emotional.triggers.forEach(t => {
      triggers[t] = (triggers[t] || 0) + 1;
    });
    
    // Contabilizar áreas de valor
    analysis.values.valuedAreas.forEach(v => {
      values[v] = (values[v] || 0) + 1;
    });
    
    // Contabilizar comportamentos disfuncionais
    analysis.behavioral.dysfunctionalBehaviors.forEach(b => {
      behaviors[b] = (behaviors[b] || 0) + 1;
    });
    
    // Acumular médias
    totalEmotionalIntensity += analysis.emotional.emotionalIntensity;
    totalInsightLevel += analysis.engagement.insightLevel;
    totalChangeMotivation += analysis.engagement.changeMotivation;
    if (analysis.values.purposeCrisis) purposeCrisisCount++;
  });
  
  // Calcular médias
  const avgEmotionalIntensity = totalEmotionalIntensity / analyses.length;
  const avgInsightLevel = totalInsightLevel / analyses.length;
  const avgChangeMotivation = totalChangeMotivation / analyses.length;
  const purposeCrisisFrequency = purposeCrisisCount / analyses.length;
  
  // Determinar abordagem recomendada
  let recommendedApproach: 'TCC' | 'ACT' | 'DBT' | 'Logoterapia' = 'TCC';
  
  if (avgEmotionalIntensity > 4) {
    recommendedApproach = 'DBT';
  } else if (purposeCrisisFrequency > 0.5) {
    recommendedApproach = 'Logoterapia';
  } else if (Object.keys(values).length > Object.keys(distortions).length) {
    recommendedApproach = 'ACT';
  }
  
  return {
    predominantDistortions: Object.entries(distortions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([d]) => d),
    commonTriggers: Object.entries(triggers)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([t]) => t),
    valueThemes: Object.entries(values)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([v]) => v),
    behavioralPatterns: Object.entries(behaviors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([b]) => b),
    recommendedApproach
  };
} 