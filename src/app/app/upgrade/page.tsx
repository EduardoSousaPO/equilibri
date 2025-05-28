'use client'

import React, { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'

const plans = [
  {
    id: 'premium_monthly',
    name: 'Premium Mensal',
    price: 'R$ 39,90',
    features: [
      'Chat ilimitado com Lari',
      'Check-ins emocionais ilimitados',
      'Plano terapêutico avançado',
      'Análise avançada de padrões emocionais',
      'Exportação de relatórios em PDF',
      'Compartilhamento com terapeuta'
    ]
  },
  {
    id: 'premium_annual',
    name: 'Premium Anual',
    price: 'R$ 399,90',
    features: [
      'Todos os benefícios do plano mensal',
      'Economia de 2 meses',
      'Acesso antecipado a novos recursos',
      'Sessão de orientação personalizada'
    ]
  },
  {
    id: 'clinical_monthly',
    name: 'Premium Clínico',
    price: 'R$ 179,00',
    features: [
      'Tudo do plano Premium',
      '1 sessão mensal com psicóloga',
      'Videochamada de 60 minutos',
      'Agendamento online fácil',
      'Continuidade terapêutica',
      'Acesso à agenda exclusiva'
    ]
  }
]

export default function UpgradePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [isCreatingPayment, setIsCreatingPayment] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading('profile')
      
      try {
        const supabase = createClientSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setLoading(null)
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
        setLoading(null)
      }
    }
    
    fetchProfile()
  }, [])
  
  const handleUpgrade = async (planId: string) => {
    setIsCreatingPayment(true)
    setError(null)
    
    try {
      setLoading(planId)
      
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preference_data: {
            id: planId
          }
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento')
      }
      
      // Redirecionar para página de pagamento do Mercado Pago
      window.location.href = data.init_point
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao iniciar pagamento",
        description: error.message
      })
    } finally {
      setIsCreatingPayment(false)
      setLoading(null)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Escolha o plano ideal para você
      </h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-6">
            <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
            <p className="text-3xl font-bold mb-6">{plan.price}</p>
            
            <ul className="mb-6 space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            
            <Button
              className="w-full"
              onClick={() => handleUpgrade(plan.id)}
              disabled={loading === plan.id}
            >
              {loading === plan.id ? 'Processando...' : 'Assinar Agora'}
            </Button>
          </Card>
        ))}
      </div>
      <Toaster />
    </div>
  )
}
