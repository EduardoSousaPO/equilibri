import OpenAI from 'openai';
import { MessageRole } from '@/types/database';

// Inicializar o cliente OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-typescript'
    });

// Modelo utilizado
const MODEL = 'gpt-4o-mini';

interface Message {
  role: MessageRole;
  content: string;
}

/**
 * Enviar mensagem para o chat e obter resposta
 */
export async function getChatCompletion(messages: Message[], temperature = 0.7) {
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature,
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error getting chat completion:', error);
    return 'Desculpe, não consegui processar sua mensagem. Por favor, tente novamente em alguns momentos.';
  }
}

/**
 * Gerar relatório semanal com base nos check-ins emocionais
 */
export async function generateWeeklyReport(
  journalEntries: any[] = [],
  audioEntries: any[] = [], 
  emotionCheckins: any[] = []
) {
  try {
    // Inicializar o objeto de relatório
    const report = {
      summary: '',
      insights: [],
      recommendedActions: [],
      emotionalTrends: {},
      emotionalPatterns: []
    };

    // Agregar emoções por dia para análise de tendências
    const emotionsByDay: { [key: string]: { [emotion: string]: number } } = {};
    
    emotionCheckins.forEach(checkin => {
      const date = new Date(checkin.created_at).toISOString().split('T')[0];
      if (!emotionsByDay[date]) {
        emotionsByDay[date] = {};
      }
      
      const emotion = checkin.emotion;
      emotionsByDay[date][emotion] = (emotionsByDay[date][emotion] || 0) + 1;
    });
    
    // Agregar dados do diário para enriquecer a análise
    const journalDataByDay: { [key: string]: string[] } = {};
    journalEntries.forEach(entry => {
      const date = new Date(entry.created_at).toISOString().split('T')[0];
      if (!journalDataByDay[date]) {
        journalDataByDay[date] = [];
      }
      
      if (entry.content) {
        journalDataByDay[date].push(entry.content);
      }
    });
    
    // Preparar o prompt para a API
    const prompt = `
    Você é um assistente terapêutico especializado em análise de dados emocionais.
    Por favor, analise os seguintes dados do usuário nos últimos 7 dias e gere um relatório semanal informativo e útil.
    
    Dados de check-ins emocionais organizados por dia:
    ${JSON.stringify(emotionsByDay, null, 2)}
    
    Entradas de diário por dia:
    ${JSON.stringify(journalDataByDay, null, 2)}
    
    Por favor, forneça:
    - Um resumo conciso do estado emocional geral da semana
    - Insights significativos sobre padrões emocionais
    - Ações recomendadas ou técnicas terapêuticas específicas com base nas emoções predominantes
    - Tendências emocionais identificadas (melhora, piora ou estabilidade)
    
    Use tom empático, validando as experiências emocionais do usuário.`;
    
    // Chamar a API de completions
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'Você é um assistente terapêutico especializado em analisar dados emocionais e fornecer insights úteis.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    // Extrair a resposta
    const content = response.choices[0].message.content || '';
    
    // Formatar a resposta e atualizar o objeto de relatório
    report.summary = content;
    report.emotionalPatterns = [];
    report.recommendedActions = [];
    
    return report;
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return {
      summary: 'Não foi possível gerar o relatório. Por favor, tente novamente mais tarde.',
      insights: [],
      recommendedActions: [],
      emotionalTrends: {},
      emotionalPatterns: []
    };
  }
}
