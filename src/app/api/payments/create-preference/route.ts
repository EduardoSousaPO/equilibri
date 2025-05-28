import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuração de planos
const PLANS = {
  'premium_monthly': {
    title: 'Plano Premium Mensal - Equilibri',
    description: 'Assinatura mensal do plano Premium no Equilibri',
    unit_price: 39.90,
    quantity: 1,
    plan_id: 'pro'
  },
  'premium_annual': {
    title: 'Plano Premium Anual - Equilibri',
    description: 'Assinatura anual do plano Premium no Equilibri',
    unit_price: 399.90,
    quantity: 1,
    plan_id: 'pro'
  },
  'clinical_monthly': {
    title: 'Plano Clínico Mensal - Equilibri',
    description: 'Assinatura mensal do plano Clínico no Equilibri',
    unit_price: 179.90,
    quantity: 1,
    plan_id: 'clinical'
  }
};

export async function POST(request: Request) {
  try {
    // Inicializar cliente Supabase
    const supabase = await createRouteClient();
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Obter dados do corpo
    const { preference_data } = await request.json();
    
    // Validar dados
    if (!preference_data || !preference_data.id) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    // Obter plano selecionado
    const planId = preference_data.id;
    const plan = PLANS[planId];
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }
    
    // Obter informações do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single();
      
    // Configurar SDK do Mercado Pago
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
    });
    
    const preference = new Preference(client);
    
    // URLs de callback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Criar preferência de pagamento
    const result = await preference.create({
      body: {
        items: [
          {
            id: planId,
            title: plan.title,
            description: plan.description,
            unit_price: plan.unit_price,
            quantity: plan.quantity,
            currency_id: 'BRL'
          }
        ],
        payer: {
          name: profile?.name || user.email?.split('@')[0] || 'Usuário',
          email: profile?.email || user.email || '',
        },
        auto_return: 'all',
        back_urls: {
          success: process.env.MERCADOPAGO_SUCCESS_URL || `${baseUrl}/app/payment/success`,
          failure: process.env.MERCADOPAGO_FAILURE_URL || `${baseUrl}/app/payment/failure`,
          pending: process.env.MERCADOPAGO_PENDING_URL || `${baseUrl}/app/payment/pending`
        },
        notification_url: process.env.MERCADOPAGO_WEBHOOK_URL || `${baseUrl}/api/payments/webhook`,
        metadata: {
          user_id: user.id,
          plan_id: plan.plan_id
        }
      }
    });
    
    // Registrar tentativa de pagamento
    await supabase
      .from('payment_attempts')
      .insert({
        user_id: user.id,
        plan_id: plan.plan_id,
        amount: plan.unit_price,
        preference_id: result.id,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    
    // Retornar URL de pagamento
    return NextResponse.json({
      preference_id: result.id,
      init_point: result.init_point
    });
  } catch (error: any) {
    console.error('Erro na criação de preferência de pagamento:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao criar preferência de pagamento',
        details: error.message
      },
      { status: 500 }
    );
  }
}
