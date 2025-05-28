'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface AudioRecorderProps {
  onAudioCaptured: (audioBlob: Blob, transcript: string) => void;
  disabled?: boolean;
  className?: string;
}

export function AudioRecorder({ onAudioCaptured, disabled = false, className }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcriptionPreview, setTranscriptionPreview] = useState<string | null>(null);
  const [supportedMimeType, setSupportedMimeType] = useState<string>('audio/webm');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Detectar o melhor formato de áudio suportado
  useEffect(() => {
    const formats = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4;codecs=mp4a.40.2',
      'audio/mp4',
      'audio/wav'
    ];
    
    for (const format of formats) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(format)) {
        setSupportedMimeType(format);
        console.log('🎙️ Formato de áudio selecionado:', format);
        break;
      }
    }
  }, []);

  // Função para iniciar a gravação
  const startRecording = async () => {
    try {
      // Resetar estados
      audioChunksRef.current = [];
      setAudioBlob(null);
      setRecordingTime(0);
      setErrorMessage(null);
      setTranscriptionPreview(null);
      
      // Verificar suporte do navegador
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Gravação de áudio não suportada neste navegador. Tente usar Chrome, Firefox ou Safari mais recentes.');
      }
      
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder não suportado neste navegador.');
      }
      
      // Solicitar permissão para acessar o microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      // Criar MediaRecorder com formato suportado
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: supportedMimeType,
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Coletar dados de áudio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Processar quando a gravação finalizar
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: supportedMimeType });
        setAudioBlob(audioBlob);
        
        // Criar URL para reprodução local (opcional)
        if (audioRef.current) {
          const audioUrl = URL.createObjectURL(audioBlob);
          audioRef.current.src = audioUrl;
        }
        
        processAudio(audioBlob);
        
        // Parar todas as faixas de áudio para liberar o microfone
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Tratar erros do MediaRecorder
      mediaRecorder.onerror = (event) => {
        console.error('Erro no MediaRecorder:', event);
        setErrorMessage('Erro durante a gravação. Tente novamente.');
        setIsRecording(false);
      };
      
      // Iniciar gravação (solicitar dados a cada 1 segundo)
      mediaRecorder.start(1000);
      setIsRecording(true);
      
      // Atualizar contador de tempo
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          
          // Limite de gravação de 2 minutos
          if (newTime >= 120) {
            stopRecording();
          }
          
          return newTime;
        });
      }, 1000);
      
    } catch (error: any) {
      console.error('Erro ao acessar o microfone:', error);
      
      let errorMsg = 'Erro desconhecido ao acessar o microfone.';
      
      if (error.name === 'NotAllowedError') {
        errorMsg = 'Permissão negada. Clique no ícone do cadeado na barra de endereços e permita o acesso ao microfone.';
      } else if (error.name === 'NotFoundError') {
        errorMsg = 'Microfone não encontrado. Verifique se há um microfone conectado e funcionando.';
      } else if (error.name === 'NotSupportedError') {
        errorMsg = 'Gravação de áudio não suportada neste navegador ou dispositivo.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
    }
  };
  
  // Função para parar a gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Limpar timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Processar áudio (transcrição)
  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      // Verificar tamanho do arquivo
      const maxSize = 25 * 1024 * 1024; // 25MB (limite do OpenAI)
      if (blob.size > maxSize) {
        throw new Error('Arquivo de áudio muito grande. Tente gravar um áudio mais curto.');
      }
      
      if (blob.size === 0) {
        throw new Error('Arquivo de áudio vazio. Tente gravar novamente.');
      }
      
      console.log('📤 Enviando áudio para transcrição:', {
        size: blob.size,
        type: blob.type,
        duration: recordingTime
      });
      
      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('audio', blob, `recording.${supportedMimeType.includes('webm') ? 'webm' : 'mp4'}`);
      
      // Enviar para API de transcrição (apenas usuários autenticados)
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (response.status === 401) {
        throw new Error('Você precisa estar logado para usar a transcrição de áudio. Faça login primeiro.');
      }
      
      if (response.status === 403) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Limite de transcrições atingido para seu plano.');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API de transcrição:', response.status, errorText);
        throw new Error(`Erro ${response.status}: Falha no servidor de transcrição`);
      }
      
      const data = await response.json();
      console.log('📥 Resposta da API de transcrição:', data);
      
      // Se houver erro na transcrição
      if (data.error === true) {
        setErrorMessage(data.transcript || 'Não foi possível transcrever o áudio');
        return;
      }
      
      // Exibir prévia da transcrição
      if (data.transcript && data.transcript.trim()) {
        setTranscriptionPreview(data.transcript);
        
        // Enviar para o componente pai
        onAudioCaptured(blob, data.transcript);
        
        // Mostrar informações de uso se disponível
        if (data.usage) {
          console.log(`📊 Uso de transcrições: ${data.usage.current}/${data.usage.limit} (Plano: ${data.usage.plan})`);
        }
      } else {
        setErrorMessage('Não foi possível obter a transcrição do áudio. O áudio pode estar muito baixo ou vazio.');
      }
    } catch (error: any) {
      console.error('Erro ao processar áudio:', error);
      
      let errorMsg = 'Falha ao processar o áudio. Tente novamente ou envie como texto.';
      
      if (error.message.includes('Failed to fetch')) {
        errorMsg = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.message.includes('logado')) {
        errorMsg = error.message + ' Acesse /quick-login para entrar.';
      } else if (error.message.includes('Limite')) {
        errorMsg = error.message + ' Faça upgrade do seu plano para continuar.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Formatar tempo de gravação (mm:ss)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Limpar timer ao desmontar o componente
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Parar gravação se estiver ativa
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      
      // Limpar URLs criados
      if (audioRef.current?.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, [isRecording]);
  
  // Áudio element para verificar o áudio (oculto)
  useEffect(() => {
    audioRef.current = new Audio();
  }, []);
  
  return (
    <div className={cn("flex flex-col items-center w-full", className)}>
      {errorMessage && (
        <div className="text-red-500 text-sm mb-2 text-center w-full p-3 bg-red-50 rounded-md border border-red-200">
          <div className="font-semibold mb-1">⚠️ Erro na gravação:</div>
          <p>{errorMessage}</p>
        </div>
      )}
      
      {transcriptionPreview && !isProcessing && !isRecording && (
        <div className="text-sm mb-3 p-3 bg-blue-50 rounded-md w-full border border-blue-200">
          <div className="font-semibold mb-1 text-blue-700">✅ Transcrição:</div>
          <p className="text-gray-700">{transcriptionPreview}</p>
        </div>
      )}
      
      <div className="flex flex-col items-center space-y-4">
        {isRecording ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={stopRecording}
                  className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors relative"
                  title="Parar gravação"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="6" width="12" height="12"/>
                  </svg>
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-400 animate-pulse"></div>
                </button>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-mono text-gray-700">{formatTime(recordingTime)}</div>
                <div className="text-xs text-gray-500">Gravando...</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
              <span>Fale claramente para melhor transcrição</span>
            </div>
          </div>
        ) : isProcessing ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 rounded-full bg-blue-100">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            </div>
            <p className="text-sm text-gray-600">Processando áudio...</p>
          </div>
        ) : (
          <button
            onClick={startRecording}
            className="p-3 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Gravar mensagem de voz"
            disabled={disabled}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </button>
        )}
      </div>
      
      {isRecording && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Máximo 2 minutos • Fale claramente • Evite ruídos de fundo
        </p>
      )}
      
      {/* Debug info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mt-2 text-center">
          Formato: {supportedMimeType}
        </div>
      )}
    </div>
  );
} 