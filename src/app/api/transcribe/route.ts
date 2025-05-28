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
    console.log('🎙️ [TRANSCRIBE] Iniciando processamento de áudio...');
    
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Variáveis de ambiente Supabase não configuradas');
      return NextResponse.json({ error: 'Configuração do servidor incorreta' }, { status: 500 });
    }
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY não configurada');
      return NextResponse.json({ error: 'Serviço de transcrição indisponível' }, { status: 503 });
    }
    
    // Criar cliente Supabase usando a configuração padrão
    const supabase = await createServerSupabaseClient();
    
    // Verificar autenticação
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('🔐 [TRANSCRIBE] Verificação de autenticação:', { 
      hasSession: !!session, 
      sessionError: sessionError?.message,
      userId: session?.user?.id 
    });
    
    if (sessionError) {
      console.error('❌ [TRANSCRIBE] Erro ao verificar sessão:', sessionError);
      return NextResponse.json({ 
        error: 'Erro de autenticação. Tente fazer login novamente.' 
      }, { status: 401 });
    }
    
    if (!session || !session.user) {
      console.error('❌ [TRANSCRIBE] Usuário não autenticado');
      return NextResponse.json({ 
        error: 'Acesso negado. Você precisa estar logado para usar a transcrição de áudio.' 
      }, { status: 401 });
    }
    
    const userId = session.user.id;
    console.log('✅ [TRANSCRIBE] Usuário autenticado:', userId);
    
    // Verificar o plano do usuário
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('❌ [TRANSCRIBE] Erro ao verificar perfil:', profileError);
      return NextResponse.json({ 
        error: 'Perfil de usuário não encontrado. Verifique se sua conta está configurada corretamente.' 
      }, { status: 404 });
    }
    
    const userPlan = profileData.plan || 'free';
    // Como não existe coluna de status no banco, usamos sempre 'active'
    const subscriptionStatus = 'active';
    const monthlyLimit = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
    
    console.log('📋 [TRANSCRIBE] Plano do usuário:', { 
      userPlan, 
      subscriptionStatus, 
      monthlyLimit 
    });
    
    // Verificar se a assinatura está ativa (apenas para planos pagos)
    // Esta verificação é redundante já que não temos mais coluna de status
    // Mantemos comentado para referência futura
    /*
    if (userPlan !== 'free' && subscriptionStatus !== 'active') {
      return NextResponse.json({ 
        error: `Sua assinatura ${userPlan} está ${subscriptionStatus}. Reative sua assinatura para continuar usando a transcrição.` 
      }, { status: 403 });
    }
    */
    
    // Verificar uso atual de transcrições
    const currentMonth = getCurrentMonth();
    const { data: usageData, error: usageError } = await supabase
      .from('resource_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('resource_type', 'transcription')
      .eq('month', currentMonth)
      .single();
    
    const currentUsage = usageData?.count || 0;
    
    console.log('📊 [TRANSCRIBE] Uso atual:', { 
      currentUsage, 
      monthlyLimit, 
      currentMonth,
      usageError: usageError?.message 
    });
    
    // Verificar se o usuário atingiu o limite
    if (currentUsage >= monthlyLimit) {
      const upgradeMessage = userPlan === 'free' 
        ? ' Faça upgrade para o plano Premium para mais transcrições.'
        : ' Entre em contato com o suporte se precisar de mais transcrições.';
        
      return NextResponse.json({ 
        error: `Você atingiu o limite mensal de ${monthlyLimit} transcrições do seu plano ${userPlan}.${upgradeMessage}`,
        usage: {
          current: currentUsage,
          limit: monthlyLimit,
          plan: userPlan
        }
      }, { status: 403 });
    }
    
    // Extrair o arquivo de áudio do FormData
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'Nenhum arquivo de áudio fornecido' }, { status: 400 });
    }
    
    console.log('📁 [TRANSCRIBE] Arquivo recebido:', { 
      name: audioFile.name, 
      size: audioFile.size, 
      type: audioFile.type 
    });
    
    // Verificar tamanho do arquivo
    if (audioFile.size === 0) {
      return NextResponse.json({ error: 'Arquivo de áudio vazio' }, { status: 400 });
    }
    
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 25MB.' }, { status: 400 });
    }
    
    // Converter o arquivo para formato compatível com Supabase e OpenAI
    const buffer = await audioFile.arrayBuffer();
    const fileName = `audio_${Date.now()}.${audioFile.name.split('.').pop() || 'webm'}`;
    
    // Salvar o áudio no Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('audiouploads')
      .upload(`${userId}/${fileName}`, buffer, {
        contentType: audioFile.type || 'audio/webm',
        cacheControl: '3600',
      });
    
    if (storageError) {
      console.error('❌ [TRANSCRIBE] Erro ao salvar áudio no Storage:', storageError);
      return NextResponse.json({ error: 'Erro ao salvar o áudio no servidor' }, { status: 500 });
    }
    
    console.log('✅ [TRANSCRIBE] Áudio salvo no storage:', storageData?.path);
    
    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabase
      .storage
      .from('audiouploads')
      .getPublicUrl(`${userId}/${fileName}`);
    
    // Transcrever usando OpenAI Whisper
    try {
      console.log('🤖 [TRANSCRIBE] Iniciando transcrição com OpenAI...');
      
      // Usar API de transcrição do OpenAI
      const transcription = await openai.audio.transcriptions.create({
        file: new File([new Uint8Array(buffer)], fileName, { 
          type: audioFile.type || 'audio/webm' 
        }),
        model: 'whisper-1',
        language: 'pt',
      });
      
      console.log('✅ [TRANSCRIBE] Transcrição realizada:', transcription.text);
      
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
        console.error('❌ [TRANSCRIBE] Erro ao salvar transcrição no banco:', dbError);
      }
      
      // Atualizar contagem de uso de recursos
      if (usageData) {
        // Atualizar registro existente
        await supabase
          .from('resource_usage')
          .update({ 
            count: currentUsage + 1,
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
            count: 1
          });
      }
      
      console.log('✅ [TRANSCRIBE] Processamento completo');
      
      // Retornar a transcrição com informações de uso
      return NextResponse.json({ 
        transcript: transcription.text,
        usage: {
          current: currentUsage + 1,
          limit: monthlyLimit,
          plan: userPlan,
          remaining: monthlyLimit - (currentUsage + 1)
        }
      });
      
    } catch (error: any) {
      console.error('❌ [TRANSCRIBE] Erro na transcrição com OpenAI:', error);
      
      // Retornar erro específico baseado no tipo
      if (error.message?.includes('Invalid file format')) {
        return NextResponse.json({ 
          error: 'Formato de arquivo não suportado. Use MP3, MP4, MPEG, MPGA, M4A, WAV ou WEBM.' 
        }, { status: 400 });
      }
      
      if (error.message?.includes('File size')) {
        return NextResponse.json({ 
          error: 'Arquivo muito grande para transcrição.' 
        }, { status: 400 });
      }
      
      if (error.message?.includes('quota')) {
        return NextResponse.json({ 
          error: 'Serviço de transcrição temporariamente indisponível. Tente novamente em alguns minutos.' 
        }, { status: 503 });
      }
      
      return NextResponse.json({ 
        error: 'Erro no serviço de transcrição. Tente novamente.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('❌ [TRANSCRIBE] Erro geral ao processar áudio:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}
