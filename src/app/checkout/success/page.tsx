'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [planName, setPlanName] = useState('');
  
  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        // Verificar plano do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
          
        if (profile?.plan === 'pro') {
          setPlanName('Premium');
        } else if (profile?.plan === 'clinical') {
          setPlanName('Premium Clínico');
        } else {
          // Se por algum motivo o plano não for pro ou clinical, redirecionar
          router.push('/settings');
        }
        
      } catch (err) {
        console.error('Erro ao verificar usuário:', err);
        router.push('/settings');
      }
    }
    
    checkUser();
  }, [router, supabase]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg 
            className="w-8 h-8 text-green-600" 
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
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Assinatura Confirmada!</h1>
        <p className="text-muted-foreground mb-6">
          Seu plano {planName} foi ativado com sucesso.
        </p>
        
        {planName === 'Premium Clínico' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6 text-left">
            <p className="font-medium mb-1">Agende sua sessão</p>
            <p className="text-sm">
              Agora você tem direito a uma sessão mensal de 60 minutos com uma de nossas 
              psicólogas. Visite a página de agenda para escolher o melhor horário para você.
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <Link 
            href="/chat" 
            className="block w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-6 rounded-md font-medium"
          >
            Ir para o Chat com Lari
          </Link>
          
          {planName === 'Premium Clínico' && (
            <Link 
              href="/agenda" 
              className="block w-full bg-primary/10 text-primary hover:bg-primary/20 py-2 px-6 rounded-md font-medium"
            >
              Agendar minha Sessão
            </Link>
          )}
          
          <Link 
            href="/settings" 
            className="block w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 px-6 rounded-md font-medium"
          >
            Voltar para Configurações
          </Link>
        </div>
      </div>
    </div>
  );
} 