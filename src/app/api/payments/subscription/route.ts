import mercadopago from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';

// Configurar SDK do Mercado Pago
// @ts-ignore - Ignorando erros de tipo para o SDK do Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN || ''
});

export async function GET(request: NextRequest) {
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
    
    // Buscar informações de assinatura
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    
    return NextResponse.json({
      subscription,
      subscription_tier: profile?.subscription_tier || 'free'
    });
  } catch (error) {
    console.error('Error fetching subscription info:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar informações de assinatura' },
      { status: 500 }
    );
  }
}
