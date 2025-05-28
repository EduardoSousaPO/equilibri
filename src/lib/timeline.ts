import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TimelineItem } from '@/components/timeline/timeline';

// Função para buscar e processar os dados da linha do tempo
export async function fetchTimelineData(userId: string): Promise<TimelineItem[]> {
  const supabase = createClientComponentClient();
  const timelineItems: TimelineItem[] = [];
  
  try {
    // Buscar mensagens de chat recentes
    const { data: chatMessages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);  // Limitar para mensagens mais recentes
    
    // Transformar mensagens do assistente em itens da linha do tempo
    // Vamos selecionar apenas respostas da IA que são mais significativas
    if (chatMessages) {
      for (const msg of chatMessages) {
        if (msg.role === 'assistant') {
          // Verificar se a mensagem tem conteúdo significativo
          // Critérios: mensagens que contêm palavras-chave específicas ou são mais longas
          const isSignificant = 
            msg.content.length > 100 || 
            msg.content.includes('importante') ||
            msg.content.includes('observei') ||
            msg.content.includes('recomendo') ||
            msg.content.includes('percebo') ||
            msg.content.includes('sugiro');
          
          if (isSignificant) {
            // Criar um resumo limitado para exibição
            const summary = msg.content.length > 150 
              ? msg.content.substring(0, 150) + '...'
              : msg.content;
              
            timelineItems.push({
              id: msg.id,
              date: new Date(msg.created_at),
              type: 'chat',
              title: 'Interação com Lari',
              content: summary
            });
          }
        }
      }
    }
    
    // Buscar check-ins emocionais
    const { data: emotionCheckins } = await supabase
      .from('emotion_checkins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);
    
    if (emotionCheckins) {
      for (const checkin of emotionCheckins) {
        const emotionMap: Record<string, string> = {
          'happy': 'Feliz',
          'calm': 'Calmo',
          'sad': 'Triste',
          'anxious': 'Ansioso',
          'angry': 'Irritado',
          'neutral': 'Neutro'
        };
        
        const emotionName = emotionMap[checkin.emotion] || checkin.emotion;
        const content = checkin.note || `Você registrou que estava se sentindo ${emotionName.toLowerCase()}.`;
        
        timelineItems.push({
          id: checkin.id,
          date: new Date(checkin.created_at),
          type: 'emotion',
          title: `Sentindo-se ${emotionName}`,
          content: content,
          emotion: checkin.emotion,
          intensity: checkin.intensity
        });
      }
    }
    
    // Buscar metas terapêuticas, se disponíveis
    const { data: goals } = await supabase
      .from('therapy_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (goals) {
      for (const goal of goals) {
        timelineItems.push({
          id: goal.id,
          date: new Date(goal.created_at),
          type: 'goal',
          title: 'Nova Meta Terapêutica',
          content: goal.description
        });
      }
    }
    
    // Ordenar todos os itens por data, do mais recente para o mais antigo
    timelineItems.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return timelineItems;
    
  } catch (error) {
    console.error('Erro ao buscar dados da linha do tempo:', error);
    return [];
  }
}

// Função auxiliar para extrair insights de mensagens de chat
export function extractInsightsFromChat(messages: any[]): TimelineItem[] {
  const insights: TimelineItem[] = [];
  
  // Procurar padrões em sequências de mensagens
  for (let i = 0; i < messages.length - 1; i++) {
    const current = messages[i];
    const next = messages[i + 1];
    
    // Se uma mensagem do usuário menciona um problema e a assistente responde com solução
    if (
      current.role === 'user' && 
      next.role === 'assistant' &&
      (current.content.includes('problema') || current.content.includes('dificuldade')) &&
      (next.content.includes('solução') || next.content.includes('tente') || next.content.includes('sugiro'))
    ) {
      const content = `Problema: "${current.content.substring(0, 50)}..." | Solução: "${next.content.substring(0, 100)}..."`;
      
      insights.push({
        id: `insight-${current.id}`,
        date: new Date(next.created_at),
        type: 'insight',
        title: 'Insight Terapêutico',
        content: content
      });
    }
  }
  
  return insights;
} 