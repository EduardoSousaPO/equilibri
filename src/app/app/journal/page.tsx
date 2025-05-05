'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'

interface JournalEntry {
  id: string
  title: string | null
  content: string
  user_id: string
  created_at: string
  updated_at: string
  mood_score: number | null
  analysis: any
  is_favorite: boolean
  tags: string[] | null
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true)
      const supabase = createClientSupabaseClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }
      
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (data) {
        setEntries(data as JournalEntry[])
      }
      
      setLoading(false)
    }
    
    fetchEntries()
  }, [])
  
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }
  
  function getMoodEmoji(moodScore: number | null) {
    if (moodScore === null) return '📝'
    
    if (moodScore >= 8) return '😊' // happy
    if (moodScore >= 6) return '😌' // calm
    if (moodScore >= 4) return '😐' // neutral
    if (moodScore >= 2) return '😔' // sad
    if (moodScore >= 0) return '😠' // angry
    
    return '📝'
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-georgia text-teal-900">Meu Diário</h1>
        <Link 
          href="/app/journal/new" 
          className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium shadow-md text-white bg-teal-900 hover:bg-teal-800 border border-gold-500/20 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Nova Entrada
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cream-100 border-t-teal-900"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-xl p-10 shadow-md border border-gold-500/10 text-center">
          <div className="mx-auto h-24 w-24 text-teal-800 opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold font-georgia text-teal-900">Nenhuma entrada encontrada</h3>
          <p className="mt-2 text-teal-800 opacity-80">Comece criando sua primeira entrada no diário.</p>
          <div className="mt-6">
            <Link
              href="/app/journal/new"
              className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium shadow-md text-white bg-teal-900 hover:bg-teal-800 border border-gold-500/20 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Criar primeira entrada
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Link 
              key={entry.id} 
              href={`/app/journal/${entry.id}`}
              className="block bg-white rounded-xl p-6 shadow-md border border-gold-500/10 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold font-georgia text-teal-900 mb-2">{entry.title}</h2>
                  <p className="text-teal-800 opacity-80 line-clamp-2 mb-3">{entry.content}</p>
                  <div className="text-sm text-teal-800 opacity-70">
                    {formatDate(entry.created_at)}
                  </div>
                </div>
                <div className="text-2xl" title={entry.mood_score?.toString()}>
                  {getMoodEmoji(entry.mood_score)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 