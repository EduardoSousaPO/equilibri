'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginTestUser() {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
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
        },
      },
    }
  );

  try {
    // Tentar login com usuário existente
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'teste@gmail.com',
      password: 'password123'
    });

    if (loginData.user && !loginError) {
      // Verificar se perfil existe
      await ensureUserProfile(supabase, loginData.user.id, loginData.user.email || 'teste@gmail.com');
      return { success: true, user: loginData.user };
    }

    // Se não conseguir login, criar novo usuário
    if (loginError?.message.includes('Invalid login credentials')) {
      const timestamp = Date.now();
      const uniqueEmail = `teste.${timestamp}@gmail.com`;
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: uniqueEmail,
        password: 'password123',
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: 'Usuário Teste',
            is_test_account: true,
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (signUpData.user && signUpData.session) {
        await createUserProfile(supabase, signUpData.user.id, uniqueEmail);
        return { success: true, user: signUpData.user };
      }
    }

    throw loginError || new Error('Falha na autenticação');

  } catch (error: any) {
    console.error('Erro no login:', error);
    return { success: false, error: error.message };
  }
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

export async function checkAuthStatus() {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
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
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    return { authenticated: true, user: session.user };
  }
  
  return { authenticated: false };
}

export async function logoutUser() {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
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
        },
      },
    }
  );

  await supabase.auth.signOut();
  return { success: true };
} 