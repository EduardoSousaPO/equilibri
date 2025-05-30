"use client"

import * as React from 'react'
import { type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface PremiumCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "metallic" | "glass"
  hover?: boolean
  children?: any
}

export function PremiumCard({ 
  className, 
  children,
  ...props 
}: PremiumCardProps): JSX.Element {
  const baseStyles = "premium-card transition-all duration-300"
  return (
    <div
      className={cn(
        baseStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
} 