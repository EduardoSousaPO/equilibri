'use client'

import React, { useState, useEffect } from 'react'
import { createClientSupabaseClient, createEmotionCheckin } from '@/lib/supabase/client-queries'
import { HappyIllustration, CalmIllustration, SadIllustration, AnxiousIllustration, AngryIllustration, NeutralIllustration } from '@/components/ui/illustrations'
import { Emotion } from '@/types/database'

interface EmotionOption {
  value: Emotion
  label: string
  illustration: React.ReactNode
  color: string
}

export default function CheckinPage() {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null)
  const [intensity, setIntensity] = useState<number>(3)
  const [note, setNote] = useState<string>('')
  const [triggers, setTriggers] = useState<string[]>([])
  const [triggerInput, setTriggerInput] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClientSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    
    fetchUser()
  }, [])
  
  const emotionOptions: EmotionOption[] = [
    {
      value: 'happy',
      label: 'Feliz',
      illustration: <HappyIllustration />,
      color: 'bg-success-light border-success text-success'
    },
    {
      value: 'calm',
      label: 'Calmo',
      illustration: <CalmIllustration />,
      color: 'bg-info-light border-info text-info'
    },
    {
      value: 'neutral',
      label: 'Neutro',
      illustration: <NeutralIllustration />,
      color: 'bg-background-secondary border-border text-text-secondary'
    },
    {
      value: 'sad',
      label: 'Triste',
      illustration: <SadIllustration />,
      color: 'bg-primary-light border-primary text-primary'
    },
    {
      value: 'anxious',
      label: 'Ansioso',
      illustration: <AnxiousIllustration />,
      color: 'bg-warning-light border-warning text-warning'
    },
    {
      value: 'angry',
      label: 'Irritado',
      illustration: <AngryIllustration />,
      color: 'bg-error-light border-error text-error'
    }
  ]
  
  const handleTriggerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTriggerInput(e.target.value)
  }
  
  const handleTriggerInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && triggerInput.trim()) {
      e.preventDefault()
      if (!triggers.includes(triggerInput.trim())) {
        setTriggers([...triggers, triggerInput.trim()])
      }
      setTriggerInput('')
    }
  }
  
  const removeTrigger = (triggerToRemove: string) => {
    setTriggers(triggers.filter(trigger => trigger !== triggerToRemove))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedEmotion) {
      setError('Por favor, selecione uma emoção.')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      if (!userId) {
        throw new Error('Usuário não autenticado')
      }
      
      const { error } = await createEmotionCheckin({
        user_id: userId,
        emotion: selectedEmotion,
        intensity,
        note: note.trim() || null,
        triggers: triggers.length > 0 ? triggers : null
      })
      
      if (error) {
        throw new Error(error)
      }
      
      setSuccess(true)
      
      // Limpar o formulário
      setSelectedEmotion(null)
      setIntensity(3)
      setNote('')
      setTriggers([])
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = '/app/checkin'
      }, 2000)
    } catch (error) {
      console.error('Error creating emotion checkin:', error)
      setError('Ocorreu um erro ao salvar o check-in. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Novo Check-in Emocional</h1>
        <button
          type="button"
          onClick={() => window.location.href = '/app/checkin'}
          className="px-4 py-2 border border-border rounded-md text-text-secondary hover:bg-background-secondary transition-colors"
        >
          Voltar
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-error-light text-error rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-success-light text-success rounded-md">
          Check-in emocional registrado com sucesso! Redirecionando...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Como você está se sentindo agora?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {emotionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedEmotion(option.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedEmotion === option.value
                    ? `${option.color} border-2`
                    : 'bg-background border-border hover:border-text-secondary'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 mb-2">
                    {option.illustration}
                  </div>
                  <span className="font-medium">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {selectedEmotion && (
          <>
            <div>
              <label htmlFor="intensity" className="block text-sm font-medium text-text-secondary mb-1">
                Intensidade
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  id="intensity"
                  min="1"
                  max="5"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-lg font-medium text-text-primary w-8 text-center">{intensity}</span>
              </div>
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>Leve</span>
                <span>Moderada</span>
                <span>Intensa</span>
              </div>
            </div>
            
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-text-secondary mb-1">
                Observação (opcional)
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Descreva brevemente o que está acontecendo..."
                className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
            
            <div>
              <label htmlFor="triggers" className="block text-sm font-medium text-text-secondary mb-1">
                Gatilhos (opcional)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {triggers.map(trigger => (
                  <span 
                    key={trigger} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-secondary text-text-primary"
                  >
                    {trigger}
                    <button
                      type="button"
                      onClick={() => removeTrigger(trigger)}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-text-secondary hover:text-text-primary focus:outline-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                id="triggers"
                value={triggerInput}
                onChange={handleTriggerInputChange}
                onKeyDown={handleTriggerInputKeyDown}
                placeholder="O que desencadeou esta emoção? Pressione Enter para adicionar"
                className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !selectedEmotion}
                className="w-full px-4 py-3 bg-primary text-white rounded-md hover:bg-primary-light transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : 'Registrar Check-in'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
