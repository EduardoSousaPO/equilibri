import { createBrowserClient } from '@supabase/ssr'

// Tipos para autenticação simulada
interface MockUser {
  email: string;
  name: string;
}

interface AuthOptions {
  data?: {
    name?: string;
  };
  emailRedirectTo?: string;
}

// Autenticação simulada para desenvolvimento
let mockUser: MockUser | null = null;

const mockSupabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (email === 'teste@teste.com' && password === '123456') {
        mockUser = { email, name: 'Usuário Teste' };
        return { data: { user: mockUser, session: {} }, error: null };
      }
      return { data: { user: null, session: null }, error: { message: 'Email ou senha incorretos' } };
    },
    signUp: async ({ email, password, options }: { email: string; password: string; options?: AuthOptions }) => {
      mockUser = { email, name: options?.data?.name || 'Novo Usuário' };
      console.log('Usuário registrado:', mockUser);
      return { data: { user: mockUser, session: {} }, error: null };
    },
    signInWithOAuth: async ({ provider, options }: { provider: string; options?: any }) => {
      mockUser = { email: 'google@user.com', name: 'Usuário Google' };
      console.log('Login com Google simulado:', provider);
      
      // Redirecionar manualmente para o dashboard para simular login
      setTimeout(() => {
        window.location.href = '/app/dashboard';
      }, 1000);
      
      return { data: {}, error: null };
    },
    getSession: async () => {
      return { data: { session: mockUser ? {} : null } };
    }
  }
};

export const createClient = () => {
  // Verificar se estamos em ambiente de desenvolvimento e se as variáveis de ambiente estão ausentes
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Usando autenticação simulada para desenvolvimento. Credenciais: teste@teste.com / 123456');
    return mockSupabase;
  }
  
  try {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  } catch (error) {
    console.error('Erro ao criar cliente Supabase, usando autenticação simulada:', error);
    return mockSupabase;
  }
}
