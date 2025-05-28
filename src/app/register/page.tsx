'use client'

import { RegisterForm } from '@/components/auth/RegisterForm'
import { EquilibriLogo } from '@/components/ui/logo'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="mb-8 flex flex-col items-center">
        <EquilibriLogo className="h-12" textColor="text-primary" />
      </div>
      
      <RegisterForm />
      
      <div className="mt-8 text-center text-sm text-text-secondary">
        <p>Equilibri.IA - Seu diário terapêutico digital</p>
        <p className="mt-1">
          <Link href="/" className="text-primary hover:underline">
            Voltar para a página inicial
          </Link>
        </p>
      </div>
    </div>
  )
}
