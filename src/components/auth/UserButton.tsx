'use client'

import { UserButton as ClerkUserButton } from '@clerk/nextjs'

export function UserButton() {
  return (
    <ClerkUserButton 
      appearance={{
        elements: {
          userButtonAvatarBox: "h-10 w-10"
        }
      }}
      afterSignOutUrl="/"
    />
  )
} 