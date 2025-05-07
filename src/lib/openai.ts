import OpenAI from 'openai';

// Inicializar cliente OpenAI com verificação de ambiente
let openai: OpenAI;

// Função para garantir que o cliente só seja inicializado em ambiente de execução
const getOpenAIClient = () => {
  if (!openai) {
    // Verificar se a chave da API está disponível
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OPENAI_API_KEY não encontrada no ambiente');
    }

    openai = new OpenAI({
      apiKey: apiKey || 'dummy-key-for-build'
    });
  }
  return openai;
};

// Função para analisar texto de diário
export async function analyzeJournalEntry(content: string) {
  try {
    const client = getOpenAIClient();
    if (!process.env.OPENAI_API_KEY) {
      return {
        error: "API key não configurada",
        emotions: [],
        primaryEmotion: "",
        emotionIntensity: 0,
        cognitiveDistortions: [],
        patterns: [],
        techniques: [],
        perspective: "",
        summary: "Não foi possível analisar o conteúdo devido à falta de configuração da API"
      };
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um assistente terapêutico especializado em análise de diários emocionais.
          
          Sua tarefa é analisar o texto do diário do usuário e fornecer:
          1. Uma análise das emoções expressas (identificar emoções principais e secundárias)
          2. Identificar possíveis distorções cognitivas ou padrões de pensamento
          3. Sugerir técnicas terapêuticas específicas que possam ajudar
          4. Oferecer uma perspectiva alternativa construtiva
          
          Formate sua resposta como um objeto JSON com os seguintes campos:
          - emotions: array de strings com as emoções identificadas
          - primaryEmotion: string com a emoção predominante
          - emotionIntensity: número de 1 a 10 representando a intensidade emocional
          - cognitiveDistortions: array de objetos, cada um com "name" e "explanation"
          - patterns: array de strings com padrões de pensamento identificados
          - techniques: array de strings com técnicas terapêuticas recomendadas
          - perspective: string com uma perspectiva alternativa construtiva
          - summary: string com um resumo breve da análise
          
          Baseie sua análise em abordagens terapêuticas validadas como TCC (Terapia Cognitivo-Comportamental), 
          ACT (Terapia de Aceitação e Compromisso) e DBT (Terapia Comportamental Dialética).
          
          Importante: Sua análise deve ser empática, não julgadora, e focada em ajudar o usuário a 
          desenvolver maior autoconsciência e estratégias de enfrentamento saudáveis.`
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error analyzing journal entry:', error);
    return {
      error: "Falha ao analisar entrada de diário",
      emotions: [],
      primaryEmotion: "",
      emotionIntensity: 0,
      cognitiveDistortions: [],
      patterns: [],
      techniques: [],
      perspective: "",
      summary: "Ocorreu um erro ao analisar o conteúdo"
    };
  }
}

// Função para transcrever e analisar áudio
export async function transcribeAndAnalyzeAudio(audioBlob: Blob) {
  try {
    const client = getOpenAIClient();
    if (!process.env.OPENAI_API_KEY) {
      return {
        error: "API key não configurada",
        transcription: "",
        analysis: {
          emotions: [],
          primaryEmotion: "",
          emotionIntensity: 0,
          cognitiveDistortions: [],
          patterns: [],
          techniques: [],
          perspective: "",
          summary: "Não foi possível analisar o conteúdo devido à falta de configuração da API"
        }
      };
    }

    // Converter Blob para File (que tem as propriedades lastModified e name necessárias)
    const audioFile = new File([audioBlob], 'audio.mp3', { 
      type: audioBlob.type || 'audio/mp3', 
      lastModified: Date.now() 
    });
    
    // Transcrever o áudio
    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "pt",
      response_format: "text"
    });
    
    // Analisar a transcrição
    const analysis = await analyzeJournalEntry(transcription);
    
    return {
      transcription,
      analysis
    };
  } catch (error) {
    console.error('Error transcribing and analyzing audio:', error);
    return {
      error: "Falha ao transcrever e analisar áudio",
      transcription: "",
      analysis: {
        emotions: [],
        primaryEmotion: "",
        emotionIntensity: 0,
        cognitiveDistortions: [],
        patterns: [],
        techniques: [],
        perspective: "",
        summary: "Ocorreu um erro ao processar o áudio"
      }
    };
  }
}

// Função para gerar relatório semanal
export async function generateWeeklyReport(journalEntries: any[], audioEntries: any[], emotionCheckins: any[]) {
  try {
    const client = getOpenAIClient();
    if (!process.env.OPENAI_API_KEY) {
      return {
        error: "API key não configurada",
        emotionalPatterns: [],
        commonTriggers: [],
        progress: "",
        challenges: [],
        recommendations: [],
        techniques: [],
        summary: "Não foi possível gerar o relatório devido à falta de configuração da API"
      };
    }

    // Preparar dados para o prompt
    const journalSummaries = journalEntries.map(entry => {
      return `Data: ${new Date(entry.created_at).toLocaleDateString('pt-BR')}
Título: ${entry.title || 'Sem título'}
Humor: ${entry.mood_score}/10
Conteúdo: ${entry.content.substring(0, 200)}...`;
    }).join('\n\n');
    
    const audioSummaries = audioEntries.map(entry => {
      return `Data: ${new Date(entry.created_at).toLocaleDateString('pt-BR')}
Título: ${entry.title || 'Sem título'}
Humor: ${entry.mood_score}/10
Transcrição: ${entry.transcription ? entry.transcription.substring(0, 200) + '...' : 'Sem transcrição'}`;
    }).join('\n\n');
    
    const emotionSummary = emotionCheckins.map(checkin => {
      return `Data: ${new Date(checkin.created_at).toLocaleDateString('pt-BR')}
Emoção: ${checkin.emotion}
Intensidade: ${checkin.intensity}/5
Nota: ${checkin.note || 'Sem nota'}`;
    }).join('\n\n');
    
    // Contar emoções
    const emotionCounts: Record<string, number> = {};
    emotionCheckins.forEach(checkin => {
      emotionCounts[checkin.emotion] = (emotionCounts[checkin.emotion] || 0) + 1;
    });
    
    // Calcular média de humor
    let totalMoodScore = 0;
    let moodEntries = 0;
    
    journalEntries.forEach(entry => {
      if (entry.mood_score) {
        totalMoodScore += entry.mood_score;
        moodEntries++;
      }
    });
    
    audioEntries.forEach(entry => {
      if (entry.mood_score) {
        totalMoodScore += entry.mood_score;
        moodEntries++;
      }
    });
    
    const averageMood = moodEntries > 0 ? totalMoodScore / moodEntries : null;
    
    // Gerar relatório com OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um assistente terapêutico especializado em análise de dados emocionais.
          
          Sua tarefa é analisar os dados do diário, áudio e check-ins emocionais do usuário da última semana e gerar um relatório semanal.
          
          O relatório deve incluir:
          1. Uma análise dos padrões emocionais observados
          2. Identificação de gatilhos comuns
          3. Progresso observado (se houver)
          4. Recomendações personalizadas
          5. Sugestões de técnicas terapêuticas específicas
          
          Formate sua resposta como um objeto JSON com os seguintes campos:
          - emotionalPatterns: array de strings descrevendo padrões emocionais identificados
          - commonTriggers: array de strings com gatilhos comuns identificados
          - progress: string descrevendo o progresso observado
          - challenges: array de strings com desafios identificados
          - recommendations: array de strings com recomendações personalizadas
          - techniques: array de strings com técnicas terapêuticas recomendadas
          - summary: string com um resumo geral do relatório
          
          Baseie sua análise em abordagens terapêuticas validadas como TCC (Terapia Cognitivo-Comportamental), 
          ACT (Terapia de Aceitação e Compromisso) e DBT (Terapia Comportamental Dialética).
          
          Importante: Sua análise deve ser empática, não julgadora, e focada em ajudar o usuário a 
          desenvolver maior autoconsciência e estratégias de enfrentamento saudáveis.`
        },
        {
          role: "user",
          content: `Por favor, gere um relatório semanal com base nos seguintes dados:
          
          Média de humor: ${averageMood ? averageMood.toFixed(1) : 'Não disponível'}/10
          
          Contagem de emoções:
          ${Object.entries(emotionCounts).map(([emotion, count]) => `${emotion}: ${count}`).join('\n')}
          
          Entradas de diário:
          ${journalSummaries || 'Nenhuma entrada de diário esta semana.'}
          
          Entradas de áudio:
          ${audioSummaries || 'Nenhuma entrada de áudio esta semana.'}
          
          Check-ins emocionais:
          ${emotionSummary || 'Nenhum check-in emocional esta semana.'}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return {
      error: "Falha ao gerar relatório semanal",
      emotionalPatterns: [],
      commonTriggers: [],
      progress: "",
      challenges: [],
      recommendations: [],
      techniques: [],
      summary: "Ocorreu um erro ao gerar o relatório"
    };
  }
}

// Função para recomendar técnicas terapêuticas
export async function recommendTherapyTechniques(userHistory: any) {
  try {
    const client = getOpenAIClient();
    if (!process.env.OPENAI_API_KEY) {
      return {
        error: "API key não configurada",
        recommendedTechniques: [],
        priorityOrder: [],
        explanation: "Não foi possível recomendar técnicas devido à falta de configuração da API"
      };
    }

    // Extrair informações relevantes do histórico do usuário
    const recentEmotions = userHistory.recentEmotions || [];
    const recentPatterns = userHistory.recentPatterns || [];
    const previousTechniques = userHistory.previousTechniques || [];
    
    // Gerar recomendações com OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um assistente terapêutico especializado em recomendar técnicas terapêuticas.
          
          Sua tarefa é recomendar técnicas terapêuticas específicas com base no histórico emocional e padrões de pensamento do usuário.
          
          Formate sua resposta como um objeto JSON com os seguintes campos:
          - recommendedTechniques: array de objetos, cada um com "name", "description", "instructions" (array), "benefits" (array) e "relevance" (string explicando por que esta técnica é relevante para o usuário)
          - priorityOrder: array de strings com os nomes das técnicas em ordem de prioridade
          - explanation: string explicando a lógica por trás das recomendações
          
          Baseie suas recomendações em abordagens terapêuticas validadas como TCC (Terapia Cognitivo-Comportamental), 
          ACT (Terapia de Aceitação e Compromisso) e DBT (Terapia Comportamental Dialética).
          
          Importante: Suas recomendações devem ser específicas, práticas e focadas em ajudar o usuário a 
          desenvolver estratégias de enfrentamento saudáveis.`
        },
        {
          role: "user",
          content: `Por favor, recomende técnicas terapêuticas com base nos seguintes dados:
          
          Emoções recentes:
          ${recentEmotions.map((e: any) => `${e.emotion}: ${e.count} ocorrências`).join('\n') || 'Nenhuma emoção registrada.'}
          
          Padrões de pensamento recentes:
          ${recentPatterns.join('\n') || 'Nenhum padrão identificado.'}
          
          Técnicas utilizadas anteriormente:
          ${previousTechniques.map((t: any) => `${t.name}: utilizada ${t.timesUsed} vezes, eficácia: ${t.effectiveness || 'não avaliada'}`).join('\n') || 'Nenhuma técnica utilizada anteriormente.'}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error recommending therapy techniques:', error);
    return {
      error: "Falha ao recomendar técnicas terapêuticas",
      recommendedTechniques: [],
      priorityOrder: [],
      explanation: "Ocorreu um erro ao processar as recomendações"
    };
  }
}
