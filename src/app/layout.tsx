import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DiarioTer - Companheiro Terapêutico Inteligente',
  description: 'Um diário terapêutico inteligente com análise baseada em evidências científicas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      experimental={{
        persistClient: true
      }}
    >
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
    </ClerkProvider>
  )
}
