"use client"

import { type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface PremiumCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "metallic" | "glass"
  hover?: boolean
  children?: React.ReactNode
}

function PremiumCard({ 
  className, 
  variant = "default", 
  hover = true,
  children,
  ...props 
}: PremiumCardProps) {
  const baseStyles = "premium-card transition-all duration-300"
  const hoverStyles = hover ? "hover:shadow-lg hover:-translate-y-1" : ""
  
  const variants = {
    default: "premium-card",
    metallic: "bg-metallic-gold/10 border-gold-500/20",
    glass: "glass-effect",
  }

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { PremiumCard } 