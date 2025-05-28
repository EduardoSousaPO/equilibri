import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    checks: {
      supabaseUrl: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurado' : 'Não configurado',
        length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0
      },
      supabaseAnonKey: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado',
        length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
      },
      openaiKey: {
        exists: !!process.env.OPENAI_API_KEY,
        value: process.env.OPENAI_API_KEY ? 'Configurado' : 'Não configurado',
        length: process.env.OPENAI_API_KEY?.length || 0
      }
    }
  };

  return NextResponse.json(envCheck);
} 