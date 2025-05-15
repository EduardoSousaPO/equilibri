import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-queries';
import OpenAI from 'openai';

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Limites de transcrições por plano (mensal)
const PLAN_LIMITS = {
  free: 10,
  basic: 30,
  premium: 100,
  clinical: 200,
};

// Função para obter o mês atual no formato YYYY-MM
function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Verificar o plano do usuário
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Erro ao verificar perfil:', profileError);
      return NextResponse.json({ error: 'Não foi possível verificar seu plano' }, { status: 500 });
    }
    
    const userPlan = profileData.plan || 'free';
    const monthlyLimit = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
    
    // Verificar uso atual de transcrições
    const currentMonth = getCurrentMonth();
    const { data: usageData, error: usageError } = await supabase
      .from('resource_usage')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('resource_type', 'transcription')
      .eq('month', currentMonth)
      .single();
    
    // Se não houver registro de uso, criamos um novo
    const currentUsage = usageData?.usage_count || 0;
    
    // Verificar se o usuário atingiu o limite
    if (currentUsage >= monthlyLimit) {
      return NextResponse.json({ 
        error: `Você atingiu o limite mensal de ${monthlyLimit} transcrições do seu plano ${userPlan}. Faça upgrade para continuar.` 
      }, { status: 403 });
    }
    
    // Extrair o arquivo de áudio do FormData
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'Nenhum arquivo de áudio fornecido' }, { status: 400 });
    }
    
    // Converter o arquivo para formato compatível com Supabase e OpenAI
    const buffer = await audioFile.arrayBuffer();
    const fileName = `audio_${Date.now()}.wav`;
    
    // Salvar o áudio no Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('audiouploads')
      .upload(`${userId}/${fileName}`, buffer, {
        contentType: 'audio/wav',
        cacheControl: '3600',
      });
    
    if (storageError) {
      console.error('Erro ao salvar áudio no Storage:', storageError);
      return NextResponse.json({ error: 'Erro ao salvar o áudio' }, { status: 500 });
    }
    
    // Obter URL pública do arquivo para transcrição
    const { data: { publicUrl } } = supabase
      .storage
      .from('audiouploads')
      .getPublicUrl(`${userId}/${fileName}`);
    
    // Transcrever usando OpenAI Whisper
    try {
      // Usar API de transcrição do OpenAI
      const transcription = await openai.audio.transcriptions.create({
        file: new File([new Uint8Array(buffer)], fileName, { type: 'audio/wav' }),
        model: 'whisper-1',
        language: 'pt',
      });
      
      // Criar registro no banco de dados
      const { error: dbError } = await supabase
        .from('audio_entries')
        .insert({
          user_id: userId,
          audio_url: publicUrl,
          transcription: transcription.text,
          duration: 0, // Seria calculado com base no arquivo real
        });
      
      if (dbError) {
        console.error('Erro ao salvar transcrição no banco:', dbError);
      }
      
      // Atualizar contagem de uso de recursos
      if (usageData) {
        // Atualizar registro existente
        await supabase
          .from('resource_usage')
          .update({ 
            usage_count: currentUsage + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('resource_type', 'transcription')
          .eq('month', currentMonth);
      } else {
        // Criar novo registro de uso
        await supabase
          .from('resource_usage')
          .insert({
            user_id: userId,
            resource_type: 'transcription',
            month: currentMonth,
            usage_count: 1
          });
      }
      
      // Retornar a transcrição
      return NextResponse.json({ 
        transcript: transcription.text,
        usage: {
          current: currentUsage + 1,
          limit: monthlyLimit,
          plan: userPlan
        }
      });
    } catch (error) {
      console.error('Erro na transcrição com OpenAI:', error);
      
      // Fallback para sistema de backup em caso de falha do OpenAI
      // Usando API alternativa ou implementação local (aqui apenas retornamos um erro)
      return NextResponse.json({ 
        transcript: "Não foi possível transcrever o áudio. Por favor, tente novamente ou envie sua mensagem como texto.", 
        error: true 
      });
    }
    
  } catch (error) {
    console.error('Erro ao processar áudio:', error);
    return NextResponse.json({ error: 'Erro ao processar áudio' }, { status: 500 });
  }
} 