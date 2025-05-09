import React from 'react'
import Image from 'next/image'

// Logo simples para uso em contextos menores
export const IconLogo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-primary" />
      <path 
        d="M24 10C24 11.5 22.5 13 21 13H13V17H21C22.5 17 24 18.5 24 20C24 21.5 22.5 23 21 23H9C8.5 23 8 22.5 8 22V10C8 9.5 8.5 9 9 9H21C22.5 9 24 8.5 24 10Z" 
        fill="currentColor"
        className="text-background"
      />
    </svg>
  )
}

// Logo Equilibri com o texto Equilibri.IA
export const EquilibriLogo = ({ 
  className = 'h-10 w-auto', 
  showText = true,
  textColor = "text-primary" 
}: { 
  className?: string,
  showText?: boolean,
  textColor?: string 
}) => {
  // Extrair apenas a altura da classe para calcular proporções
  const heightMatch = className?.match(/h-(\d+)/);
  const height = heightMatch ? parseInt(heightMatch[1]) : 10; // Valor padrão se não encontrar
  
  // Ajustar o tamanho do texto com base na altura do logo
  const textSize = height >= 16 ? 'text-lg' : height >= 10 ? 'text-base' : 'text-sm';
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex-shrink-0 relative" style={{ maxHeight: `${height * 4}px` }}>
        <Image
          src="/equilibri-logo.png"
          alt="Equilibri.IA Logo"
          width={height * 2}
          height={height * 2}
          className="w-auto h-full object-contain"
          priority
        />
      </div>
      {showText && (
        <div className="ml-2">
          <span className={`font-semibold ${textSize} ${textColor}`}>Equilibri.IA</span>
        </div>
      )}
    </div>
  )
}

// Ícone Equilibri usando a imagem estática
export const EquilibriIcon = ({ className = 'h-10 w-10' }: { className?: string }) => {
  return (
    <div className={`${className}`}>
      <Image
        src="/equilibri-icon.svg"
        alt="Equilibri.IA Icon"
        width={40}
        height={40}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  )
}
