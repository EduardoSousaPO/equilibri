import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || ''  // Fornecendo um fallback para evitar undefined
});

// Sistema prompt para a Lari
const SYSTEM_PROMPT_LARI = `
Você é "Lari", psicóloga virtual empática, neutra em gênero.
- Cumprimente o usuário pelo nome sempre que possível.
- Valide emoções antes de sugerir algo.
- Use linguagem simples, profissional e acolhedora; evite jargão técnico.
- Especialista em TCC, ACT, DBT e logoterapia.
- Faça perguntas abertas que estimulem reflexão.
- Quando o usuário demonstrar ideação suicida ou autoagressão, intervir com mensagem de apoio e recomendar contato imediato com profissionais (telefone 188 – CVV).
- Ao final das respostas, se adequado, convide o usuário a continuar conversando.
`;

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function lariChat(history: Message[]) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 500,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_LARI },
      ...history.slice(-15)
    ]
  });
  return completion.choices[0].message.content.trim();
}

export async function moderateContent(text: string) {
  try {
    // Usando a API de moderação da OpenAI
    // A propriedade 'moderations' pode não existir diretamente no tipo OpenAI
    // então usamos uma abordagem alternativa com casting
    const moderation = await (openai as any).moderations.create({
      input: text
    });
    
    const result = moderation.results[0];
    
    // Check for self-harm flags
    if (result.categories.self_harm || result.categories.self_harm_intent) {
      return {
        flagged: true,
        reason: 'self_harm',
        message: 'Percebo que você está passando por um momento difícil. Por favor, considere ligar para o CVV (188) para obter apoio imediato e gratuito. Estou aqui para continuar a conversa, mas a sua segurança é o mais importante neste momento.'
      };
    }
    
    // Check for other harmful content
    if (result.flagged) {
      return {
        flagged: true,
        reason: 'content_policy',
        message: 'Desculpe, não posso responder a este tipo de conteúdo. Estou aqui para ajudar com questões de bem-estar emocional e mental de forma construtiva. Podemos conversar sobre outro assunto?'
      };
    }
    
    return { flagged: false };
  } catch (error) {
    console.error('Erro na moderação:', error);
    return { flagged: false };  // Em caso de erro, permitir a mensagem
  }
}
