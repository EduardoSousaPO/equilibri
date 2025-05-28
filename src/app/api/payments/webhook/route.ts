import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Obter o corpo da requisição como texto
    const body = await request.json();
    
    // Obter o cabeçalho de assinatura
    const signature = request.headers.get('x-signature');
    
    // Validar a assinatura
    if (process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      const generatedSignature = crypto.createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');
      
      if (signature !== `${generatedSignature}`) {
        console.error('Assinatura do webhook inválida');
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
      }
    }
    
    // Parsear o corpo da requisição
    const data = JSON.parse(body);
    
    // Verificar se é uma notificação de pagamento
    if (data.type !== 'payment') {
      return NextResponse.json({ message: 'Notificação não processada: não é um pagamento' }, { status: 200 });
    }
    
    // Configurar cliente do Mercado Pago
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
    });
    
    const payment = new Payment(client);
    
    // Obter detalhes do pagamento
    const paymentData = await payment.get({ id: data.data.id });
    
    // Inicializar cliente Supabase
    const supabase = await createRouteClient();
    
    // Atualizar status do pagamento
    const { error: updateError } = await supabase
      .from('payment_attempts')
      .update({
        status: paymentData.status,
        payment_id: paymentData.id,
        updated_at: new Date().toISOString()
      })
      .eq('preference_id', paymentData.preference_id);
      
    if (updateError) {
      console.error('Erro ao atualizar pagamento:', updateError);
      return NextResponse.json(
        { error: 'Erro ao processar notificação' },
        { status: 500 }
      );
    }
    
    // Se o pagamento foi aprovado, atualizar o plano do usuário
    if (paymentData.status === 'approved') {
      const metadata = paymentData.metadata as { user_id: string; plan_id: string };
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          plan: metadata.plan_id,
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
        })
        .eq('id', metadata.user_id);
        
      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        return NextResponse.json(
          { error: 'Erro ao atualizar perfil' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar webhook' },
      { status: 500 }
    );
  }
}
