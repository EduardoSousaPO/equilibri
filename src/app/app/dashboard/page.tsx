'use client'

import React, { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'
import { HappyIllustration, CalmIllustration, SadIllustration, AnxiousIllustration, AngryIllustration, NeutralIllustration } from '@/components/ui/illustrations'
import { Emotion } from '@/types/database'
import Link from 'next/link'

interface DashboardCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
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

const getEmotionIllustration = (emotion: Emotion) => {
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

const getEmotionName = (emotion: Emotion): string => {
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

const getEmotionColor = (emotion: Emotion): string => {
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
  const [journalCount, setJournalCount] = useState<number>(0)
  const [audioCount, setAudioCount] = useState<number>(0)
  const [checkinCount, setCheckinCount] = useState<number>(0)
  const [recentEmotions, setRecentEmotions] = useState<{ emotion: Emotion, count: number }[]>([])
  const [predominantEmotion, setPredominantEmotion] = useState<{ emotion: Emotion, count: number } | null>(null)
  const [recentJournalEntries, setRecentJournalEntries] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [planLimit, setPlanLimit] = useState<{
    journalLimit: number,
    journalUsed: number,
    audioLimit: number,
    audioUsed: number
  }>({
    journalLimit: 50,
    journalUsed: 0,
    audioLimit: 10,
    audioUsed: 0
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      const supabase = createClientSupabaseClient()
      
      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }
      
      setUser(user)
      
      try {
        // Buscar perfil para verificar plano
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        const isPremium = profile?.subscription_tier === 'premium'
        
        // Definir limites com base no plano
        setPlanLimit({
          journalLimit: isPremium ? 1000 : 50,
          journalUsed: 0,
          audioLimit: isPremium ? 100 : 10,
          audioUsed: 0
        })
        
        // Buscar contagem de entradas de diário
        const { count: journalCount } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        
        setJournalCount(journalCount || 0)
        
        if (!isPremium) {
          setPlanLimit(prev => ({
            ...prev,
            journalUsed: journalCount || 0
          }))
        }
        
        // Buscar contagem de entradas de áudio
        const { count: audioCount } = await supabase
          .from('audio_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        
        setAudioCount(audioCount || 0)
        
        if (!isPremium) {
          setPlanLimit(prev => ({
            ...prev,
            audioUsed: audioCount || 0
          }))
        }
        
        // Buscar contagem de check-ins emocionais
        const { count: checkinCount } = await supabase
          .from('emotion_checkins')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        
        setCheckinCount(checkinCount || 0)
        
        // Buscar emoções recentes para estatísticas
        const { data: emotionData } = await supabase
          .from('emotion_checkins')
          .select('emotion')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (emotionData && emotionData.length > 0) {
          // Contar ocorrências de cada emoção
          const emotionCounts = emotionData.reduce((acc: any, item) => {
            const emotion = item.emotion as Emotion
            acc[emotion] = (acc[emotion] || 0) + 1
            return acc
          }, {})
          
          // Converter para array para fácil manipulação
          const emotionArray = Object.entries(emotionCounts).map(([emotion, count]) => ({
            emotion: emotion as Emotion,
            count: count as number
          }))
          
          // Ordenar por contagem (do maior para o menor)
          emotionArray.sort((a, b) => b.count - a.count)
          
          setRecentEmotions(emotionArray)
          
          // Definir emoção predominante
          if (emotionArray.length > 0) {
            setPredominantEmotion(emotionArray[0])
          }
        }
        
        // Buscar entradas de diário recentes
        const { data: journalEntries } = await supabase
          .from('journal_entries')
          .select('id, title, content, created_at, mood_score, is_favorite')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)
        
        setRecentJournalEntries(journalEntries || [])
        
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cream-100 border-t-primary"></div>
      </div>
    )
  }
  
  // Calcular porcentagem de uso do plano
  const journalPercentage = Math.min(100, (planLimit.journalUsed / planLimit.journalLimit) * 100)
  const audioPercentage = Math.min(100, (planLimit.audioUsed / planLimit.audioLimit) * 100)
  
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-text-primary mb-1">Bem-vindo de volta</h1>
        <p className="text-text-secondary">Seu espaço para bem-estar e autoconhecimento</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <DashboardCard 
          title="Entradas de Diário" 
          value={journalCount}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />
        <DashboardCard 
          title="Entradas de Áudio" 
          value={audioCount}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          }
        />
        <DashboardCard 
          title="Check-ins Emocionais" 
          value={checkinCount}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Emoção Predominante */}
        {predominantEmotion && (
          <div className="bg-background rounded-md p-5 shadow-sm border border-border">
            <h2 className="text-lg font-medium text-text-primary mb-4">Emoção Predominante</h2>
            <div className="flex items-center space-x-5">
              <div className="w-20 h-20 transform transition-transform duration-300 hover:scale-105">
                {getEmotionIllustration(predominantEmotion.emotion)}
              </div>
              <div>
                <p className={`text-xl font-medium ${getEmotionColor(predominantEmotion.emotion)}`}>
                  {getEmotionName(predominantEmotion.emotion)}
                </p>
                <p className="text-text-secondary mt-1">
                  {predominantEmotion.count} de {recentEmotions.reduce((sum, e) => sum + e.count, 0)} check-ins recentes
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Limites de Uso */}
        <div className="bg-background rounded-md p-5 shadow-sm border border-border">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-medium text-text-primary">Limites do Plano</h2>
            <Link 
              href="/app/upgrade"
              className="text-sm text-primary hover:underline"
            >
              Upgrade
            </Link>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Entradas de Diário</span>
                <span className="text-text-primary">{planLimit.journalUsed}/{planLimit.journalLimit}</span>
              </div>
              <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${journalPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Entradas de Áudio</span>
                <span className="text-text-primary">{planLimit.audioUsed}/{planLimit.audioLimit}</span>
              </div>
              <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${audioPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Entradas Recentes */}
      {recentJournalEntries.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-text-primary">Entradas Recentes</h2>
            <Link 
              href="/app/journal"
              className="text-sm text-primary hover:underline"
            >
              Ver todas
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentJournalEntries.map((entry) => (
              <Link
                key={entry.id}
                href={`/app/journal/${entry.id}`}
                className="block bg-background rounded-md p-4 border border-border hover:shadow-sm transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-text-primary">
                      {entry.title || 'Sem título'}
                      {entry.is_favorite && <span className="ml-2 text-accent">★</span>}
                    </h3>
                    <p className="mt-1 text-text-secondary text-sm line-clamp-1">
                      {entry.content}
                    </p>
                  </div>
                  <div className="text-xs text-text-secondary">
                    {formatDate(entry.created_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* CTA para primeira entrada */}
      {recentJournalEntries.length === 0 && journalCount === 0 && (
        <div className="bg-primary-ultra-light rounded-md p-6 text-center">
          <h2 className="text-lg font-medium text-primary mb-2">Comece seu Diário Terapêutico</h2>
          <p className="text-text-secondary mb-4">Registre seus pensamentos e emoções para acompanhar sua jornada de bem-estar.</p>
          <Link 
            href="/app/journal/new" 
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            Nova Entrada
          </Link>
        </div>
      )}
    </>
  )
}
