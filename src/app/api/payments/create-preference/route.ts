import mercadopago from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';

// Configurar SDK do Mercado Pago
// @ts-ignore - Ignorando erros de tipo para o SDK do Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN || ''
});

export async function POST(request: NextRequest) {
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
    
    // Obter dados da requisição
    const { preference_data } = await request.json();
    
    if (!preference_data) {
      return NextResponse.json(
        { error: 'Dados de preferência não fornecidos' },
        { status: 400 }
      );
    }
    
    // Buscar informações do perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Criar preferência de pagamento
    const preference = {
      items: [
        {
          title: preference_data.title || 'Assinatura Premium DiarioTer - 1 mês',
          unit_price: preference_data.price || 29.90,
          quantity: 1,
          currency_id: 'BRL'
        }
      ],
      payer: {
        name: profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Usuário',
        surname: profile?.full_name?.split(' ').slice(1).join(' ') || 'DiarioTer',
        email: user.email || 'usuario@diarioter.com'
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/app/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/app/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/app/payment/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      external_reference: user.id,
      metadata: {
        user_id: user.id
      }
    };
    
    // @ts-ignore - Ignorando erros de tipo para o SDK do Mercado Pago
    const response = await mercadopago.preferences.create(preference);
    
    // Registrar a tentativa de pagamento
    await supabase
      .from('payment_attempts')
      .insert({
        user_id: user.id,
        preference_id: response.body.id,
        amount: preference_data.price || 29.90,
        status: 'pending'
      });
    
    return NextResponse.json({
      id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point
    });
  } catch (error) {
    console.error('Error creating payment preference:', error);
    return NextResponse.json(
      { error: 'Erro ao criar preferência de pagamento' },
      { status: 500 }
    );
  }
}
