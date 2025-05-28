import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-queries';

export async function POST(request: Request) {
  try {
    console.log("🔄 [SYNC-SESSION] Iniciando sincronização de sessão");
    
    // Criar cliente Supabase
    const supabase = await createServerSupabaseClient();
    
    // Verificar sessão atual
    console.log("🔍 [SYNC-SESSION] Verificando sessão existente");
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ [SYNC-SESSION] Erro ao verificar sessão:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!session) {
      console.log('❌ [SYNC-SESSION] Nenhuma sessão encontrada');
      return NextResponse.json({ error: 'Nenhuma sessão encontrada' }, { status: 401 });
    }

    console.log("✅ [SYNC-SESSION] Sessão encontrada para:", session.user.email);
    
    // Tentar renovar a sessão
    console.log("🔄 [SYNC-SESSION] Tentando renovar sessão");
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.error('❌ [SYNC-SESSION] Erro ao renovar sessão:', refreshError);
      
      // Se o erro for de token expirado, tentar nova autenticação
      if (refreshError.message.includes('expired')) {
        console.log('⏰ [SYNC-SESSION] Token expirado, requer reautenticação');
        return NextResponse.json({ error: 'Sessão expirada', expired: true }, { status: 401 });
      }
      
      return NextResponse.json({ error: refreshError.message }, { status: 500 });
    }

    // Verificar se a renovação foi bem-sucedida
    if (!refreshData.session) {
      console.log('❌ [SYNC-SESSION] Renovação de sessão falhou - nova sessão não retornada');
      return NextResponse.json({ error: 'Falha ao renovar sessão' }, { status: 401 });
    }

    console.log('✅ [SYNC-SESSION] Sessão sincronizada:', refreshData.session.user.email);
    console.log('ℹ️ [SYNC-SESSION] Expira em:', new Date(refreshData.session.expires_at * 1000).toISOString());
    
    // Testar acesso a dados para verificar permissões
    try {
      console.log('🔍 [SYNC-SESSION] Testando acesso a dados do perfil');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, plan')
        .eq('id', refreshData.session.user.id)
        .single();
      
      if (profileError) {
        console.warn('⚠️ [SYNC-SESSION] Erro ao acessar dados do perfil:', profileError);
      } else {
        console.log('✅ [SYNC-SESSION] Acesso a dados de perfil confirmado:', profileData?.plan);
      }
    } catch (dataError) {
      console.error('❌ [SYNC-SESSION] Erro ao testar acesso a dados:', dataError);
    }
    
    // Retornar sucesso com dados da sessão renovada
    return NextResponse.json({ 
      success: true, 
      user: {
        id: refreshData.session.user.id,
        email: refreshData.session.user.email
      }
    });

  } catch (error: any) {
    console.error('❌ [SYNC-SESSION] Erro:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 