import { createClient } from '@supabase/supabase-js';
import React from 'react'

// Definição de cores para ilustrações de emoções
const emotionColors = {
  happy: '#4ECDC4',
  calm: '#3A97D4',
  sad: '#64748B',
  anxious: '#FFD166',
  angry: '#FF6B6B',
  neutral: '#A1A1AA'
};

// Ilustrações de emoções em estilo minimalista
export const HappyIllustration = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="#F7F3E3" stroke="#B89434" strokeWidth="1.5" />
    <path d="M35 45C36.6569 45 38 43.6569 38 42C38 40.3431 36.6569 39 35 39C33.3431 39 32 40.3431 32 42C32 43.6569 33.3431 45 35 45Z" fill="#304344" />
    <path d="M65 45C66.6569 45 68 43.6569 68 42C68 40.3431 66.6569 39 65 39C63.3431 39 62 40.3431 62 42C62 43.6569 63.3431 45 65 45Z" fill="#304344" />
    <path d="M67 60C67 68.8366 59.8366 75 50 75C40.1634 75 33 68.8366 33 60" stroke="#304344" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const SadIllustration = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="#F9EFEF" stroke="#C86464" strokeWidth="1.5" />
    <path d="M35 45C36.6569 45 38 43.6569 38 42C38 40.3431 36.6569 39 35 39C33.3431 39 32 40.3431 32 42C32 43.6569 33.3431 45 35 45Z" fill="#304344" />
    <path d="M65 45C66.6569 45 68 43.6569 68 42C68 40.3431 66.6569 39 65 39C63.3431 39 62 40.3431 62 42C62 43.6569 63.3431 45 65 45Z" fill="#304344" />
    <path d="M33 68C33 59.1634 40.1634 55 50 55C59.8366 55 67 59.1634 67 68" stroke="#304344" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const AngryIllustration = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="#F2DFDF" stroke="#C86464" strokeWidth="1.5" />
    <path d="M30 40L38 34" stroke="#304344" strokeWidth="2" strokeLinecap="round" />
    <path d="M70 40L62 34" stroke="#304344" strokeWidth="2" strokeLinecap="round" />
    <path d="M35 45C36.6569 45 38 43.6569 38 42C38 40.3431 36.6569 39 35 39C33.3431 39 32 40.3431 32 42C32 43.6569 33.3431 45 35 45Z" fill="#304344" />
    <path d="M65 45C66.6569 45 68 43.6569 68 42C68 40.3431 66.6569 39 65 39C63.3431 39 62 40.3431 62 42C62 43.6569 63.3431 45 65 45Z" fill="#304344" />
    <path d="M37 68C40 62 45 60 50 60C55 60 60 62 63 68" stroke="#304344" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const AnxiousIllustration = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="#DCE9F0" stroke="#5799B6" strokeWidth="1.5" />
    <path d="M35 45C36.6569 45 38 43.6569 38 42C38 40.3431 36.6569 39 35 39C33.3431 39 32 40.3431 32 42C32 43.6569 33.3431 45 35 45Z" fill="#304344" />
    <path d="M65 45C66.6569 45 68 43.6569 68 42C68 40.3431 66.6569 39 65 39C63.3431 39 62 40.3431 62 42C62 43.6569 63.3431 45 65 45Z" fill="#304344" />
    <path d="M40 66H60" stroke="#304344" strokeWidth="2" strokeLinecap="round" />
    <path d="M42 58C42 58 45 54 50 54C55 54 58 58 58 58" stroke="#304344" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const CalmIllustration = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="#E5F2F6" stroke="#1A7D93" strokeWidth="1.5" />
    <path d="M35 45C36.6569 45 38 43.6569 38 42C38 40.3431 36.6569 39 35 39C33.3431 39 32 40.3431 32 42C32 43.6569 33.3431 45 35 45Z" fill="#304344" />
    <path d="M65 45C66.6569 45 68 43.6569 68 42C68 40.3431 66.6569 39 65 39C63.3431 39 62 40.3431 62 42C62 43.6569 63.3431 45 65 45Z" fill="#304344" />
    <path d="M40 63C43 65 46 66 50 66C54 66 57 65 60 63" stroke="#304344" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const NeutralIllustration = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="#F6F2E8" stroke="#787F7F" strokeWidth="1.5" />
    <path d="M35 45C36.6569 45 38 43.6569 38 42C38 40.3431 36.6569 39 35 39C33.3431 39 32 40.3431 32 42C32 43.6569 33.3431 45 35 45Z" fill="#304344" />
    <path d="M65 45C66.6569 45 68 43.6569 68 42C68 40.3431 66.6569 39 65 39C63.3431 39 62 40.3431 62 42C62 43.6569 63.3431 45 65 45Z" fill="#304344" />
    <path d="M40 63H60" stroke="#304344" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// Componente de ilustração para ondas de meditação
