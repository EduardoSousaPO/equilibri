'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabase/client-queries'

export function UserButton() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#888888" className="h-full w-full">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
          <button
            onClick={() => {
              router.push('/app/profile')
              setIsOpen(false)
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Perfil
          </button>
          <button
            onClick={() => {
              router.push('/app/settings')
              setIsOpen(false)
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Configurações
          </button>
          <hr className="my-1" />
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  )
} 