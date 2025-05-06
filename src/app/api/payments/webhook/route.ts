import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import { PostgrestBuilder } from '@supabase/postgrest-js';

// Configurar SDK do Mercado Pago
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || ''
});

const payment = new Payment(mercadopago);

export async function POST(request: NextRequest) {
  try {
    // Obter cliente Supabase
    const supabase = await createRouteClient();
    
    // Receber dados do webhook
    const payload = await request.json();
    
    if (!payload || !payload.data || !payload.data.id) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    
    // Obter informações do pagamento
    const paymentId = payload.data.id;
    const paymentData = await payment.get({ id: paymentId });
    
    if (!paymentData || !paymentData.id) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    
    const { status, external_reference, transaction_amount } = paymentData;
    const userId = external_reference;
    
    // Atualizar o status da tentativa de pagamento
    if (userId) {
      // Abordagem tipada com upsert para evitar problemas com o método .eq()
      await supabase
        .from('payment_attempts')
        .upsert({
          user_id: userId,
          status: status,
          payment_id: paymentId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });
      
      // Se o pagamento foi aprovado, atualizar a assinatura do usuário
      if (status === 'approved') {
        // Obter data atual
        const currentDate = new Date();
        
        // Verificar se o usuário já tem uma assinatura ativa
        const { data: existingSubscriptions } = await supabase
          .from('subscriptions')
          .select('*')
          .match({ user_id: userId })
          .order('created_at', { ascending: false })
          .limit(1);
        
        const existingSubscription = existingSubscriptions?.[0];
        
        // Calcular nova data de término
        let startDate = currentDate;
        if (existingSubscription && new Date(existingSubscription.end_date) > currentDate) {
          startDate = new Date(existingSubscription.end_date);
        }
        
        // Adicionar 30 dias
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30);
        
        // Criar ou atualizar assinatura
        await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            amount: transaction_amount,
            status: 'active',
            payment_id: paymentId
          });
        
        // Atualizar tier de assinatura usando match em vez de eq
        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'premium',
            updated_at: currentDate.toISOString()
          })
          .match({ id: userId });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
