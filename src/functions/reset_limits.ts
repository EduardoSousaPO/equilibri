import { createClient } from '@supabase/supabase-js';

// Esta função é executada como uma Edge Function ou Cloud Function
// e deve ser configurada para rodar no primeiro dia de cada mês
export default async function resetLimits() {
  try {
    // Inicializa o cliente Supabase com as credenciais de serviço
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Executa a função SQL para resetar os limites
    const { error } = await supabase.rpc('reset_monthly_limits');

    if (error) {
      console.error('Erro ao resetar limites:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Falha ao resetar limites mensais' })
      };
    }

    console.log('Limites mensais resetados com sucesso');
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Limites mensais resetados' })
    };
    
  } catch (err) {
    console.error('Erro não tratado:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
} 