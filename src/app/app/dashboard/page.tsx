'use client'

import React, { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'
import { HappyIllustration, CalmIllustration, SadIllustration, AnxiousIllustration, AngryIllustration, NeutralIllustration } from '@/components/ui/illustrations'
import { EmotionType } from '@/types/database'
import Link from 'next/link'

interface DashboardCardProps {
  title: string
  value: string | number
  icon?: JSX.Element
  className?: string
  bgColor?: string
  valueColor?: string
}

const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  className = '',
  bgColor = 'bg-background',
  valueColor = 'text-text-primary'
}: DashboardCardProps) => (
  <div className={`${bgColor} rounded-md p-5 shadow-sm border border-border hover:shadow transition-all duration-300 ${className}`}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm text-text-secondary">{title}</h3>
        <p className={`mt-1.5 text-2xl font-medium ${valueColor}`}>{value}</p>
      </div>
      {icon && <div className="text-primary opacity-80">{icon}</div>}
    </div>
  </div>
)

const getEmotionIllustration = (emotion: EmotionType) => {
  switch (emotion) {
    case 'happy':
      return <HappyIllustration />
    case 'calm':
      return <CalmIllustration />
    case 'sad':
      return <SadIllustration />
    case 'anxious':
      return <AnxiousIllustration />
    case 'angry':
      return <AngryIllustration />
    default:
      return <NeutralIllustration />
  }
}

const getEmotionName = (emotion: EmotionType): string => {
  switch (emotion) {
    case 'happy':
      return 'Feliz'
    case 'calm':
      return 'Calmo'
    case 'sad':
      return 'Triste'
    case 'anxious':
      return 'Ansioso'
    case 'angry':
      return 'Irritado'
    default:
      return 'Neutro'
  }
}

