import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server-queries';

// Configuração do Mercado Pago
const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    // Criar cliente Supabase
    const supabase = await createServerSupabaseClient();
    
    // Verificar autenticação
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Usuário não autenticado. Faça login para continuar.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Obter dados do corpo da requisição
    const body = await req.json();
    const { planType } = body;
    
    if (!planType || !['premium', 'clinical'].includes(planType)) {
      return NextResponse.json(
        { error: 'Tipo de plano inválido. Escolha premium ou clinical.' },
        { status: 400 }
      );
    }
    
    // Verificar se o token do Mercado Pago está configurado
    if (!MP_ACCESS_TOKEN) {
      console.error('Token do Mercado Pago não configurado');
      return NextResponse.json(
        { error: 'Serviço de pagamento temporariamente indisponível.' },
        { status: 503 }
      );
    }
    
    // Obter perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }
    
    // Definir preço com base no tipo de plano
    const price = planType === 'premium' ? 39.90 : 179.00;
    const planName = planType === 'premium' ? 'Premium' : 'Premium Clínico';
    
    // Criar preferência de pagamento no Mercado Pago
    const preference = {
      items: [
        {
          id: `plan-${planType}`,
          title: `Equilibri.IA - Plano ${planName}`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: price
        }
      ],
      payer: {
        name: profile.name || 'Usuário',
        email: session.user.email || profile.email || 'usuario@exemplo.com'
      },
      back_urls: {
        success: `${BASE_URL}/payment/success`,
        failure: `${BASE_URL}/payment/failure`,
        pending: `${BASE_URL}/payment/pending`
      },
      auto_return: 'approved',
      notification_url: `${BASE_URL}/api/webhooks/mercadopago`,
      external_reference: `${userId}-${planType}-${Date.now()}`,
      metadata: {
        user_id: userId,
        plan_type: planType
      }
    };
    
    // Chamar API do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro Mercado Pago:', errorData);
      return NextResponse.json(
        { error: 'Erro ao criar preferência de pagamento' },
        { status: 500 }
      );
    }
    
    const preferenceData = await response.json();
    
    // Registrar tentativa de pagamento no banco
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        payment_id: preferenceData.id,
        external_reference: preference.external_reference,
        amount: price,
        plan_type: planType,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    
    if (paymentError) {
      console.error('Erro ao registrar pagamento:', paymentError);
    }
    
    return NextResponse.json({
      success: true,
      preference_id: preferenceData.id,
      init_point: preferenceData.init_point,
      sandbox_init_point: preferenceData.sandbox_init_point
    });
    
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar solicitação de pagamento' },
      { status: 500 }
    );
  }
}
