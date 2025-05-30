import { MercadoPagoConfig } from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';

// Configurar SDK do Mercado Pago
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || ''
});

export const dynamic = "force-dynamic";

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
      .select('plan')
      .eq('id', user.id)
      .single();
    
    return NextResponse.json({
      subscription,
      plan: profile?.plan || 'free'
    });
  } catch (error) {
    console.error('Error fetching subscription info:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar informações de assinatura' },
      { status: 500 }
    );
  }
}
