'use client'

import React, { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'

export default function UpgradePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isCreatingPayment, setIsCreatingPayment] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly')
  
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      
      try {
        const supabase = createClientSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setLoading(false)
          return
        }
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError('Erro ao buscar informações do perfil. Por favor, tente novamente.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [])
  
  const handleUpgrade = async () => {
    setIsCreatingPayment(true)
    setError(null)
    
    try {
      // Configurações para a chamada da API
      const requestConfig = {
        id: selectedPlan === 'monthly' ? 'premium_monthly' : 'premium_annual',
        title: 'Assinatura Premium Equilibri - 1 mês',
        price: selectedPlan === 'monthly' ? 39.90 : 399.90,
        currency: 'BRL',
        description: 'Acesso a todos os recursos premium do Equilibri'
      };
      
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preference_data: requestConfig
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar preferência de pagamento')
      }
      
      // Redirecionar para a página de pagamento do Mercado Pago
      window.location.href = data.init_point
    } catch (error) {
      console.error('Error creating payment preference:', error)
      setError('Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.')
    } finally {
      setIsCreatingPayment(false)
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Upgrade para Premium</h1>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-error-light text-error rounded-md">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-background rounded-lg p-6 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-text-primary">Plano Gratuito</h2>
              <p className="text-text-secondary mt-1">Seu plano atual</p>
              <p className="text-3xl font-bold text-text-primary mt-4">R$ 0</p>
              <p className="text-text-secondary">para sempre</p>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-text-primary">Até 50 entradas de diário por mês</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-text-primary">Até 2 entradas de áudio por mês</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-text-primary">Até 4 relatórios semanais</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-text-primary">Check-ins emocionais ilimitados</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-text-primary">Acesso a técnicas terapêuticas</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-error mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-text-secondary">Sem análise avançada de padrões</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-error mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-text-secondary">Sem exportação de dados</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-error mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-text-secondary">Sem compartilhamento com terapeuta</span>
              </li>
            </ul>
            
            <button
              type="button"
              disabled
              className="w-full px-4 py-3 bg-background-secondary text-text-secondary rounded-md cursor-not-allowed"
            >
              Plano Atual
            </button>
          </div>
          
          <div className="bg-background rounded-lg p-6 shadow-sm border-2 border-primary relative">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                Recomendado
              </span>
            </div>
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-text-primary">Plano Premium</h2>
              <p className="text-text-secondary mt-1">Desbloqueie todo o potencial</p>
              <p className="text-3xl font-bold text-text-primary mt-4">R$ 39,90</p>
              <p className="text-text-secondary">por mês</p>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-text-primary">Entradas de diário ilimitadas</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-text-primary">Entradas de áudio ilimitadas</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-text-primary">Relatórios semanais ilimitados</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-text-primary">Check-ins emocionais ilimitados</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-text-primary">Acesso a todas as técnicas terapêuticas</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-text-primary">Análise avançada de padrões emocionais</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-text-primary">Exportação de dados em PDF</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-text-primary">Compartilhamento com terapeuta</span>
              </li>
            </ul>
            
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={isCreatingPayment || profile?.plan === 'premium'}
              className={`w-full px-4 py-3 rounded-md ${
                profile?.plan === 'premium'
                  ? 'bg-success text-white cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-light transition-colors'
              }`}
            >
              {isCreatingPayment ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : profile?.plan === 'premium' ? (
                'Assinatura Ativa'
              ) : (
                'Fazer Upgrade Agora'
              )}
            </button>
            
            {profile?.plan === 'premium' && (
              <div className="mt-4 text-center text-text-secondary text-sm">
                Sua assinatura está ativa até {new Date(profile.subscription_end_date).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-8 bg-background rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Perguntas Frequentes</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-text-primary">Como funciona a cobrança?</h3>
            <p className="text-text-secondary mt-1">A assinatura é mensal e será renovada automaticamente. Você pode cancelar a qualquer momento.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-text-primary">Posso cancelar minha assinatura?</h3>
            <p className="text-text-secondary mt-1">Sim, você pode cancelar sua assinatura a qualquer momento. Após o cancelamento, você continuará tendo acesso Premium até o final do período pago.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-text-primary">Quais formas de pagamento são aceitas?</h3>
            <p className="text-text-secondary mt-1">Aceitamos cartões de crédito, débito e Pix através do Mercado Pago.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-text-primary">O que acontece com meus dados se eu cancelar?</h3>
            <p className="text-text-secondary mt-1">Seus dados permanecem seguros em sua conta. Se você voltar para o plano gratuito, terá acesso limitado a novos recursos, mas seus dados existentes continuarão disponíveis.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
