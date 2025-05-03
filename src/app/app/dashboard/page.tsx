'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'
import { HappyIllustration, CalmIllustration, SadIllustration, AnxiousIllustration, AngryIllustration, NeutralIllustration } from '@/components/ui/illustrations'
import { Emotion } from '@/types/database'

interface DashboardCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  className?: string
}

const DashboardCard = ({ title, value, icon, className = '' }: DashboardCardProps) => (
  <div className={`bg-background rounded-lg p-6 shadow-sm ${className}`}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        <p className="mt-2 text-3xl font-semibold text-text-primary">{value}</p>
      </div>
      {icon && <div className="text-primary">{icon}</div>}
    </div>
  </div>
)

export default function DashboardPage() {
  const { user, isLoaded: userLoaded } = useUser()
  const [profile, setProfile] = useState<any>(null)
  const [journalCount, setJournalCount] = useState<number>(0)
  const [audioCount, setAudioCount] = useState<number>(0)
  const [checkinCount, setCheckinCount] = useState<number>(0)
  const [recentEmotions, setRecentEmotions] = useState<{emotion: Emotion, count: number}[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  
  useEffect(() => {
    // Só continuar se o usuário estiver carregado
    if (!userLoaded) return
    
    const fetchDashboardData = async () => {
      setLoading(true)
      const supabase = createClientSupabaseClient()
      
      try {
        if (!user) {
          setLoading(false)
          return
        }
        
        // Usar ID do usuário do Clerk
        const userId = user.id
        
        // Buscar perfil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        } else {
          // Criar perfil se não existir
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: user.fullName || '',
              email: user.primaryEmailAddress?.emailAddress || '',
              subscription_tier: 'free'
            })
            .select()
            .single()
          
          setProfile(newProfile)
        }
        
        // Buscar contagem de entradas de diário
        const { count: journalCountData } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
        
        setJournalCount(journalCountData || 0)
        
        // Buscar contagem de entradas de áudio
        const { count: audioCountData } = await supabase
          .from('audio_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
        
        setAudioCount(audioCountData || 0)
        
        // Buscar contagem de check-ins emocionais
        const { count: checkinCountData } = await supabase
          .from('emotion_checkins')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
        
        setCheckinCount(checkinCountData || 0)
        
        // Buscar emoções recentes
        const { data: recentEmotionsData } = await supabase
          .from('emotion_checkins')
          .select('emotion')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (recentEmotionsData && recentEmotionsData.length > 0) {
          // Contar ocorrências de cada emoção
          const emotionCounts: Record<string, number> = {}
          
          recentEmotionsData.forEach(item => {
            const emotion = item.emotion as Emotion
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
          })
          
          // Converter para array e ordenar
          const emotionsArray = Object.entries(emotionCounts).map(([emotion, count]) => ({
            emotion: emotion as Emotion,
            count
          }))
          
          emotionsArray.sort((a, b) => b.count - a.count)
          
          setRecentEmotions(emotionsArray)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [user, userLoaded])
  
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
      case 'neutral':
        return <NeutralIllustration />
      default:
        return <NeutralIllustration />
    }
  }
  
  const getEmotionName = (emotion: Emotion) => {
    const emotionNames: Record<Emotion, string> = {
      happy: 'Feliz',
      calm: 'Calmo',
      sad: 'Triste',
      anxious: 'Ansioso',
      angry: 'Irritado',
      neutral: 'Neutro'
    }
    
    return emotionNames[emotion] || emotion
  }
  
  const getPredominantEmotion = () => {
    if (recentEmotions.length === 0) return null
    return recentEmotions[0]
  }
  
  const predominantEmotion = getPredominantEmotion()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary">
          {profile?.subscription_tier === 'premium' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success text-white">
              Premium
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-border text-text-secondary">
              Gratuito
            </span>
          )}
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardCard 
              title="Entradas de Diário" 
              value={journalCount}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />
            <DashboardCard 
              title="Entradas de Áudio" 
              value={audioCount}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              }
            />
            <DashboardCard 
              title="Check-ins Emocionais" 
              value={checkinCount}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emoção Predominante */}
            {predominantEmotion && (
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-text-primary mb-4">Emoção Predominante Recente</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24">
                    {getEmotionIllustration(predominantEmotion.emotion)}
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-text-primary">{getEmotionName(predominantEmotion.emotion)}</p>
                    <p className="text-text-secondary">
                      {predominantEmotion.count} de {recentEmotions.reduce((sum, e) => sum + e.count, 0)} check-ins recentes
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Limites de Uso */}
            {profile?.subscription_tier === 'free' && (
              <div className="bg-background rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-text-primary mb-4">Limites do Plano Gratuito</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-text-secondary">Entradas de Diário</span>
                      <span className="text-sm font-medium text-text-primary">{journalCount}/50</span>
                    </div>
                    <div className="w-full bg-background-secondary rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2" 
                        style={{ width: `${Math.min(100, (journalCount / 50) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-text-secondary">Entradas de Áudio</span>
                      <span className="text-sm font-medium text-text-primary">{audioCount}/2</span>
                    </div>
                    <div className="w-full bg-background-secondary rounded-full h-2">
                      <div 
                        className={`${audioCount >= 2 ? 'bg-error' : 'bg-primary'} rounded-full h-2`}
                        style={{ width: `${Math.min(100, (audioCount / 2) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <a 
                      href="/app/upgrade" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Fazer Upgrade para Premium
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Ações Rápidas */}
          <div className="bg-background rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-text-primary mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a 
                href="/app/journal/new" 
                className="flex flex-col items-center justify-center p-4 bg-background-secondary rounded-lg hover:bg-border transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-sm font-medium text-text-primary">Nova Entrada</span>
              </a>
              
              <a 
                href="/app/checkin/new" 
                className="flex flex-col items-center justify-center p-4 bg-background-secondary rounded-lg hover:bg-border transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-text-primary">Check-in</span>
              </a>
              
              <a 
                href="/app/audio/new" 
                className="flex flex-col items-center justify-center p-4 bg-background-secondary rounded-lg hover:bg-border transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="text-sm font-medium text-text-primary">Gravar Áudio</span>
              </a>
              
              <a 
                href="/app/reports/generate" 
                className="flex flex-col items-center justify-center p-4 bg-background-secondary rounded-lg hover:bg-border transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-text-primary">Gerar Relatório</span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
