import { createBrowserClient } from '@supabase/ssr';

// Cliente Supabase
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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