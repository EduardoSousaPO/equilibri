'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { 
  getUserActivePlan, 
  getWeekTasks, 
  completeTask,
  getUserBadges,
  TherapyPlan, 
  TherapyTask 
} from '@/lib/therapy-plan';
import { Button } from '@/components/ui/button';

// Componente de Tarefa
interface TaskCardProps {
  task: TherapyTask;
  onComplete: (taskId: string) => void;
  completed?: boolean;
}

const TaskCard = ({ task, onComplete, completed = false }: TaskCardProps) => {
  const [completing, setCompleting] = useState(false);
  
  const handleComplete = async () => {
    setCompleting(true);
    try {
      await onComplete(task.id);
    } finally {
      setCompleting(false);
    }
  };
  
  return (
    <div className={`border rounded-lg p-4 ${completed ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`font-medium ${completed ? 'line-through text-green-700' : ''}`}>
            {task.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <span>⏱️ {task.estimated_minutes} min</span>
            <span className="ml-4">📅 Dia {task.day_number}</span>
          </div>
        </div>
        
        <div className="ml-4">
          {completed ? (
            <div className="text-green-600 font-medium flex items-center">
              ✅ Concluído
            </div>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={completing}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {completing ? 'Marcando...' : 'Marcar como feito'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de Badge
const BadgeCard = ({ badge }: { badge: any }) => (
  <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
    <span className="text-2xl mr-3">{badge.icon}</span>
    <div>
      <h4 className="font-medium text-yellow-800">{badge.badge_name}</h4>
      <p className="text-sm text-yellow-600">{badge.description}</p>
    </div>
  </div>
);

export default function PlanPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<TherapyPlan | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [weekTasks, setWeekTasks] = useState<TherapyTask[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Buscar dados iniciais
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        
        setUserId(user.id);
        
        // Buscar plano ativo
        const activePlan = await getUserActivePlan(user.id);
        if (!activePlan) {
          // Se não tem plano, redirecionar para chat para criar um
          router.push('/chat');
          return;
        }
        
        setPlan(activePlan);
        
        // Calcular semana atual baseada na data de início
        const startDate = new Date(activePlan.start_date);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const calculatedWeek = Math.min(Math.max(1, Math.ceil(daysDiff / 7)), 4);
        setCurrentWeek(calculatedWeek);
        
        // Buscar tarefas da semana atual
        const tasks = await getWeekTasks(activePlan.id, calculatedWeek);
        setWeekTasks(tasks);
        
        // Buscar badges
        const userBadges = await getUserBadges(user.id);
        setBadges(userBadges);
        
      } catch (error) {
        console.error('Erro ao carregar plano:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [supabase, router]);
  
  // Atualizar tarefas quando a semana mudar
  useEffect(() => {
    if (plan) {
      getWeekTasks(plan.id, currentWeek).then(setWeekTasks);
    }
  }, [plan, currentWeek]);
  
  // Função para completar tarefa
  const handleCompleteTask = async (taskId: string) => {
    if (!userId) return;
    
    try {
      await completeTask(taskId, userId);
      
      // Atualizar lista de tarefas
      if (plan) {
        const updatedTasks = await getWeekTasks(plan.id, currentWeek);
        setWeekTasks(updatedTasks);
        
        // Atualizar badges
        const updatedBadges = await getUserBadges(userId);
        setBadges(updatedBadges);
        
        // Recarregar plano para ver progresso atualizado
        const updatedPlan = await getUserActivePlan(userId);
        if (updatedPlan) setPlan(updatedPlan);
      }
    } catch (error) {
      console.error('Erro ao completar tarefa:', error);
      alert('Erro ao marcar tarefa como concluída');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Carregando seu plano terapêutico...</div>
      </div>
    );
  }
  
  if (!plan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Você ainda não tem um plano terapêutico</h2>
          <p className="text-gray-600 mb-6">
            Converse mais com a Lari para que ela possa criar um plano personalizado para você.
          </p>
          <Button onClick={() => router.push('/chat')}>
            Conversar com a Lari
          </Button>
        </div>
      </div>
    );
  }
  
  // Calcular estatísticas
  const completedTasks = weekTasks.filter(t => t.completed).length;
  const totalTasks = weekTasks.length;
  const weekProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header do Plano */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{plan.title}</h1>
        <p className="text-gray-600 mb-4">{plan.description}</p>
        
        {/* Progresso Geral */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Progresso Geral</h2>
            <span className="text-2xl font-bold text-primary">{plan.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300" 
              style={{ width: `${plan.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {plan.status === 'completed' ? 'Plano concluído! 🎉' : `Semana ${currentWeek} de 4`}
          </p>
        </div>
      </div>
      
      {/* Navegação de Semanas */}
      <div className="flex space-x-2 mb-6">
        {[1, 2, 3, 4].map(week => (
          <button
            key={week}
            onClick={() => setCurrentWeek(week)}
            className={`px-4 py-2 rounded-md font-medium ${
              currentWeek === week 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semana {week}
          </button>
        ))}
      </div>
      
      {/* Progresso da Semana */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-800 mb-2">Progresso da Semana {currentWeek}</h3>
        <div className="flex items-center">
          <div className="flex-1 bg-blue-200 rounded-full h-2 mr-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${weekProgress}%` }}
            ></div>
          </div>
          <span className="text-blue-800 font-medium">
            {completedTasks}/{totalTasks} tarefas
          </span>
        </div>
      </div>
      
      {/* Tarefas da Semana */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tarefas da Semana {currentWeek}</h2>
        
        {weekTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma tarefa encontrada para esta semana.
          </div>
        ) : (
          <div className="space-y-4">
            {weekTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                completed={task.completed}
                onComplete={handleCompleteTask}
              />
            ))}
          </div>
        )}
        
        {/* NOVA SEÇÃO: Chat Diário para Implementação */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">💬 Chat Diário com a Lari</h3>
          <p className="text-blue-700 mb-4">
            Use o chat para implementar suas tarefas diárias e receber suporte da Lari.
          </p>
          <Button 
            onClick={() => router.push('/chat')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Ir para o Chat Diário
          </Button>
        </div>
      </div>
      
      {/* Badges Conquistados */}
      {badges.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Badges Conquistados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map(badge => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}
      
      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => router.push('/chat')}
          variant="outline"
          className="flex-1"
        >
          Conversar com a Lari
        </Button>
        <Button 
          onClick={() => router.push('/dashboard')}
          className="flex-1"
        >
          Ver Dashboard
        </Button>
      </div>
    </div>
  );
} 