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
    
    // Receber dados do webhook
    const payload = await request.json();
    
    if (!payload || !payload.data || !payload.data.id) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    
    // Obter informações do pagamento
    const paymentId = payload.data.id;
    // @ts-ignore - Ignorando erros de tipo para o SDK do Mercado Pago
    const payment = await mercadopago.payment.get(paymentId);
    
    if (!payment || !payment.body) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    
    const { status, external_reference, transaction_amount } = payment.body;
    const userId = external_reference;
    
    // Atualizar o status da tentativa de pagamento
    if (userId) {
      await supabase
        .from('payment_attempts')
        .update({
          status: status,
          payment_id: paymentId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'pending');
      
      // Se o pagamento foi aprovado, atualizar a assinatura do usuário
      if (status === 'approved') {
        // Obter data atual
        const currentDate = new Date();
        
        // Verificar se o usuário já tem uma assinatura ativa
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
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
        
        // Atualizar tier de assinatura
        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'premium',
            updated_at: currentDate.toISOString()
          })
          .eq('id', userId);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
