import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Equilibri',
  description: 'Faça login na sua conta Equilibri',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 