const getEmotionColor = (emotion: EmotionType): string => {
  switch (emotion) {
    case 'happy':
      return 'text-gold-500'
    case 'calm':
      return 'text-teal-700'
    case 'sad':
      return 'text-text-secondary'
    case 'anxious':
      return 'text-info'
    case 'angry':
      return 'text-error'
    default:
      return 'text-text-primary'
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [messageCount, setMessageCount] = useState<number>(0)
  const [checkinCount, setCheckinCount] = useState<number>(0)
  const [recentEmotions, setRecentEmotions] = useState<{ emotion: EmotionType, count: number }[]>([])
  const [predominantEmotion, setPredominantEmotion] = useState<{ emotion: EmotionType, count: number } | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [planProgress, setPlanProgress] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const supabase = createClientSupabaseClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      
      setUser(user)
      
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profile)
      
      // Fetch message count
      const { count: messageCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      setMessageCount(messageCount || 0)
      
      // Fetch checkin count
      const { count: checkinCount } = await supabase
        .from('emotion_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      setCheckinCount(checkinCount || 0)
      
      // Fetch emotion data
      const { data: emotionData } = await supabase
        .from('emotion_checkins')
        .select('emotion')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (emotionData && emotionData.length > 0) {
        // Count occurrences of each emotion
        const emotionCounts = emotionData.reduce((acc: any, item) => {
          const emotion = item.emotion as EmotionType
          acc[emotion] = (acc[emotion] || 0) + 1
          return acc
        }, {})
        
        // Convert to array for easy manipulation
        const emotionArray = Object.entries(emotionCounts).map(([emotion, count]) => ({
          emotion: emotion as EmotionType,
          count: count as number
        }))
        
        // Sort by count (from highest to lowest)
        emotionArray.sort((a, b) => b.count - a.count)
        
        setRecentEmotions(emotionArray)
        
        // Define predominant emotion
        if (emotionArray.length > 0) {
          setPredominantEmotion(emotionArray[0])
        }
      }
      
      // Define um valor aleatório para progresso do plano terapêutico (apenas para demonstração)
      setPlanProgress(Math.floor(Math.random() * 100))
      
      setLoading(false)
    }
    
    fetchData()
  }, [])
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-background-secondary border-t-brand"></div>
      </div>
    )
  }
  
  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }
  
  // Get first name only
  const firstName = profile?.full_name?.split(' ')[0] || 'Bem-vindo(a)'
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-xl p-6 shadow-md border border-brand/10">
        <div className="md:flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold font-georgia text-primary">{greeting()}, {firstName}</h1>
            <p className="mt-2 text-text-primary">Seu espaço para bem-estar e autoconhecimento no Equilibri.IA</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/app/chat"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium shadow-sm text-brand bg-brand/10 hover:bg-brand/20 border border-brand/20 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Conversar com Lari
            </Link>
          </div>
        </div>
      </div>
      
      {/* Apresentação da Lari */}
      <div className="bg-brand/10 rounded-xl p-6 shadow-md border border-brand/20">
        <div className="md:flex items-center">
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            <div className="h-16 w-16 rounded-full bg-brand/20 flex items-center justify-center text-brand">
              <span className="text-2xl font-medium">L</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold font-georgia text-primary">Conheça Lari, sua terapeuta digital</h2>
            <p className="mt-2 text-text-primary">
              Lari é sua assistente terapêutica baseada em IA, especializada em TCC, ACT, DBT e logoterapia. 
              Ela está aqui para ouvir suas preocupações, validar suas emoções e oferecer insights baseados em práticas terapêuticas comprovadas.
            </p>
            <div className="mt-4">
              <Link
                href="/app/chat"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium shadow-sm text-brand bg-white hover:bg-gray-50 border border-brand/20 transition-all duration-200"
              >
                Iniciar conversa
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-brand/10">
          <div className="flex items-start">
            <div className="rounded-md bg-brand/10 p-3 text-brand">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-primary">Mensagens com Lari</h3>
              <p className="mt-1 text-2xl font-semibold text-brand">{messageCount}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/app/chat" className="text-sm text-brand hover:underline">
              Conversar
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md border border-brand/10">
          <div className="flex items-start">
            <div className="rounded-md bg-brand/10 p-3 text-brand">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-primary">Check-ins Emocionais</h3>
              <p className="mt-1 text-2xl font-semibold text-brand">{checkinCount}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/app/checkin" className="text-sm text-brand hover:underline">
              Ver todos
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md border border-brand/10">
          <div className="flex items-start">
            <div className="rounded-md bg-brand/10 p-3 text-brand">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-primary">Plano Terapêutico</h3>
              <p className="mt-1 text-2xl font-semibold text-brand">{Math.round(planProgress)}%</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/app/dashboard#plan" className="text-sm text-brand hover:underline">
              Ver detalhes
            </Link>
          </div>
        </div>
      </div>
      
      {/* Ações rápidas */}
      <h2 className="text-xl font-bold text-primary pt-4">Ações rápidas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/app/chat" className="bg-white rounded-xl p-6 shadow-md border border-brand/10 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="rounded-md bg-brand/10 p-3 inline-block text-brand mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="font-medium text-primary">Chat com Lari</h3>
          <p className="mt-1 text-sm text-text-secondary">Converse com sua terapeuta digital</p>
        </Link>
        
        <Link href="/app/checkin/new" className="bg-white rounded-xl p-6 shadow-md border border-brand/10 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="rounded-md bg-brand/10 p-3 inline-block text-brand mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-medium text-primary">Novo check-in emocional</h3>
          <p className="mt-1 text-sm text-text-secondary">Registre como você está se sentindo</p>
        </Link>
        
        <Link href="/app/agenda" className="bg-white rounded-xl p-6 shadow-md border border-brand/10 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="rounded-md bg-brand/10 p-3 inline-block text-brand mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-medium text-primary">Agendar Sessão</h3>
          <p className="mt-1 text-sm text-text-secondary">Marque sua sessão com psicóloga</p>
        </Link>
      </div>
    </div>
  )
}
