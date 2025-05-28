import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

/**
 * Cria um cliente Supabase para uso em componentes de servidor
 */
export function createSupabaseServerClient() {
  return createServerComponentClient<Database>({ cookies });
}

/**
 * Obtém o ID do usuário atual logado
 * Redireciona para login se não estiver autenticado
 */
export async function getCurrentUserId(): Promise<string> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data.user) {
    redirect('/login')
  }
  
  return data.user.id
}

/**
 * Verifica se o usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  return !!data.user
}

/**
 * Obtém a sessão atual
 * Redireciona para login se não estiver autenticado
 */
export async function getCurrentSession() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.auth.getSession()
  
  if (error || !data.session) {
    redirect('/login')
  }
  
  return data.session
}

/**
 * Obtém o usuário atual com todos os dados
 * Redireciona para login se não estiver autenticado
 */
export async function getUser() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data.user) {
    redirect('/login')
  }
  
  return data.user
} 