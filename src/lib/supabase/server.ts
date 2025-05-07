import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Helper para lidar com valores padrão durante o build
const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-supabase-url.com';
}

const getSupabaseAnonKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-for-build';
}

// Verificar se estamos em ambiente de build
const isStaticBuild = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

// Mock do cliente Supabase para ambiente de build
const mockClient = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null }),
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
      gte: () => ({
        count: async () => ({ count: 0, error: null }),
      }),
      count: () => ({ count: 0, error: null }),
    }),
    insert: () => ({ error: null }),
    update: () => ({
      eq: () => ({
        eq: () => ({ error: null }),
      }),
    }),
  }),
};

export const createClient = async () => {
  try {
    // Se estamos em ambiente de build estático, retorne o mock
    if (isStaticBuild()) {
      console.warn('Usando cliente Supabase simulado para build estático');
      return mockClient;
    }

    const cookieStore = await cookies()
    
    return createServerClient(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
  } catch (error) {
    console.error('Erro ao criar cliente Supabase:', error);
    return mockClient;
  }
}

// Nova função para criar cliente em rotas de API
export const createRouteClient = async () => {
  try {
    // Se estamos em ambiente de build estático, retorne o mock
    if (isStaticBuild()) {
      console.warn('Usando cliente Supabase simulado para build estático (API route)');
      return mockClient;
    }

    const cookieStore = await cookies()
    
    return createServerClient(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
  } catch (error) {
    console.error('Erro ao criar cliente Supabase para rota de API:', error);
    return mockClient;
  }
}
