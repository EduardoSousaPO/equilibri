'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import { EquilibriLogo } from '@/components/ui/logo'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <EquilibriLogo className="h-16 w-auto mx-auto" />
      </div>
      
      <LoginForm />
    </div>
  )
}
