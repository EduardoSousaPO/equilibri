import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verifique seu Email - Equilibri',
  description: 'Verificação de email para sua conta Equilibri',
}

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 