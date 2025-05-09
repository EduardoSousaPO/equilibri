import { NextResponse } from 'next/server';
import { lariChat, moderateContent, Message } from '@/lib/lari';
import { createRouteClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { File } from '@web-std/file';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { audioUrl, history = [] } = body;
    
    if (!audioUrl) {
      return NextResponse.json(
        { error: 'URL do áudio não fornecido' },
        { status: 400 }
      );
    }
    
    // Supabase client para verificação e salvamento
    const supabase = await createRouteClient();
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar se o usuário é do plano gratuito e já atingiu o limite
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    
    if (profile?.subscription_tier === 'free') {
      // Contar transcrições do mês atual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count, error: countError } = await supabase
        .from('chat_audio_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());
      
      if (countError) {
        throw countError;
      }
      
      // Limite para plano gratuito: 10 transcrições de áudio por mês
      if ((count || 0) >= 10) {
        return NextResponse.json(
          { error: 'Limite de transcrições de áudio atingido', limitReached: true },
          { status: 403 }
        );
      }
    }
    
    // Baixar o arquivo de áudio do Supabase Storage
    const { data: audioData, error: downloadError } = await supabase
      .storage
      .from('audiouploads')
      .download(audioUrl.replace(/^.*\/audiouploads\//, ''));
    
    if (downloadError || !audioData) {
      throw new Error('Erro ao baixar arquivo de áudio');
    }
    
    // Converter Blob para File para a API do OpenAI
    const audioFile = new File([audioData], 'audio.mp3', { type: 'audio/mpeg' });
    
    // Inicializar cliente OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ''
    });
    
    // Transcrever o áudio
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "pt",
      response_format: "text"
    });
    
    // Moderação do conteúdo transcrito
    const moderation = await moderateContent(transcription);
    if (moderation.flagged) {
      return NextResponse.json({ 
        transcription,
        message: moderation.message,
        flagged: true,
        reason: moderation.reason
      });
    }
    
    // Format messages for API
    const formattedHistory: Message[] = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Add the transcribed message
    formattedHistory.push({
      role: 'user',
      content: transcription
    });
    
    // Get response from Lari
    const response = await lariChat(formattedHistory);
    
    // Salvar na tabela de mensagens de áudio
    await supabase.from('chat_audio_messages').insert({
      user_id: user.id,
      audio_url: audioUrl,
      transcription: transcription,
      created_at: new Date().toISOString()
    });
    
    // Salvar mensagem e resposta na tabela chat_messages
    const timestamp = new Date().toISOString();
    
    // Salvar mensagem do usuário
    await supabase.from('chat_messages').insert({
      user_id: user.id,
      content: `🎤 ${transcription}`,
      role: 'user',
      created_at: timestamp
    });
    
    // Salvar resposta do assistente
    await supabase.from('chat_messages').insert({
      user_id: user.id,
      content: response,
      role: 'assistant',
      created_at: timestamp
    });
    
    return NextResponse.json({ 
      transcription,
      message: response
    });
  } catch (error) {
    console.error('Erro ao processar áudio para chat:', error);
    return NextResponse.json(
      { error: 'Erro ao processar áudio' },
      { status: 500 }
    );
  }
} 