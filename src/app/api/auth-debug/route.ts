import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-queries';

export async function GET(request: Request) {
  try {
    console.log("🔍 [AUTH-DEBUG] Iniciando diagnóstico de autenticação");
    
    // Criar cliente Supabase
    const supabase = await createServerSupabaseClient();
    
    // Verificar sessão atual
    console.log("🔍 [AUTH-DEBUG] Verificando sessão existente");
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ [AUTH-DEBUG] Erro ao verificar sessão:', sessionError);
      return NextResponse.json({ error: sessionError.message, stage: 'session_check' }, { status: 500 });
    }

    if (!session) {
      console.log('❌ [AUTH-DEBUG] Nenhuma sessão encontrada');
      return NextResponse.json({ 
        error: 'Nenhuma sessão encontrada', 
        stage: 'session_check',
        authenticated: false
      }, { status: 401 });
    }

    console.log("✅ [AUTH-DEBUG] Sessão encontrada para:", session.user.email);
    
    // Testar acesso a perfil
    console.log("🔍 [AUTH-DEBUG] Testando acesso à tabela profiles");
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    const profileAccess = !profileError;
    
    // Testar acesso a outras tabelas importantes
    console.log("🔍 [AUTH-DEBUG] Testando acesso a outras tabelas");
    
    // Chat messages
    const { error: chatError } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('user_id', session.user.id)
      .limit(1);
    
    const chatAccess = !chatError;
    
    // Resource usage
    const { error: resourceError } = await supabase
      .from('resource_usage')
      .select('id')
      .eq('user_id', session.user.id)
      .limit(1);
    
    const resourceAccess = !resourceError;
    
    // Verificar RPC
    console.log("🔍 [AUTH-DEBUG] Testando acesso a funções RPC");
    const { error: rpcError } = await supabase.rpc('increment_message_count', {
      user_id: session.user.id
    });
    
    const rpcAccess = !rpcError;
    
    // Retornar diagnóstico
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        expires_at: new Date(session.expires_at * 1000).toISOString()
      },
      profile: profile,
      access: {
        profiles: profileAccess,
        chat_messages: chatAccess,
        resource_usage: resourceAccess,
        rpc_increment_message: rpcAccess
      },
      errors: {
        profile: profileError ? profileError.message : null,
        chat: chatError ? chatError.message : null,
        resource: resourceError ? resourceError.message : null,
        rpc: rpcError ? rpcError.message : null
      }
    });

  } catch (error: any) {
    console.error('❌ [AUTH-DEBUG] Erro geral:', error);
    return NextResponse.json({ 
      error: error.message, 
      stage: 'general',
      authenticated: false
    }, { status: 500 });
  }
} 