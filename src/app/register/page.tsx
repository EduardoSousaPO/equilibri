'use client'

import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <img 
          src="/logo.svg" 
          alt="DiarioTer Logo" 
          className="h-16 mx-auto"
          onError={(e) => { e.currentTarget.src = '/logo.png' }}
        />
      </div>
      
      <RegisterForm />
    </div>
  )
}
