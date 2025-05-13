'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');
  const supabase = createClientComponentClient();
  
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [planDetails, setPlanDetails] = useState<any>(null);
  
  // Mapeamento de planos
  const plans = {
    pro: {
      id: 'pro',
      name: 'Premium',
      price: 'R$ 39,90',
      description: 'Chat ilimitado + Relatórios PDF',
      features: [
        'Chat ilimitado com Lari',
        'Plano Terapêutico Avançado',
        'Relatórios PDF para seu terapeuta',
        'Análise de padrões emocionais',
      ]
    },
    clinical: {
      id: 'clinical',
      name: 'Premium Clínico',
      price: 'R$ 179,00',
      description: 'Premium + 1 sessão mensal com psicóloga',
      features: [
        'Tudo do plano Premium',
        '1 sessão mensal de 60 min com psicóloga',
        'Prioridade no suporte',
        'Dicas personalizadas da sua psicóloga',
      ]
    }
  };
  
  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          router.push('/login');
          return;
        }
        
        // Verificar plano atual para evitar downgrade ou compra do mesmo plano
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', authUser.id)
          .single();
          
        if (profile?.plan === planId) {
          router.push('/settings');
          return;
        }
        
        setUser(authUser);
        
        // Definir detalhes do plano selecionado
        if (planId && plans[planId as keyof typeof plans]) {
          setPlanDetails(plans[planId as keyof typeof plans]);
        } else {
          setError('Plano inválido');
          setTimeout(() => router.push('/settings'), 3000);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
        setError('Erro ao carregar suas informações');
      } finally {
        setLoading(false);
      }
    }
    
    loadUser();
  }, [supabase, router, planId]);
  
  const handleCheckout = async () => {
    if (!user || !planDetails) return;
    
    setProcessingPayment(true);
    setError(null);
    
    try {
      // Simulação de processamento de pagamento
      // Em produção, aqui você integraria com Stripe, MercadoPago, etc.
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Após confirmação do pagamento, atualizar o plano do usuário
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          plan: planId,
          // Se for upgrade para clínico, resetar o uso da sessão
          ...(planId === 'clinical' ? { session_used: false } : {})
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Redirecionar para página de sucesso
      router.push('/checkout/success');
      
    } catch (err) {
      console.error('Erro no processamento do pagamento:', err);
      setError('Ocorreu um erro ao processar seu pagamento. Tente novamente.');
    } finally {
      setProcessingPayment(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center">Carregando informações do checkout...</div>
      </div>
    );
  }
  
  if (!planDetails) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Plano não encontrado</h1>
          <p className="mb-4">{error}</p>
          <Link href="/settings" className="text-primary hover:underline">
            Voltar para configurações
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Finalizar Assinatura</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="rounded-lg border bg-card p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
        
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="font-medium">{planDetails.name}</h3>
            <p className="text-sm text-muted-foreground">{planDetails.description}</p>
          </div>
          <div className="font-semibold">{planDetails.price}/mês</div>
        </div>
        
        <div className="py-3 border-b">
          <h3 className="font-medium mb-2">O que está incluído:</h3>
          <ul className="space-y-1">
            {planDetails.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-start text-sm">
                <svg
                  className="h-5 w-5 text-primary shrink-0 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex items-center justify-between py-4 font-bold">
          <div>Total (mensal)</div>
          <div>{planDetails.price}</div>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Forma de Pagamento</h2>
        
        {/* Aqui você integraria o formulário de cartão de crédito do Stripe ou outro gateway */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="card-number">
              Número do Cartão
            </label>
            <input
              type="text"
              id="card-number"
              className="w-full p-2 border rounded"
              placeholder="1234 5678 9012 3456"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="expiry">
                Validade
              </label>
              <input
                type="text"
                id="expiry"
                className="w-full p-2 border rounded"
                placeholder="MM/AA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="cvc">
                CVC
              </label>
              <input
                type="text"
                id="cvc"
                className="w-full p-2 border rounded"
                placeholder="123"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Nome no Cartão
            </label>
            <input
              type="text"
              id="name"
              className="w-full p-2 border rounded"
              placeholder="Nome completo"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Link 
          href="/settings" 
          className="text-muted-foreground hover:text-foreground"
        >
          Voltar
        </Link>
        
        <button
          onClick={handleCheckout}
          disabled={processingPayment}
          className="bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-6 rounded-md font-medium disabled:opacity-70"
        >
          {processingPayment ? 'Processando...' : 'Finalizar Assinatura'}
        </button>
      </div>
    </div>
  );
} 