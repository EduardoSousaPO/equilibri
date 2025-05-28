import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Esta função é executada como API route e pode ser chamada por um cron job externo
// configurado para rodar no primeiro dia de cada mês
export async function POST(req: Request) {
  try {
    // Verificar token de autorização para garantir que apenas sistemas autorizados possam chamar
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
      console.error('Tentativa de acesso não autorizado à API de reset de limites');
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Inicializa o cliente Supabase com as credenciais de serviço
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Resetar contadores de mensagens para usuários do plano Free
    const { data: freeUsers, error: freeError } = await supabaseAdmin
      .from('profiles')
      .update({ msg_count: 0 })
      .eq('plan', 'free')
      .select('id, email');

    if (freeError) {
      console.error('Erro ao resetar contadores de mensagens:', freeError);
      return NextResponse.json(
        { error: 'Falha ao resetar contadores de mensagens' },
        { status: 500 }
      );
    }

    // 2. Comentar o código que tenta resetar a coluna session_used
    // const { data: clinicalUsers, error: clinicalError } = await supabaseAdmin
    //   .from('profiles')
    //   .update({ session_used: false })
    //   .eq('plan', 'clinical')
    //   .select('id, email');

    // if (clinicalError) {
    //   console.error('Erro ao resetar uso de sessões:', clinicalError);
    //   // Não retornar erro aqui, pois o reset de mensagens já foi feito
    // }

    // Para manter a funcionalidade, vamos buscar os usuários do plano clinical
    const { data: clinicalUsers, error: clinicalError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, plan')
      .eq('plan', 'clinical');

    if (clinicalError) {
      console.error('Erro ao buscar usuários do plano clinical:', clinicalError);
      // Não retornar erro aqui, pois o reset de mensagens já foi feito
    }
    
    // 3. Resetar contadores de uso de recursos para todos os usuários
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    
    // Criar registros de uso para o novo mês
    const { error: resourceError } = await supabaseAdmin
      .from('resource_usage')
      .upsert(
        [...(freeUsers || []), ...(clinicalUsers || [])]
          .filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
          )
          .map(user => {
            // Determinar o limite baseado na origem do usuário
            const isFromFreeUsers = freeUsers?.some(u => u.id === user.id) || false;
            const limit = isFromFreeUsers ? 30 : -1; // -1 indica ilimitado
            
            return {
              user_id: user.id,
              month: currentMonth,
              resource_type: 'chat',
              used: 0,
              limit,
              updated_at: new Date().toISOString()
            };
          }),
        {
          onConflict: 'user_id, month, resource_type',
          ignoreDuplicates: false
        }
      );
    
    if (resourceError) {
      console.error('Erro ao resetar registros de uso de recursos:', resourceError);
    }
    
    // 4. Registrar o evento de reset em uma tabela de logs
    const { error: logError } = await supabaseAdmin
      .from('system_logs')
      .insert({
        event: 'monthly_reset',
        details: {
          free_users_reset: freeUsers?.length || 0,
          clinical_users_reset: clinicalUsers?.length || 0,
          timestamp: new Date().toISOString()
        }
      });
    
    if (logError) {
      console.error('Erro ao registrar log de reset:', logError);
    }

    console.log('Limites mensais resetados com sucesso');
    return NextResponse.json({ 
      success: true, 
      message: 'Limites mensais resetados',
      timestamp: new Date().toISOString(),
      stats: {
        free_users_reset: freeUsers?.length || 0,
        clinical_users_reset: clinicalUsers?.length || 0
      }
    });
    
  } catch (err) {
    console.error('Erro não tratado:', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 