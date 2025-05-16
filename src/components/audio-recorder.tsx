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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Função para iniciar a gravação
  const startRecording = async () => {
    try {
      // Resetar estados
      audioChunksRef.current = [];
      setAudioBlob(null);
      setRecordingTime(0);
      setErrorMessage(null);
      setTranscriptionPreview(null);
      
      // Solicitar permissão para acessar o microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
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
      
      // Iniciar gravação (solicitar dados a cada 1 segundo)
      mediaRecorder.start(1000);
      setIsRecording(true);
      
      // Atualizar contador de tempo
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        
        // Limite de gravação de 2 minutos
        if (recordingTime >= 120) {
          stopRecording();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao acessar o microfone:', error);
      setErrorMessage('Não foi possível acessar seu microfone. Verifique as permissões do navegador.');
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
    
    try {
      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      
      // Enviar para API de transcrição
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Se houver erro na transcrição
      if (data.error === true) {
        setErrorMessage(data.transcript || 'Não foi possível transcrever o áudio');
        return;
      }
      
      // Exibir prévia da transcrição
      if (data.transcript) {
        setTranscriptionPreview(data.transcript);
        
        // Enviar para o componente pai
        onAudioCaptured(blob, data.transcript);
      } else {
        setErrorMessage('Não foi possível obter a transcrição do áudio');
      }
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      setErrorMessage('Falha ao processar o áudio. Tente novamente ou envie como texto.');
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
      
      // Limpar URLs criados
      if (audioRef.current?.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);
  
  // Áudio element para verificar o áudio (oculto)
  useEffect(() => {
    audioRef.current = new Audio();
  }, []);
  
  return (
    <div className={cn("flex flex-col items-center w-full", className)}>
      {errorMessage && (
        <div className="text-red-500 text-sm mb-2 text-center w-full">
          {errorMessage}
        </div>
      )}
      
      {transcriptionPreview && !isProcessing && !isRecording && (
        <div className="text-sm mb-3 p-2 bg-blue-50 rounded-md w-full">
          <div className="font-semibold mb-1">Transcrição:</div>
          <p className="text-gray-700">{transcriptionPreview}</p>
        </div>
      )}
      
      <div className="flex items-center justify-center">
        {isProcessing ? (
          <div className="flex items-center text-muted-foreground">
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processando áudio...
          </div>
        ) : isRecording ? (
          <div className="flex items-center">
            <div className="animate-pulse mr-2 h-3 w-3 rounded-full bg-red-600"></div>
            <span className="text-red-500 mr-2">{formatTime(recordingTime)}</span>
            <button
              onClick={stopRecording}
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Parar gravação"
              disabled={disabled}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={startRecording}
            className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
            title="Gravar mensagem de voz"
            disabled={disabled}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </button>
        )}
      </div>
      
      {isRecording && (
        <p className="text-xs text-gray-500 mt-2">
          Falando até 2 minutos...
        </p>
      )}
    </div>
  );
} 