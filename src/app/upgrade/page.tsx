'use client'

import { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function UpgradePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientSupabaseClient()
  const router = useRouter()
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar sessão
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          console.log('Usuário não autenticado, redirecionando para login')
          router.push('/login?redirectTo=/upgrade')
          return
        }
        
        // Buscar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', session.user.id)
          .single()
        
        if (profileError || !profile) {
          console.error('Erro ao buscar perfil do usuário:', profileError)
          setError('Erro ao carregar seu perfil. Tente novamente mais tarde.')
          setIsLoading(false)
          return
        }
        
        setUserProfile({
          plan: profile.plan || 'free',
          status: 'active' // Valor padrão pois não existe coluna de status
        })
        
        setIsLoading(false)
      } catch (err) {
        console.error('Exceção ao verificar autenticação:', err)
        setError('Erro ao verificar autenticação. Tente novamente mais tarde.')
        setIsLoading(false)
      }
    }
    
    // Verificar autenticação ao montar o componente
    checkAuth()
  }, [router, supabase])
  
  const handleUpgrade = async (planType: 'premium' | 'clinical') => {
    try {
      setIsProcessing(true)
      setError(null)
      
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planType })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Erro ao processar pagamento')
        setIsProcessing(false)
        return
      }
      
      // Redirecionar para página de pagamento do Mercado Pago
      window.location.href = data.init_point
    } catch (err) {
      console.error('Erro ao processar upgrade:', err)
      setError('Erro ao processar pagamento. Tente novamente mais tarde.')
      setIsProcessing(false)
    }
  }
  
  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Carregando planos...</div>
      </div>
    )
  }
  
  // Mostrar erro se houver
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={() => setError(null)}>Tentar novamente</Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Planos Equilibri.IA</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Plano Gratuito */}
        <Card className={`border-2 ${userProfile?.plan === 'free' ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Plano Gratuito</h3>
              {userProfile?.plan === 'free' && (
                <Badge className="bg-blue-100 text-blue-800">Atual</Badge>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-2xl font-bold mb-2">R$ 0</p>
              <p className="text-sm text-gray-600">Para sempre</p>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>30 mensagens por mês</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>10 transcrições de áudio por mês</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Acesso ao diário emocional</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✗</span>
                <span className="text-gray-400">Mensagens ilimitadas</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✗</span>
                <span className="text-gray-400">Relatórios semanais</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✗</span>
                <span className="text-gray-400">Sessões com psicóloga</span>
              </li>
            </ul>
            
            <Button 
              disabled={true}
              className="w-full"
              variant="outline"
            >
              Plano Atual
            </Button>
          </CardContent>
        </Card>
        
        {/* Plano Premium */}
        <Card className={`border-2 ${userProfile?.plan === 'premium' ? 'border-purple-400 bg-purple-50' : 'border-gray-200'}`}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Plano Premium</h3>
              {userProfile?.plan === 'premium' && (
                <Badge className="bg-purple-100 text-purple-800">Atual</Badge>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-2xl font-bold mb-2">R$ 39,90</p>
              <p className="text-sm text-gray-600">por mês</p>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Mensagens ilimitadas</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>30 transcrições de áudio por mês</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Relatórios semanais personalizados</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Exportação de dados em PDF</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Planos terapêuticos personalizados</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">✗</span>
                <span className="text-gray-400">Sessões com psicóloga</span>
              </li>
            </ul>
            
            {userProfile?.plan === 'premium' ? (
              <Button 
                disabled={true}
                className="w-full"
                variant="outline"
              >
                Plano Atual
              </Button>
            ) : (
              <Button 
                onClick={() => handleUpgrade('premium')}
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processando...' : 'Fazer Upgrade'}
              </Button>
            )}
          </CardContent>
        </Card>
        
        {/* Plano Premium Clínico */}
        <Card className={`border-2 ${userProfile?.plan === 'clinical' ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'}`}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Premium Clínico</h3>
              {userProfile?.plan === 'clinical' && (
                <Badge className="bg-emerald-100 text-emerald-800">Atual</Badge>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-2xl font-bold mb-2">R$ 179,00</p>
              <p className="text-sm text-gray-600">por mês</p>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Mensagens ilimitadas</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>100 transcrições de áudio por mês</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Relatórios semanais personalizados</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Exportação de dados em PDF</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Planos terapêuticos personalizados</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="font-medium">1 sessão mensal com psicóloga</span>
              </li>
            </ul>
            
            {userProfile?.plan === 'clinical' ? (
              <Button 
                disabled={true}
                className="w-full"
                variant="outline"
              >
                Plano Atual
              </Button>
            ) : (
              <Button 
                onClick={() => handleUpgrade('clinical')}
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processando...' : 'Fazer Upgrade'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Todos os planos incluem acesso ao diário emocional, chat com Lari e transcrição de áudio.</p>
        <p className="mt-2">Pagamentos processados com segurança pelo Mercado Pago.</p>
      </div>
    </div>
  )
}
