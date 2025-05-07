'use client'

import { RegisterForm } from '@/components/auth/RegisterForm'
import { EquilibriLogo } from '@/components/ui/logo'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <EquilibriLogo className="h-16 w-auto mx-auto" />
      </div>
      
      <RegisterForm />
    </div>
  )
}
