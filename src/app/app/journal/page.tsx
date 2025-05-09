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
        <h1 className="text-3xl font-bold font-georgia text-primary">Meu Diário</h1>
        <div className="flex gap-2">
          <Link href="/app/chat" className="inline-flex items-center px-4 py-2.5 rounded-xl font-medium shadow-sm text-brand bg-brand/10 hover:bg-brand/20 border border-brand/20 transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Conversar com Lari
          </Link>
          <Link 
            href="/app/journal/new" 
            className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium shadow-md text-white bg-brand hover:bg-brand/90 border border-brand/20 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Nova Entrada
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm border border-brand/20 text-text-primary">
        <div className="flex items-start">
          <div className="h-10 w-10 rounded-full bg-brand/20 flex-shrink-0 flex items-center justify-center text-brand">
            <span className="font-medium">L</span>
          </div>
          <div className="ml-4">
            <p className="font-medium text-primary">Dica da Lari</p>
            <p className="mt-1 text-sm">
              Escrever regularmente no diário ajuda a organizar pensamentos e processar emoções. 
              Tente registrar não apenas os eventos, mas também como você se sentiu e o que pensou sobre eles.
            </p>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-background-secondary border-t-brand"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-xl p-10 shadow-md border border-brand/10 text-center">
          <div className="mx-auto h-24 w-24 text-brand opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold font-georgia text-primary">Nenhuma entrada encontrada</h3>
          <p className="mt-2 text-text-primary opacity-80">Comece criando sua primeira entrada no diário.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app/journal/new"
              className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium shadow-md text-white bg-brand hover:bg-brand/90 border border-brand/20 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Criar primeira entrada
            </Link>
            <Link
              href="/app/chat"
              className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium shadow-md text-brand bg-brand/10 hover:bg-brand/20 border border-brand/20 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Conversar com Lari
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Link 
              key={entry.id} 
              href={`/app/journal/${entry.id}`}
              className="block bg-white rounded-xl p-6 shadow-md border border-brand/10 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold font-georgia text-primary mb-2">{entry.title}</h2>
                  <p className="text-text-primary opacity-80 line-clamp-2 mb-3">{entry.content}</p>
                  <div className="text-sm text-text-secondary">
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