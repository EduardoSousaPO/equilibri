// Forçando alteração para garantir push e deploy correto na Vercel
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        }
      }
    }
  );
}

/** Faz login do usuário de testes e redireciona */
export async function loginTestUser() {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_EMAIL!,
    password: process.env.TEST_PASSWORD!,
  });
  if (error) throw new Error(error.message);
  redirect('/');
}

/** Apenas consulta sessão e devolve um boolean */
export async function checkAuthStatus() {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
}

/** Sai da conta corrente */
export async function logoutUser() {
  const supabase = getSupabase();
  await supabase.auth.signOut();
  redirect('/login');
}

async function createUserProfile(supabase: any, userId: string, email: string) {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name: 'Usuário Teste',
        email: email,
        plan: 'premium',
        created_at: new Date().toISOString()
      });
    if (error && !error.message.includes('duplicate key')) {
      console.error('Erro ao criar perfil:', error);
    }
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
  }
}

async function ensureUserProfile(supabase: any, userId: string, email: string) {
  try {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    if (!existingProfile) {
      await createUserProfile(supabase, userId, email);
    }
  } catch (error) {
    console.error('Erro ao verificar perfil:', error);
  }
} 