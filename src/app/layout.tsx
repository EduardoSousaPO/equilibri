import './globals.css'
import './theme.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Equilibri.IA - Seu terapeuta digital com um toque humano',
  description: 'Transforme seus pensamentos em insights terapêuticos com a Equilibri.IA - Seu terapeuta digital com um toque humano',
  icons: {
    icon: [
      { url: '/favicon.svg', sizes: 'any' },
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/equilibri-icon.svg', type: 'image/svg+xml' }
    ],
    apple: { url: '/equilibri-icon.svg', type: 'image/svg+xml' }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen font-sans bg-cream-50">
        {children}
      </body>
    </html>
  )
}
