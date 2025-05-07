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

// Nova logo Equilibri usando a imagem estática
export const EquilibriLogo = ({ className = 'h-12 w-auto' }: { className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <Image
        src="/equilibri-logo.png"
        alt="Equilibri Logo"
        width={220}
        height={220}
        className="w-auto h-full object-contain"
      />
      <div className="mt-2 text-center">
        <h2 className="text-forest-900 font-serif font-bold text-2xl tracking-wider">Equilibri</h2>
        <p className="text-xs text-gray-600 tracking-wide">DIÁRIO TERAPÊUTICO DIGITAL</p>
      </div>
    </div>
  )
}

// Novo ícone Equilibri usando a imagem estática
export const EquilibriIcon = ({ className = 'h-10 w-10' }: { className?: string }) => {
  return (
    <div className={`${className} relative`}>
      <Image
        src="/equilibri-icon.svg"
        alt="Equilibri Icon"
        width={100}
        height={100}
        className="w-full h-full object-contain"
      />
    </div>
  )
}
