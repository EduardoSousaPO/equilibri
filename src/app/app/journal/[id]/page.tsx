'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getJournalEntryById } from '@/lib/supabase/client-queries'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function JournalEntryViewPage() {
  const params = useParams()
  const router = useRouter()
  const [entry, setEntry] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchEntry = async () => {
      if (!params.id) {
        setError('ID da entrada não encontrado')
        setLoading(false)
        return
      }
      
      try {
        const { data, error } = await getJournalEntryById(params.id as string)
        
        if (error) {
          setError(error)
          setLoading(false)
          return
        }
        
        if (!data) {
          setError('Entrada não encontrada')
          setLoading(false)
          return
        }
        
        setEntry(data)
      } catch (error: any) {
        console.error('Erro ao buscar entrada:', error)
        setError('Erro ao carregar entrada. Por favor, tente novamente.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchEntry()
  }, [params.id])
  
  const handleBack = () => {
    router.push('/app/journal')
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
      locale: ptBR
    })
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-error-light text-error rounded-md p-4 mb-4">
          {error}
        </div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
        >
          Voltar para o diário
        </button>
      </div>
    )
  }
  
  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-warning-light text-warning-dark rounded-md p-4 mb-4">
          Entrada não encontrada.
        </div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
        >
          Voltar para o diário
        </button>
      </div>
    )
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary truncate">{entry.title}</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-border rounded-md text-text-secondary hover:bg-background-secondary transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={() => router.push(`/app/journal/${entry.id}/edit`)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
          >
            Editar
          </button>
        </div>
      </div>
      
      <div className="mb-6 text-sm text-text-secondary">
        <time dateTime={entry.created_at} title={formatDate(entry.created_at)}>
          {getTimeAgo(entry.created_at)}
        </time>
        {entry.created_at !== entry.updated_at && (
          <span title={`Editado em ${formatDate(entry.updated_at)}`}> (editado)</span>
        )}
      </div>
      
      <div className="prose prose-sm prose-text-primary max-w-none mb-8 whitespace-pre-wrap">
        {entry.content}
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center">
          <span className="text-sm font-medium text-text-secondary mr-2">Humor:</span>
          <div className="flex items-center">
            <span className="text-lg font-medium text-text-primary">{entry.mood_score}</span>
            <span className="text-xs text-text-secondary ml-1">/10</span>
          </div>
        </div>
        
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag: string) => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {entry.analysis && (
        <div className="mt-8 p-4 bg-background-secondary rounded-md">
          <h3 className="font-semibold text-text-primary mb-2">Análise Terapêutica</h3>
          
          <div className="space-y-4">
            {entry.analysis.emotions && entry.analysis.emotions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary">Emoções Identificadas</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {entry.analysis.emotions.map((emotion: string) => (
                    <span 
                      key={emotion} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {entry.analysis.cognitiveDistortions && entry.analysis.cognitiveDistortions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary">Possíveis Distorções Cognitivas</h4>
                <ul className="mt-1 space-y-1 text-sm">
                  {entry.analysis.cognitiveDistortions.map((distortion: any, index: number) => (
                    <li key={index} className="text-text-primary">
                      <span className="font-medium">{distortion.name}:</span> {distortion.explanation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {entry.analysis.techniques && entry.analysis.techniques.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary">Técnicas Recomendadas</h4>
                <ul className="mt-1 space-y-1 text-sm">
                  {entry.analysis.techniques.map((technique: string, index: number) => (
                    <li key={index} className="text-text-primary">{technique}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {entry.analysis.perspective && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary">Perspectiva Alternativa</h4>
                <p className="mt-1 text-sm text-text-primary">{entry.analysis.perspective}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 