const MeditationWaves = () => {
  return (
    <svg width="200" height="100" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 50C20 30 40 70 60 50C80 30 100 70 120 50C140 30 160 70 180 50C200 30 220 70 240 50" 
        stroke="#186FAF" strokeWidth="2" strokeLinecap="round" />
      <path d="M0 50C20 40 40 60 60 50C80 40 100 60 120 50C140 40 160 60 180 50C200 40 220 60 240 50" 
        stroke="#3A97D4" strokeWidth="2" strokeLinecap="round" />
      <path d="M0 50C20 45 40 55 60 50C80 45 100 55 120 50C140 45 160 55 180 50C200 45 220 55 240 50" 
        stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

// Componente de ilustração para gráfico de progresso
const ProgressChart = () => {
  return (
    <svg width="200" height="100" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 90H190" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 90V10" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 70L40 60L70 65L100 40L130 50L160 30L190 20" 
        stroke="#186FAF" strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="60" r="4" fill="#186FAF" />
      <circle cx="70" cy="65" r="4" fill="#186FAF" />
      <circle cx="100" cy="40" r="4" fill="#186FAF" />
      <circle cx="130" cy="50" r="4" fill="#186FAF" />
      <circle cx="160" cy="30" r="4" fill="#186FAF" />
      <circle cx="190" cy="20" r="4" fill="#186FAF" />
    </svg>
  );
};

// Componente de ilustração para ícone de diário
const JournalIcon = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V4C20 3.46957 19.7893 2.96086 19.4142 2.58579C19.0391 2.21071 18.5304 2 18 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4Z" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// Componente de ilustração para ícone de check-in
const CheckInIcon = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 9H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 14H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// Componente de ilustração para ícone de relatório
const ReportIcon = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// Componente de ilustração para ícone de áudio
const AudioIcon = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C11.0111 2 10.0444 2.29324 9.22215 2.84265C8.3999 3.39206 7.75904 4.17295 7.3806 5.08658C7.00216 6.00021 6.90315 7.00555 7.09607 7.97545C7.289 8.94536 7.7652 9.83627 8.46447 10.5355C9.16373 11.2348 10.0546 11.711 11.0245 11.9039C11.9945 12.0969 12.9998 11.9978 13.9134 11.6194C14.827 11.241 15.6079 10.6001 16.1573 9.77785C16.7068 8.95561 17 7.98891 17 7C17 5.67392 16.4732 4.40215 15.5355 3.46447C14.5979 2.52678 13.3261 2 12 2ZM12 12C10.4178 12 8.87104 12.4692 7.55544 13.3482C6.23985 14.2273 5.21447 15.4767 4.60897 16.9385C4.00347 18.4003 3.84504 20.0089 4.15372 21.5607C4.4624 23.1126 5.22433 24.538 6.34315 25.6569C7.46197 26.7757 8.88743 27.5376 10.4393 27.8463C11.9911 28.155 13.5997 27.9965 15.0615 27.391C16.5233 26.7855 17.7727 25.7602 18.6518 24.4446C19.5308 23.129 20 21.5823 20 20" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 16V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 14V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 16V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// Componente de ilustração para ícone de terapeuta
const TherapistIcon = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export {
  emotionColors,
  MeditationWaves,
  ProgressChart,
  JournalIcon,
  CheckInIcon,
  ReportIcon,
  AudioIcon,
  TherapistIcon
};
