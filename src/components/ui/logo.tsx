'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface LogoProps {
  className?: string
  textColor?: string
}

export function EquilibriLogo({ className, textColor = 'text-primary' }: LogoProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <span className={cn('font-bold text-xl', textColor)}>Equilibri.IA</span>
    </div>
  )
} 