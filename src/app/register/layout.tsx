import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registro - Equilibri',
  description: 'Crie sua conta no Equilibri',
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 