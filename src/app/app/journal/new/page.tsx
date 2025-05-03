'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createClientSupabaseClient, createJournalEntry, checkJournalEntryLimit, checkUserAuthentication } from '@/lib/supabase/client-queries'
import { useUser } from '@clerk/nextjs'

export default function JournalEntryPage() {
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [moodScore, setMoodScore] = useState<number>(5)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState<boolean>(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const { user: clerkUser, isLoaded: isClerkUserLoaded } = useUser()
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user, error } = await checkUserAuthentication()
        
        if (error) {
          console.error('Erro ao verificar autenticação:', error)
          setError('Erro de autenticação. Por favor, faça login novamente.')
          
          // Redirecionar após um curto delay para que o usuário veja a mensagem
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
          
          return
        }
        
        if (!user) {
          setError('Sessão expirada. Por favor, faça login novamente.')
          
          // Redirecionar após um curto delay para que o usuário veja a mensagem
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
          
          return
        }
        
        setUserId(user.id)
        
        // Verificar se o perfil existe
        const supabase = createClientSupabaseClient()
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        // Se o perfil não existir, cria um novo
        if (!profileData && clerkUser && isClerkUserLoaded) {
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name: clerkUser.fullName || '',
              email: clerkUser.primaryEmailAddress?.emailAddress || '',
              subscription_tier: 'free'
            })
            .select()
            .single()
          
          if (profileError) {
            console.error('Erro ao criar perfil:', profileError)
            setError('Erro ao criar perfil de usuário. Por favor, tente novamente.')
            return
          }
        }
        
        // Verificar limite de entradas
        const { limitReached } = await checkJournalEntryLimit()
        setLimitReached(limitReached)
      } catch (error) {
        console.error('Erro ao inicializar página:', error)
        setError('Erro ao carregar dados do usuário. Por favor, recarregue a página.')
      }
    }
    
    if (isClerkUserLoaded) {
    fetchUser()
    }
  }, [clerkUser, isClerkUserLoaded])
  
  // Ajustar altura do textarea automaticamente
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto'
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`
    }
  }, [content])
  
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value)
  }
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }
  
  const analyzeContent = async () => {
    if (!content.trim()) {
      setError('Por favor, escreva algo para analisar.')
      return
    }
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (data.limitReached) {
          setLimitReached(true)
        } else {
          throw new Error(data.error || 'Erro ao analisar conteúdo')
        }
      } else {
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error('Error analyzing content:', error)
      setError('Ocorreu um erro ao analisar o conteúdo. Por favor, tente novamente.')
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('Por favor, escreva algo para salvar.')
      return
    }
    
    // Verificar novamente o limite antes de enviar
    try {
      const { limitReached: currentLimitReached, error: limitError } = await checkJournalEntryLimit()
      
      if (limitError) {
        setError(`Erro ao verificar limite: ${limitError}`)
        return
      }
      
      if (currentLimitReached) {
        setLimitReached(true)
        setError('Você atingiu o limite de entradas de diário para o plano gratuito.')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
      if (!userId) {
        setError('Sessão expirada. Por favor, faça login novamente.')
        setIsSubmitting(false)
        return
      }
      
      // Analisar o conteúdo se ainda não foi analisado
      if (!analysis && !limitReached) {
        try {
        await analyzeContent()
        } catch (analysisError: any) {
          console.warn('Erro ao analisar conteúdo, continuando sem análise:', analysisError)
          // Continuar sem análise, não impedir a criação da entrada
        }
      }
      
      const entryData = {
        user_id: userId,
        title: title.trim() || 'Sem título',
        content: content.trim(),
        mood_score: moodScore,
        tags: tags.length > 0 ? tags : null,
        analysis: analysis || null,
        is_favorite: false
      }
      
      const { data, error } = await createJournalEntry(entryData)
      
      if (error) {
        throw new Error(error)
      }
      
      if (!data || !data.id) {
        throw new Error('Entrada criada, mas ID não foi retornado')
      }
      
      // Redirecionar para a página de visualização da entrada
      window.location.href = `/app/journal/${data.id}`
    } catch (error: any) {
      console.error('Erro ao criar entrada de diário:', error)
      setError(`Erro ao salvar: ${error.message || 'Ocorreu um erro ao salvar a entrada. Por favor, tente novamente.'}`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Nova Entrada de Diário</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => window.location.href = '/app/journal'}
            className="px-4 py-2 border border-border rounded-md text-text-secondary hover:bg-background-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-error-light text-error rounded-md">
          {error}
        </div>
      )}
      
      {limitReached && (
        <div className="mb-4 p-4 bg-warning-light border border-warning text-warning-dark rounded-md">
          <h3 className="font-semibold">Limite de entradas atingido</h3>
          <p className="mt-1">Você atingiu o limite de entradas de diário para o plano gratuito. Faça upgrade para o plano Premium para continuar usando a análise terapêutica.</p>
          <a 
            href="/app/upgrade" 
            className="mt-2 inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
          >
            Fazer Upgrade
          </a>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">
            Título (opcional)
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Dê um título para esta entrada"
            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-text-secondary mb-1">
            Conteúdo
          </label>
          <textarea
            ref={contentRef}
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Como você está se sentindo hoje? O que aconteceu? Quais pensamentos e emoções você está experimentando?"
            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[200px]"
            rows={8}
          />
        </div>
        
        <div>
          <label htmlFor="mood" className="block text-sm font-medium text-text-secondary mb-1">
            Humor (1-10)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              id="mood"
              min="1"
              max="10"
              value={moodScore}
              onChange={(e) => setMoodScore(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-medium text-text-primary w-8 text-center">{moodScore}</span>
          </div>
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>Muito mal</span>
            <span>Neutro</span>
            <span>Muito bem</span>
          </div>
        </div>
        
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-text-secondary mb-1">
            Tags (opcional)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-text-primary"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-text-secondary hover:text-text-primary focus:outline-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagInputKeyDown}
            placeholder="Adicione tags e pressione Enter"
            className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="pt-4 border-t border-border">
          <button
            type="button"
            onClick={analyzeContent}
            disabled={isAnalyzing || !content.trim() || limitReached}
            className="w-full px-4 py-3 bg-secondary text-white rounded-md hover:bg-secondary-light transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analisando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Analisar Conteúdo
              </>
            )}
          </button>
          <p className="mt-2 text-xs text-text-secondary text-center">
            A análise terapêutica ajuda a identificar padrões emocionais e sugerir técnicas úteis.
          </p>
        </div>
        
        {analysis && (
          <div className="mt-6 p-4 bg-background-secondary rounded-md">
            <h3 className="font-semibold text-text-primary mb-2">Análise Terapêutica</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-text-secondary">Emoções Identificadas</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {analysis.emotions?.map((emotion: string) => (
                    <span 
                      key={emotion} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
              
              {analysis.cognitiveDistortions?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-text-secondary">Possíveis Distorções Cognitivas</h4>
                  <ul className="mt-1 space-y-1 text-sm">
                    {analysis.cognitiveDistortions.map((distortion: any, index: number) => (
                      <li key={index} className="text-text-primary">
                        <span className="font-medium">{distortion.name}:</span> {distortion.explanation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysis.techniques?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-text-secondary">Técnicas Recomendadas</h4>
                  <ul className="mt-1 space-y-1 text-sm">
                    {analysis.techniques.map((technique: string, index: number) => (
                      <li key={index} className="text-text-primary">{technique}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysis.perspective && (
                <div>
                  <h4 className="text-sm font-medium text-text-secondary">Perspectiva Alternativa</h4>
                  <p className="mt-1 text-sm text-text-primary">{analysis.perspective}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
