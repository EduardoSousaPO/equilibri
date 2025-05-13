'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PlanBannerProps {
  plan: 'free' | 'pro' | 'clinical' | undefined
  msgCount?: number
  usedSession?: boolean
  variant?: 'sidebar' | 'settings' | 'dashboard'
}

export default function PlanBanner({ 
  plan = 'free', 
  msgCount = 0, 
  usedSession = false,
  variant = 'settings'
}: PlanBannerProps) {
  // Configurar estilo com base na variante
  const styles = {
    sidebar: {
      container: 'w-full my-2',
      content: 'p-3',
      title: 'text-sm font-medium',
      badge: 'text-xs',
      text: 'text-xs mt-1',
      footer: 'px-3 py-2',
      button: 'w-full text-xs h-7'
    },
    settings: {
      container: 'w-full my-4',
      content: 'p-4',
      title: 'text-base font-semibold',
      badge: 'text-sm',
      text: 'text-sm mt-2',
      footer: 'px-4 py-3',
      button: 'w-full'
    },
    dashboard: {
      container: 'w-full my-4',
      content: 'p-4',
      title: 'text-lg font-bold',
      badge: 'text-sm',
      text: 'text-sm mt-2',
      footer: 'px-4 py-3',
      button: 'w-full'
    }
  }
  
  const style = styles[variant]
  
  // Definir conteúdo com base no plano
  const planInfo = {
    free: {
      title: 'Plano Gratuito',
      description: `${30 - (msgCount || 0)} mensagens restantes este mês`,
      badge: 'Grátis',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      buttonText: 'Fazer upgrade',
      buttonLink: '/settings'
    },
    pro: {
      title: 'Plano Premium',
      description: 'Chat ilimitado e relatórios PDF',
      badge: 'Premium',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      buttonText: 'Gerenciar plano',
      buttonLink: '/settings'
    },
    clinical: {
      title: 'Plano Premium Clínico',
      description: usedSession 
        ? 'Você já usou sua sessão mensal' 
        : 'Agende sua sessão de 1h com psicóloga',
      badge: 'Clinical',
      badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      buttonText: usedSession ? 'Voltar no próximo mês' : 'Agendar sessão',
      buttonLink: usedSession ? '/settings' : '/agenda'
    }
  }
  
  const currentPlan = plan ? planInfo[plan] : planInfo.free
  
  return (
    <Card className={style.container}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className={style.title}>{currentPlan.title}</CardTitle>
          <Badge className={`${style.badge} ${currentPlan.badgeColor}`}>{currentPlan.badge}</Badge>
        </div>
      </CardHeader>
      <CardContent className={style.content}>
        <p className={style.text}>{currentPlan.description}</p>
      </CardContent>
      <CardFooter className={style.footer}>
        <Button 
          variant={plan === 'free' ? 'default' : 'outline'}
          className={style.button}
          asChild
        >
          <Link href={currentPlan.buttonLink}>
            {currentPlan.buttonText}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 