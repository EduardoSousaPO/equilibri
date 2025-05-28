'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ErrorCardProps {
  title?: string
  message: string
  actionText?: string
  onAction?: () => void
  secondaryActionText?: string
  onSecondaryAction?: () => void
  type?: 'error' | 'warning' | 'info' | 'success'
}

export default function ErrorCard({
  title,
  message,
  actionText = 'Tentar novamente',
  onAction,
  secondaryActionText,
  onSecondaryAction,
  type = 'error'
}: ErrorCardProps) {
  // Definir estilos com base no tipo
  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          badge: 'bg-red-100 text-red-800',
          badgeText: 'Erro',
          textColor: 'text-red-600'
        }
      case 'warning':
        return {
          border: 'border-amber-200',
          bg: 'bg-amber-50',
          badge: 'bg-amber-100 text-amber-800',
          badgeText: 'Atenção',
          textColor: 'text-amber-600'
        }
      case 'info':
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          badge: 'bg-blue-100 text-blue-800',
          badgeText: 'Informação',
          textColor: 'text-blue-600'
        }
      case 'success':
        return {
          border: 'border-green-200',
          bg: 'bg-green-50',
          badge: 'bg-green-100 text-green-800',
          badgeText: 'Sucesso',
          textColor: 'text-green-600'
        }
      default:
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          badge: 'bg-red-100 text-red-800',
          badgeText: 'Erro',
          textColor: 'text-red-600'
        }
    }
  }
  
  const styles = getStyles()
  
  return (
    <Card className={`${styles.border} ${styles.bg}`}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          {title && (
            <div className="flex items-center mb-4">
              <Badge className={`${styles.badge}`}>{styles.badgeText}</Badge>
              <h2 className="text-xl font-semibold ml-2">{title}</h2>
            </div>
          )}
          
          {!title && (
            <Badge className={`mb-4 ${styles.badge}`}>{styles.badgeText}</Badge>
          )}
          
          <p className={`mb-6 ${styles.textColor}`}>{message}</p>
          
          <div className="flex gap-4">
            {secondaryActionText && onSecondaryAction && (
              <Button variant="outline" onClick={onSecondaryAction}>
                {secondaryActionText}
              </Button>
            )}
            
            {onAction && (
              <Button onClick={onAction}>
                {actionText}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
