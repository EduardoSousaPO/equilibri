'use client';

import React, { useState, useEffect, useRef, FormEvent, KeyboardEvent, ChangeEvent } from 'react';
import { cn } from '@/utils/cn';

interface ChatInputProps {
  onSend: (message: string) => void;
  onAudioRecorded: (audioBlob: Blob) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({ onSend, onAudioRecorded, disabled = false, className }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } else if (hasRecordedAudio && audioBlob && !disabled) {
      // Enviar áudio gravado
      handleSendAudio();
    }
  };
  
  const handleSendAudio = async () => {
    if (audioBlob) {
      await onAudioRecorded(audioBlob);
      setAudioBlob(null);
      setHasRecordedAudio(false);
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };
  
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        setHasRecordedAudio(true);
        
        // Parar todas as faixas do stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setHasRecordedAudio(false);
      
      // Iniciar timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      setIsRecording(false);
    }
  };
  
  const cancelRecording = () => {
    setAudioBlob(null);
    setHasRecordedAudio(false);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col w-full max-w-[720px] mx-auto rounded-lg border border-gray-200 bg-white shadow-sm",
        disabled && "opacity-70",
        className
      )}
    >
      <div className="relative flex items-end w-full">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isRecording || hasRecordedAudio}
          placeholder={
            isRecording 
              ? "Gravando áudio..." 
              : hasRecordedAudio 
                ? "Áudio pronto para envio" 
                : "Digite sua mensagem aqui..."
          }
          className="flex-1 resize-none max-h-32 p-4 pr-24 bg-transparent border-none focus:ring-0 focus:outline-none"
          rows={1}
        />
        
        <div className="absolute right-2 bottom-3 flex items-center">
          {isRecording && (
            <div className="mr-2 flex items-center text-red-500 animate-pulse">
              <span className="h-2 w-2 mr-1 rounded-full bg-red-500"></span>
              <span className="text-xs font-medium">{formatTime(recordingTime)}</span>
            </div>
          )}
          
          {hasRecordedAudio && (
            <button
              type="button"
              onClick={cancelRecording}
              className={cn(
                "p-2 rounded-full mr-2",
                "bg-red-100 hover:bg-red-200 transition-colors",
                "text-red-600"
              )}
              title="Cancelar áudio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          )}
          
          {!isRecording && !hasRecordedAudio ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={disabled}
              className={cn(
                "p-2 rounded-full mr-2",
                "bg-gray-100 hover:bg-gray-200 transition-colors",
                "text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
              )}
              title="Gravar áudio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
              </svg>
            </button>
          ) : isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className={cn(
                "p-2 rounded-full mr-2",
                "bg-red-100 hover:bg-red-200 transition-colors",
                "text-red-600"
              )}
              title="Parar gravação"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="4" height="16" x="6" y="4" rx="1"></rect>
                <rect width="4" height="16" x="14" y="4" rx="1"></rect>
              </svg>
            </button>
          )}
        
        <button
          type="submit"
          disabled={((!message.trim() && !hasRecordedAudio) || disabled || isRecording)}
          className={cn(
              "p-2 rounded-full",
            "bg-brand hover:bg-brandSecondary transition-colors",
            "text-white disabled:opacity-40 disabled:cursor-not-allowed",
            hasRecordedAudio && "bg-green-500 hover:bg-green-600"
          )}
          title={hasRecordedAudio ? "Enviar áudio" : "Enviar mensagem"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m22 2-7 20-4-9-9-4Z"/>
            <path d="M22 2 11 13"/>
          </svg>
        </button>
        </div>
      </div>
      <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
        {isRecording 
          ? "Clique no botão de pausa para encerrar a gravação" 
          : hasRecordedAudio
            ? "Clique no botão de enviar para enviar o áudio, ou no X para cancelar" 
            : "Pressione Enter para enviar texto, ou use o botão de microfone para gravar áudio"}
      </div>
    </form>
  );
} 