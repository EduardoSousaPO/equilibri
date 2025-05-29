"use client"

import { type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "premium-button",
        metallic: "bg-metallic-gold text-foreground shadow-metallic hover:shadow-lg hover:-translate-y-0.5",
        glass: "glass-effect text-foreground hover:bg-white/90 dark:hover:bg-background-secondary/90",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
        ghost: "hover:bg-accent/10 text-accent hover:text-accent-light",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 rounded-md",
        lg: "h-12 px-8 rounded-lg text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "metallic" | "glass" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  children?: React.ReactNode
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}

function PremiumButton({ 
  className, 
  variant = "default", 
  size = "default",
  children,
  type = "button",
  disabled = false,
  ...props 
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </button>
  )
}

export { PremiumButton, buttonVariants } 