import { currentUser, auth as clerkAuth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

/**
 * Obtém o ID do usuário atual logado
 * Redireciona para login se não estiver autenticado
 */
export async function getCurrentUserId(): Promise<string> {
  const { userId } = await clerkAuth()
  
  if (!userId) {
    redirect('/login')
  }
  
  return userId
}

/**
 * Verifica se o usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await clerkAuth()
  return !!userId
}

/**
 * Obtém a sessão atual
 * Redireciona para login se não estiver autenticado
 */
export async function getCurrentSession() {
  const session = await clerkAuth()
  
  if (!session.userId) {
    redirect('/login')
  }
  
  return session
}

/**
 * Obtém o usuário atual com todos os dados
 * Redireciona para login se não estiver autenticado
 */
export async function getUser() {
  const user = await currentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
} 