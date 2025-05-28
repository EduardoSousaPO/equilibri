'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

// Helper para lidar com valores padrão durante o build
const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-supabase-url.com';
}

const getSupabaseAnonKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-for-build';
}

// Função para criar cliente Supabase consistente
export const createClient = () => {
  try {
    // Sempre criar um cliente real, mesmo em build, para evitar inconsistências
    return createClientComponentClient<Database>({
      supabaseUrl: getSupabaseUrl(),
      supabaseKey: getSupabaseAnonKey()
    });
  } catch (error) {
    console.error('Erro ao criar cliente Supabase:', error);
    // Ainda retornamos um cliente real, mas com URLs padrão
    return createClientComponentClient<Database>({
      supabaseUrl: 'https://placeholder-supabase-url.com',
      supabaseKey: 'placeholder-anon-key-for-build'
    });
  }
}
