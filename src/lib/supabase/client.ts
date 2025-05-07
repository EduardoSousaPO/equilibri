import { createBrowserClient } from '@supabase/ssr'

// Helper para lidar com valores padrão durante o build
const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-supabase-url.com';
}

const getSupabaseAnonKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-for-build';
}

// Verificar se estamos em ambiente de build ou se as variáveis de ambiente estão ausentes
const isStaticBuild = () => {
  return typeof window === 'undefined' || 
    !process.env.NEXT_PUBLIC_SUPABASE_URL || 
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

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
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = '/app/dashboard';
        }, 1000);
      }
      
      return { data: {}, error: null };
    },
    getSession: async () => {
      return { data: { session: mockUser ? {} : null } };
    },
    getUser: async () => {
      return { data: { user: mockUser }, error: null };
    }
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        limit: () => ({
          single: async () => ({ data: null, error: null }),
          order: () => ({
            limit: () => ({
              single: async () => ({ data: null, error: null }),
            }),
          }),
        }),
        order: () => ({
          limit: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
      }),
    }),
    insert: () => ({ error: null }),
    update: () => ({
      eq: () => ({ error: null }),
    }),
  }),
};

export const createClient = () => {
  try {
    // Verificar se estamos em ambiente de build estático ou se as variáveis de ambiente estão ausentes
    if (isStaticBuild()) {
      console.warn('Usando autenticação simulada para desenvolvimento/build. Credenciais: teste@teste.com / 123456');
      return mockSupabase;
    }
    
    return createBrowserClient(
      getSupabaseUrl(),
      getSupabaseAnonKey()
    );
  } catch (error) {
    console.error('Erro ao criar cliente Supabase, usando autenticação simulada:', error);
    return mockSupabase;
  }
}
