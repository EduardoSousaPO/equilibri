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

    // Resetar o contador de mensagens dos usuários Free
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ msg_count: 0 })
      .eq('plan', 'free');

    if (error) {
      console.error('Erro ao resetar limites:', error);
      return NextResponse.json(
        { error: 'Falha ao resetar limites mensais' },
        { status: 500 }
      );
    }

    console.log('Limites mensais resetados com sucesso');
    return NextResponse.json({ 
      success: true, 
      message: 'Limites mensais resetados',
      timestamp: new Date().toISOString(),
      affectedRecords: data?.length || 'unknown'
    });
    
  } catch (err) {
    console.error('Erro não tratado:', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 