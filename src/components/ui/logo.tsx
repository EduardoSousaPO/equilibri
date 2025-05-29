'use client'

import * as React from 'react'
import Image from 'next/image'

interface LogoProps {
  className?: string
  imageSize?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  textColor?: string
  children?: any
}

export function EquilibriLogo({ 
  className = '', 
  imageSize = 'md',
  showText = false,
  textColor,
  children
}: LogoProps): any {
  // Definindo tamanhos da imagem baseado no prop imageSize
  const sizes = {
    sm: { width: 60, height: 60 },
    md: { width: 80, height: 80 },
    lg: { width: 120, height: 120 },
    xl: { width: 160, height: 160 }
  }

  const { width, height } = sizes[imageSize]

  return (
    <div className={`${className} flex items-center`}>
      <div className="relative">
        <Image
          src="/images/logo_oficial_equilibri.jpg"
          alt="Equilibri.IA Logo"
          width={width}
          height={height}
          className="rounded-lg shadow-sm"
          priority
          quality={100} // Máxima qualidade de imagem
        />
      </div>
      {showText && (
        <span className={`ml-2 font-bold text-lg ${textColor ?? 'text-primary'}`}>Equilibri.IA</span>
      )}
      {children}
    </div>
  )
} 