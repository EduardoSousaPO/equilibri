'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AudioInputPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcription, setTranscription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [usageInfo, setUsageInfo] = useState<any>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  
  const supabase = createClient()
  const router = useRouter()
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar sessão diretamente com o cliente Supabase
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          console.log('Usuário não autenticado, redirecionando para login')
          router.push('/login?redirectTo=/audio')
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
        
        // Verificar plano e limites
        const userPlan = profile.plan || 'free'
        // Como não existe coluna de status no banco, usamos sempre 'active'
        const planStatus = 'active'
        
        // Verificar se a assinatura está ativa (apenas para planos pagos)
        if (userPlan !== 'free' && planStatus !== 'active') {
          setError(`Sua assinatura ${userPlan} está ${planStatus}. Reative sua assinatura para continuar.`)
          setIsLoading(false)
          return
        }
        
        // Buscar uso atual de transcrições
        const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
        const { data: usageData, error: usageError } = await supabase
          .from('resource_usage')
          .select('count')
          .eq('user_id', session.user.id)
          .eq('resource_type', 'transcription')
          .eq('month', currentMonth)
          .single()
        
        // Definir limites com base no plano
        const limits = {
          free: 10,
          premium: 30,
          clinical: 100
        }
        
        const limit = limits[userPlan as keyof typeof limits] || limits.free
        const currentUsage = usageData?.count || 0
        
        setUsageInfo({
          current: currentUsage,
          limit,
          plan: userPlan
        })
        
        // Verificar se atingiu limite
        if (currentUsage >= limit) {
          setLimitReached(true)
        }
        
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
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      audioChunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        
        // Liberar stream
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err)
      setError('Não foi possível acessar o microfone. Verifique as permissões do navegador.')
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }
  
  const transcribeAudio = async () => {
    if (!audioBlob) return
    
    try {
      setError(null)
      setTranscription('Transcrevendo...')
      
      const formData = new FormData()
      formData.append('audio', audioBlob)
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Erro ao transcrever áudio')
        setTranscription('')
        return
      }
      
      setTranscription(data.transcript)
      
      // Atualizar informações de uso
      if (data.usage) {
        setUsageInfo(data.usage)
        
        // Verificar se atingiu limite após esta transcrição
        if (data.usage.remaining <= 0) {
          setLimitReached(true)
        }
      }
    } catch (err) {
      console.error('Erro ao transcrever áudio:', err)
      setError('Erro ao processar transcrição. Tente novamente.')
      setTranscription('')
    }
  }
  
  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Carregando...</div>
      </div>
    )
  }
  
  // Mostrar erro se houver
  if (error && !transcription) {
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
  
  // Mostrar mensagem de limite atingido
  if (limitReached) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Badge className="mb-4 bg-amber-100 text-amber-800">Limite Atingido</Badge>
            <h2 className="text-xl font-semibold mb-4">Você atingiu o limite de transcrições</h2>
            <p className="mb-6 text-gray-600">
              Seu plano {usageInfo?.plan || 'atual'} permite até {usageInfo?.limit || '10'} transcrições por mês.
              Faça upgrade para um plano superior para mais transcrições.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Voltar
              </Button>
              <Button onClick={() => router.push('/upgrade')}>
                Ver Planos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Transcrição de Áudio</h1>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="mb-6">
              {isRecording ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse mr-2"></div>
                  <span>Gravando...</span>
                </div>
              ) : (
                <span>Pronto para gravar</span>
              )}
            </div>
            
            <div className="flex gap-4">
              {!isRecording ? (
                <Button onClick={startRecording} disabled={limitReached}>
                  Iniciar Gravação
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive">
                  Parar Gravação
                </Button>
              )}
              
              {audioBlob && !isRecording && (
                <Button onClick={transcribeAudio} disabled={limitReached}>
                  Transcrever
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {transcription && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-2">Transcrição</h2>
            <p className="whitespace-pre-wrap">{transcription}</p>
          </CardContent>
        </Card>
      )}
      
      {usageInfo && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm">
          <p className="text-blue-800">
            <span className="font-medium">Uso:</span> {usageInfo.current}/{usageInfo.limit} transcrições neste mês
            {usageInfo.remaining !== undefined && (
              <span> ({usageInfo.remaining} restantes)</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
