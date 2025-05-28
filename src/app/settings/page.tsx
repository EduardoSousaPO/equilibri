'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import WhyNotGPT from '@/components/WhyNotGPT';

// Componente para cada plano
interface PlanCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isCurrentPlan: boolean;
  onSelect: () => void;
  ctaText: string;
}

const PlanCard = ({
  title,
  price,
  description,
  features,
  isCurrentPlan,
  onSelect,
  ctaText
}: PlanCardProps) => (
  <div className={`rounded-lg border ${isCurrentPlan ? 'border-primary bg-primary/5' : 'bg-card'} p-6 shadow-sm`}>
    <div className="flex flex-col h-full">
      <div className="mb-6">
        {isCurrentPlan && (
          <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full inline-block mb-2">
            Plano Atual
          </div>
        )}
        <h3 className="text-2xl font-bold">{title}</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
          {price !== 'Grátis' && <span className="text-muted-foreground">/mês</span>}
        </div>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>
      
      <div className="space-y-3 flex-grow mb-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start">
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
            <span>{feature}</span>
          </div>
        ))}
      </div>
      
      <button
        onClick={onSelect}
        className={`w-full py-2 px-4 rounded-md text-center ${
          isCurrentPlan
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? 'Plano Atual' : ctaText}
      </button>
    </div>
  </div>
);

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [msgCount, setMsgCount] = useState<number>(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  // Buscar dados do usuário
  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        setUserEmail(user.email || '');
        
        // Buscar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        setUserName(profile.name || '');
        setUserPlan(profile.plan || 'free');
        setMsgCount(profile.msg_count || 0);
        
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar suas informações');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, [supabase, router]);

  // Função para iniciar processo de upgrade
  const handleUpgrade = async (plan: string) => {
    if (loading) return;
    
    if (plan === userPlan) {
      if (plan === 'free') {
        alert('Você já está no plano gratuito');
      } else {
        alert('Você já está neste plano');
      }
      return;
    }
    
    try {
      // Determinar ID do plano conforme o formato esperado pela API
      let planId = '';
      
      if (plan === 'pro') {
        planId = 'premium_monthly';
      } else if (plan === 'clinical') {
        planId = 'clinical_monthly';
      } else {
        throw new Error('Plano inválido');
      }
      
      // Chamar API para criar preferência de pagamento
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preference_data: {
            id: planId
          }
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar preferência de pagamento');
      }
      
      const data = await response.json();
      
      // Redirecionar para checkout do Mercado Pago
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('URL de pagamento não retornada');
      }
    } catch (error: any) {
      console.error('Erro ao processar upgrade:', error);
      alert(`Erro ao processar upgrade: ${error.message}`);
    }
  };

  // Dados dos planos
  const plans = [
    {
      id: 'free',
      title: 'Free',
      price: 'Grátis',
      description: 'Para começar sua jornada de autoconhecimento',
      features: [
        'Chat com Lari (30 mensagens/mês)',
        'Plano Terapêutico Personalizado',
        'Check-ins de Humor',
      ],
      ctaText: 'Plano Atual',
    },
    {
      id: 'pro',
      title: 'Premium',
      price: 'R$ 39,90',
      description: 'Para quem busca uma experiência completa',
      features: [
        'Chat ilimitado com Lari',
        'Plano Terapêutico Avançado',
        'Relatórios PDF para seu terapeuta',
        'Análise de padrões emocionais',
      ],
      ctaText: 'Fazer Upgrade',
    },
    {
      id: 'clinical',
      title: 'Premium Clínico',
      price: 'R$ 179',
      description: 'A experiência definitiva com suporte humano',
      features: [
        'Tudo do plano Premium',
        '1 sessão mensal de 60 min com psicóloga',
        'Prioridade no suporte',
        'Dicas personalizadas da sua psicóloga',
      ],
      ctaText: 'Fazer Upgrade',
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Carregando suas configurações...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Perfil do usuário */}
        <div className="md:col-span-1">
          <div className="rounded-lg border p-6 bg-card h-full">
            <h2 className="text-xl font-semibold mb-4">Seu Perfil</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Nome
                </label>
                <div className="font-medium">{userName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Email
                </label>
                <div className="font-medium">{userEmail}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Plano Atual
                </label>
                <div className="font-medium capitalize">
                  {userPlan === 'free' && 'Free'}
                  {userPlan === 'pro' && 'Premium'}
                  {userPlan === 'clinical' && 'Premium Clínico'}
                </div>
              </div>
              {userPlan === 'free' && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Mensagens Utilizadas
                  </label>
                  <div className="font-medium">
                    {msgCount} / 30 este mês
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (msgCount / 30) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Por que o Equilibri.IA é melhor */}
        <div className="md:col-span-2">
          <WhyNotGPT variant="card" />
        </div>
      </div>
      
      {/* Planos */}
      <h2 className="text-xl font-semibold mb-4">Planos Disponíveis</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            title={plan.title}
            price={plan.price}
            description={plan.description}
            features={plan.features}
            isCurrentPlan={plan.id === userPlan}
            onSelect={() => handleUpgrade(plan.id)}
            ctaText={plan.ctaText}
          />
        ))}
      </div>
      
      {/* Seção de Privacidade */}
      <div className="rounded-lg border p-6 bg-card mb-8">
        <h2 className="text-xl font-semibold mb-4">Privacidade</h2>
        <p className="text-muted-foreground mb-4">
          No Equilibri.IA, sua privacidade é nossa prioridade. Todos os seus dados são armazenados 
          de forma segura no Brasil, em conformidade com a LGPD. Suas conversas com a Lari são 
          confidenciais e utilizadas apenas para melhorar sua experiência terapêutica.
        </p>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="data-collection"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              defaultChecked
            />
            <label htmlFor="data-collection" className="ml-2 block text-sm">
              Permitir coleta anônima de dados para melhorar o serviço
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="marketing"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              defaultChecked
            />
            <label htmlFor="marketing" className="ml-2 block text-sm">
              Receber dicas e novidades por email
            </label>
          </div>
        </div>
      </div>
      
      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <button
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          onClick={() => router.push('/chat')}
        >
          Voltar para o Chat
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          onClick={() => {
            if (confirm('Você tem certeza que deseja sair da sua conta?')) {
              supabase.auth.signOut().then(() => {
                router.push('/login');
              });
            }
          }}
        >
          Sair da Conta
        </button>
      </div>
      
      {/* Modal de upgrade (simulado) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              Upgrade para {selectedPlan === 'pro' ? 'Premium' : 'Premium Clínico'}
            </h3>
            <p className="mb-4">
              Este é apenas um protótipo. Em uma implementação real, aqui seria integrado 
              o gateway de pagamento para processar sua assinatura.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md"
                onClick={() => setShowUpgradeModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                onClick={() => {
                  // Simular upgrade bem-sucedido
                  alert('Upgrade simulado com sucesso!');
                  setUserPlan(selectedPlan || 'free');
                  setShowUpgradeModal(false);
                }}
              >
                Confirmar (simulado)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 