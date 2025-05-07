import './globals.css'
import './theme.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Equilibri - AI Diary & Insight',
  description: 'Transforme seus pensamentos em insights terapêuticos com o Equilibri - AI Diary & Insight',
  icons: {
    icon: [
      { url: '/equilibri-icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', sizes: 'any' }
    ],
    apple: { url: '/equilibri-logo.png', type: 'image/png' }
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
