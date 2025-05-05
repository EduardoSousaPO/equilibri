'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'

interface AudioEntry {
  id: string
  title: string | null
  audio_url: string
  transcription: string | null
  duration: number | null
  user_id: string
  created_at: string
  updated_at: string
  mood_score: number | null
  analysis: any
  is_favorite: boolean
  tags: string[] | null
}

export default function AudioPage() {
  const [audioEntries, setAudioEntries] = useState<AudioEntry[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchAudioEntries = async () => {
      setLoading(true)
      const supabase = createClientSupabaseClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }
      
      const { data } = await supabase
        .from('audio_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (data) {
        setAudioEntries(data as AudioEntry[])
      }
      
      setLoading(false)
    }
    
    fetchAudioEntries()
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
  
  function formatDuration(seconds: number | null) {
    if (!seconds) return '00:00'
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-georgia text-teal-900">Diário em Áudio</h1>
        <Link 
          href="/app/audio/new" 
          className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium shadow-md text-white bg-teal-900 hover:bg-teal-800 border border-gold-500/20 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
          Gravar Áudio
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cream-100 border-t-teal-900"></div>
        </div>
      ) : audioEntries.length === 0 ? (
        <div className="bg-white rounded-xl p-10 shadow-md border border-gold-500/10 text-center">
          <div className="mx-auto h-24 w-24 text-teal-800 opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold font-georgia text-teal-900">Nenhuma gravação encontrada</h3>
          <p className="mt-2 text-teal-800 opacity-80">Grave seus pensamentos em áudio para transcrição e análise.</p>
          <div className="mt-6">
            <Link
              href="/app/audio/new"
              className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium shadow-md text-white bg-teal-900 hover:bg-teal-800 border border-gold-500/20 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              Gravar primeiro áudio
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {audioEntries.map((entry) => (
            <Link 
              key={entry.id}
              href={`/app/audio/${entry.id}`}
              className="block bg-white rounded-xl p-6 shadow-md border border-gold-500/10 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold font-georgia text-teal-900 mb-2">
                    {entry.title || 'Gravação sem título'}
                  </h2>
                  {entry.transcription && (
                    <p className="text-teal-800 opacity-80 line-clamp-2 mb-3">{entry.transcription}</p>
                  )}
                  <div className="flex items-center text-sm text-teal-800 opacity-70">
                    <span className="mr-4">{formatDate(entry.created_at)}</span>
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {formatDuration(entry.duration)}
                    </span>
                  </div>
                </div>
                <div className="text-teal-900 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 