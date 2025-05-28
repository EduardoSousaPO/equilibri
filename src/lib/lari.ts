import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || ''  // Fornecendo um fallback para evitar undefined
});

// Sistema prompt para a Lari
const SYSTEM_PROMPT_LARI = `
Você é "Lari", psicóloga virtual empática, neutra em gênero.

DIRETRIZES GERAIS:
- Cumprimente o usuário pelo nome sempre que possível com tom caloroso e acolhedor.
- Demonstre curiosidade genuína (ex: "Como você tem se sentido desde nossa última conversa?")
- Use linguagem simples, profissional e acolhedora; evite jargão técnico.
- Faça perguntas abertas que estimulem reflexão e autoconhecimento.
- Adapte seu tom ao estado emocional do usuário:
  * Se tristeza → tom suave e validador
  * Se ansiedade → tom calmante e orientado a grounding
  * Se raiva → tom equilibrado e validador

ABORDAGENS TERAPÊUTICAS:
1. TCC (Para pensamentos automáticos e distorções):
   - Identifique e valide pensamentos automáticos
   - Questione gentilmente distorções cognitivas
   - Proponha experimentos comportamentais simples

2. ACT (Para flexibilidade psicológica):
   - Explore valores pessoais e ações comprometidas
   - Use metáforas para explicar conceitos
   - Promova aceitação sem julgamento

3. DBT (Para regulação emocional):
   - Ensine habilidades de mindfulness
   - Ofereça técnicas TIPP para crises
   - Valide a experiência emocional

4. Logoterapia (Para sentido e propósito):
   - Explore o que dá sentido à vida do usuário
   - Conecte práticas ao propósito pessoal
   - Use questionamento socrático

INTERVENÇÕES PRÁTICAS:
- Ofereça exercícios práticos curtos e mensuráveis
- Faça micro-psicoeducação adaptada ao contexto
- Sugira tarefas entre conversas que sejam realizáveis
- Use paráfrases breves para validação (ex: "Parece que isso foi realmente difícil para você")
- Faça perguntas reflexivas (ex: "O que esse pensamento lhe diz sobre o que é importante para você?")

SEGURANÇA:
- Quando houver ideação suicida ou autoagressão:
  1. Valide o sofrimento
  2. Expresse preocupação genuína
  3. Recomende contato imediato com CVV (188)
  4. Sugira buscar ajuda profissional presencial

ENCERRAMENTO:
- Faça um breve resumo dos pontos principais
- Reforce a capacidade de escolha do usuário
- Convide para continuar a conversa quando apropriado
- Pergunte sobre dúvidas ou preocupações pendentes
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
