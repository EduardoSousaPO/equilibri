'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createClientSupabaseClient, uploadAudio, createAudioEntry } from '@/lib/supabase/client-queries'

export default function AudioRecordPage() {
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [recordingTime, setRecordingTime] = useState<number>(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [title, setTitle] = useState<string>('')
  const [moodScore, setMoodScore] = useState<number>(5)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState<boolean>(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClientSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    
    fetchUser()
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        
        setAudioBlob(audioBlob)
        setAudioUrl(url)
        setIsRecording(false)
        
        // Parar todas as faixas do stream
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Iniciar timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setError('Não foi possível acessar o microfone. Verifique as permissões do navegador.')
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
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
  
  const processAudio = async () => {
    if (!audioBlob || !userId) {
      setError('Nenhum áudio gravado ou usuário não autenticado.')
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Fazer upload do áudio para o Supabase Storage
      const file = new File([audioBlob], `recording-${Date.now()}.wav`, { type: 'audio/wav' })
      const { data: audioUrl, error: uploadError } = await uploadAudio(file, userId)
      
      if (uploadError || !audioUrl) {
        throw new Error(uploadError || 'Erro ao fazer upload do áudio')
      }
      
      // Transcrever e analisar o áudio
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (data.limitReached) {
          setLimitReached(true)
        } else {
          throw new Error(data.error || 'Erro ao transcrever áudio')
        }
      } else {
        setTranscription(data.transcription)
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      setError('Ocorreu um erro ao processar o áudio. Por favor, tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!audioBlob || !audioUrl || !userId) {
      setError('Nenhum áudio gravado ou usuário não autenticado.')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Se ainda não processou o áudio, fazer isso primeiro
      if (!transcription && !limitReached) {
        await processAudio()
      }
      
      // Fazer upload do áudio para o Supabase Storage (se ainda não fez)
      let finalAudioUrl = audioUrl
      if (!finalAudioUrl.startsWith('http')) {
        const file = new File([audioBlob], `recording-${Date.now()}.wav`, { type: 'audio/wav' })
        const { data: uploadedUrl, error: uploadError } = await uploadAudio(file, userId)
        
        if (uploadError || !uploadedUrl) {
          throw new Error(uploadError || 'Erro ao fazer upload do áudio')
        }
        
        finalAudioUrl = uploadedUrl
      }
      
      // Criar entrada de áudio
      const { data, error } = await createAudioEntry({
        user_id: userId,
        audio_url: finalAudioUrl,
        title: title.trim() || 'Gravação de áudio',
        duration: recordingTime,
        transcription: transcription || null,
        mood_score: moodScore,
        tags: tags.length > 0 ? tags : null,
        analysis: analysis || null,
        is_favorite: false
      })
      
      if (error) {
        throw new Error(error)
      }
      
      // Redirecionar para a página de visualização da entrada
      window.location.href = `/app/audio/${data?.id}`
    } catch (error) {
      console.error('Error creating audio entry:', error)
      setError('Ocorreu um erro ao salvar a entrada de áudio. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Nova Entrada de Áudio</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => window.location.href = '/app/audio'}
            className="px-4 py-2 border border-border rounded-md text-text-secondary hover:bg-background-secondary transition-colors"
          >
            Cancelar
          </button>
          {audioBlob && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          )}
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
          <p className="mt-1">Você atingiu o limite de entradas de áudio para o plano gratuito. Faça upgrade para o plano Premium para continuar usando a transcrição e análise terapêutica.</p>
          <a 
            href="/app/upgrade" 
            className="mt-2 inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors"
          >
            Fazer Upgrade
          </a>
        </div>
      )}
      
      <div className="bg-background rounded-lg p-6 shadow-sm mb-6">
        <div className="flex flex-col items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-background-secondary flex items-center justify-center mb-4">
            {isRecording ? (
              <div className="w-16 h-16 bg-error rounded-full animate-pulse"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </div>
          
          <div className="text-3xl font-semibold mb-6">
            {formatTime(recordingTime)}
          </div>
          
          <div className="flex space-x-4">
            {!isRecording && !audioBlob && (
              <button
                type="button"
                onClick={startRecording}
                className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-light transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
                Iniciar Gravação
              </button>
            )}
            
            {isRecording && (
              <button
                type="button"
                onClick={stopRecording}
                className="px-6 py-3 bg-error text-white rounded-md hover:bg-error-dark transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Parar Gravação
              </button>
            )}
            
            {audioBlob && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setAudioBlob(null)
                    setAudioUrl(null)
                    setTranscription(null)
                    setAnalysis(null)
                  }}
                  className="px-6 py-3 border border-border text-text-secondary rounded-md hover:bg-background-secondary transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Descartar
                </button>
                
                <button
                  type="button"
                  onClick={processAudio}
                  disabled={isProcessing || limitReached || !!transcription}
                  className="px-6 py-3 bg-secondary text-white rounded-md hover:bg-secondary-light transition-colors flex items-center disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando...
                    </>
                  ) : transcription ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Processado
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Transcrever
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {audioBlob && (
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
              placeholder="Dê um título para esta gravação"
              className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
          
          {audioUrl && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Reproduzir Áudio
              </label>
              <audio controls className="w-full mt-1">
                <source src={audioUrl} type="audio/wav" />
                Seu navegador não suporta o elemento de áudio.
              </audio>
            </div>
          )}
          
          {transcription && (
            <div className="p-4 bg-background-secondary rounded-md">
              <h3 className="font-semibold text-text-primary mb-2">Transcrição</h3>
              <p className="text-text-primary">{transcription}</p>
            </div>
          )}
          
          {analysis && (
            <div className="p-4 bg-background-secondary rounded-md">
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
      )}
    </div>
  )
}
