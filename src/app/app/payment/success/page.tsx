'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const supabase = createClientSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }
        
        // Buscar perfil do usuário para verificar status da assinatura
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error checking subscription:', error)
        setLoading(false)
      }
    }
    
    checkSubscription()
  }, [router])
  
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-background rounded-lg p-8 shadow-sm text-center">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-text-primary mb-4">Pagamento Aprovado!</h1>
            
            {profile?.plan === 'premium' ? (
              <>
                <p className="text-text-secondary mb-6">
                  Seu upgrade para o plano Premium foi concluído com sucesso. Agora você tem acesso a todos os recursos do Equilibri!
                </p>
                
                <div className="bg-background-secondary rounded-lg p-4 mb-6">
                  <h2 className="font-semibold text-text-primary mb-2">Detalhes da sua assinatura:</h2>
                  <p className="text-text-secondary">
                    <strong>Plano:</strong> Premium<br />
                    <strong>Válido até:</strong> {new Date(profile.subscription_end_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-text-secondary mb-6">
                Seu pagamento foi aprovado, mas ainda estamos processando sua assinatura. Isso pode levar alguns minutos. Se o problema persistir, entre em contato com o suporte.
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                type="button"
                onClick={() => router.push('/app/dashboard')}
                className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
              >
                Ir para o Dashboard
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/app/settings')}
                className="px-6 py-3 border border-border text-text-secondary rounded-md hover:bg-background-secondary transition-colors"
              >
                Gerenciar Assinatura
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
