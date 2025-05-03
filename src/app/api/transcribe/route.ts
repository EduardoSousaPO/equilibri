import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import { transcribeAndAnalyzeAudio } from '@/lib/openai';
import OpenAI from 'openai';
import { File } from '@web-std/file';

export async function POST(request: NextRequest) {
  try {
    // Obter cliente Supabase
    const supabase = await createRouteClient();
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Obter dados da requisição
    const { audioUrl } = await request.json();
    
    if (!audioUrl) {
      return NextResponse.json(
        { error: 'URL do áudio não fornecido' },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário é do plano gratuito e já atingiu o limite
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    
    if (profile?.subscription_tier === 'free') {
      // Contar entradas de áudio do mês atual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count, error: countError } = await supabase
        .from('audio_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());
      
      if (countError) {
        throw countError;
      }
      
      // Limite para plano gratuito: 2 entradas de áudio por mês
      if ((count || 0) >= 2) {
        return NextResponse.json(
          { error: 'Limite de entradas de áudio atingido', limitReached: true },
          { status: 403 }
        );
      }
    }
    
    // Baixar o arquivo de áudio do Supabase Storage
    const { data: audioData, error: downloadError } = await supabase
      .storage
      .from('audio')
      .download(audioUrl.replace('audio/', ''));
    
    if (downloadError || !audioData) {
      throw new Error('Erro ao baixar arquivo de áudio');
    }
    
    // Converter Blob para File para a API do OpenAI
    const audioFile = new File([audioData], 'audio.mp3', { type: 'audio/mpeg' });
    
    // Inicializar cliente OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Transcrever o áudio
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "pt",
      response_format: "text"
    });
    
    // Analisar a transcrição
    const analysis = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um assistente terapêutico especializado em análise de diários emocionais.
          
          Sua tarefa é analisar o texto transcrito do áudio do usuário e fornecer:
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
          content: transcription
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const analysisData = JSON.parse(analysis.choices[0].message.content || '{}');
    
    return NextResponse.json({ 
      transcription,
      analysis: analysisData
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { error: 'Erro ao transcrever áudio' },
      { status: 500 }
    );
  }
}
