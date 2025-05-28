'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'

interface CheckIn {
  id: string
  emotion: string
  note: string | null
  user_id: string
  created_at: string
  intensity: number
  triggers: string[] | null
}

export default function CheckinPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchCheckIns = async () => {
      setLoading(true)
      const supabase = createClientSupabaseClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }
      
      const { data } = await supabase
        .from('emotion_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (data) {
        setCheckIns(data as CheckIn[])
      }
      
      setLoading(false)
    }
    
    fetchCheckIns()
  }, [])
  
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  function getEmotionEmoji(emotion: string) {
    switch (emotion) {
      case 'happy': return '😊'
      case 'calm': return '😌'
      case 'sad': return '😔'
      case 'anxious': return '😰'
      case 'angry': return '😠'
      case 'neutral': return '😐'
      default: return '📝'
    }
  }
  
  function getEmotionName(emotion: string) {
    switch (emotion) {
      case 'happy': return 'Feliz'
      case 'calm': return 'Calmo'
      case 'sad': return 'Triste'
      case 'anxious': return 'Ansioso'
      case 'angry': return 'Irritado'
      case 'neutral': return 'Neutro'
      default: return emotion
    }
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-georgia text-teal-900">Check-in Emocional</h1>
        <Link 
          href="/app/checkin/new" 
          className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium shadow-md text-white bg-teal-900 hover:bg-teal-800 border border-gold-500/20 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Novo Check-in
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cream-100 border-t-teal-900"></div>
        </div>
      ) : checkIns.length === 0 ? (
        <div className="bg-white rounded-xl p-10 shadow-md border border-gold-500/10 text-center">
          <div className="mx-auto h-24 w-24 text-teal-800 opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold font-georgia text-teal-900">Nenhum check-in registrado</h3>
          <p className="mt-2 text-teal-800 opacity-80">Acompanhe seu estado emocional com check-ins regulares.</p>
          <div className="mt-6">
            <Link
              href="/app/checkin/new"
              className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium shadow-md text-white bg-teal-900 hover:bg-teal-800 border border-gold-500/20 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Fazer primeiro check-in
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {checkIns.map((checkIn) => (
            <div 
              key={checkIn.id}
              className="block bg-white rounded-xl p-6 shadow-md border border-gold-500/10 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{getEmotionEmoji(checkIn.emotion)}</span>
                    <h2 className="text-xl font-bold font-georgia text-teal-900">
                      {getEmotionName(checkIn.emotion)}
                    </h2>
                  </div>
                  {checkIn.note && (
                    <p className="text-teal-800 opacity-80 mb-3">{checkIn.note}</p>
                  )}
                  <div className="text-sm text-teal-800 opacity-70">
                    {formatDate(checkIn.created_at)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 