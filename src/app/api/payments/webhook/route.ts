import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(request: NextRequest) {
  try {
    // Extrair dados da requisição
    const body = await request.json();
    
    // Verificar se é uma notificação de pagamento
    if (body.type !== 'payment') {
      return NextResponse.json({ message: 'Notificação não processada: não é um pagamento' }, { status: 200 });
    }
    
    // Configurar cliente Mercado Pago
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
    });
    
    // Buscar detalhes do pagamento
    const paymentClient = new Payment(client);
    const paymentData = await paymentClient.get({ id: body.data.id });
    
    // Extrair informações relevantes
    const paymentId = paymentData.id;
    const status = paymentData.status;
    const transaction_amount = paymentData.transaction_amount;
    const userId = paymentData.metadata?.user_id;
    const planId = paymentData.metadata?.plan_id;
    
    if (!userId) {
      console.error('User ID não encontrado nos metadados:', paymentData.metadata);
      return NextResponse.json({ message: 'User ID não encontrado' }, { status: 400 });
    }
    
    // Inicializar Supabase Admin para operações em nome do sistema
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
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
        
        // Adicionar 30 dias (ou mais se for plano anual)
        const endDate = new Date(startDate);
        const daysToAdd = planId && planId.includes('annual') ? 365 : 30;
        endDate.setDate(endDate.getDate() + daysToAdd);
        
        // Criar ou atualizar assinatura
        await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan_id: planId || 'pro',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            amount: transaction_amount,
            status: 'active',
            payment_id: paymentId
          });
        
        // Atualizar plano no perfil do usuário
        await supabase
          .from('profiles')
          .update({
            plan: planId || 'pro',
            updated_at: currentDate.toISOString()
          })
          .match({ id: userId });
        
        // Registrar em log
        await supabase
          .from('system_logs')
          .insert({
            event: 'plan_upgrade',
            details: {
              user_id: userId,
              plan: planId || 'pro',
              payment_id: paymentId,
              amount: transaction_amount
            }
          });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notificação processada com sucesso',
      payment_id: paymentId,
      status: status
    });
    
  } catch (error: any) {
    console.error('Erro ao processar notificação de pagamento:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao processar notificação', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
