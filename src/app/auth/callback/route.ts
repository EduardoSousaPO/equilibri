import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Forçar que a rota seja dinâmica (necessário para o Next.js)
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    
    console.log('Auth Callback - Iniciando processamento')
    console.log('Auth Callback - URL completa:', request.url)
    console.log('Auth Callback - Código de autenticação recebido:', code ? 'Sim' : 'Não')
    
    if (!code) {
      console.error('Auth Callback - ERRO: Código de autenticação ausente')
      return NextResponse.redirect(new URL('/login?error=no_code', requestUrl))
    }
    
    // Criar o cliente Supabase específico para manipulação de rotas
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      // Troca o código de autorização por uma sessão
      console.log('Auth Callback - Trocando código por sessão...')
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth Callback - ERRO ao trocar código por sessão:', error.message, error)
        return NextResponse.redirect(new URL(`/login?error=auth_error&message=${encodeURIComponent(error.message)}`, requestUrl))
      }
      
      // Verificar se a sessão foi criada com sucesso
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.error('Auth Callback - ERRO: Sessão não encontrada após troca de código')
        return NextResponse.redirect(new URL('/login?error=no_session', requestUrl))
      }
      
      console.log('Auth Callback - Sessão criada com sucesso:', !!session)
      console.log('Auth Callback - Redirecionando para dashboard')
      
      return NextResponse.redirect(new URL('/app/dashboard', requestUrl))
    } catch (err: any) {
      console.error('Auth Callback - Exceção ao processar autenticação:', err.message || err)
      return NextResponse.redirect(new URL(`/login?error=exception&message=${encodeURIComponent(err.message || 'Erro desconhecido')}`, requestUrl))
    }
  } catch (err: any) {
    console.error('Auth Callback - Erro crítico:', err.message || err)
    return NextResponse.redirect(new URL('/login?error=critical', request.url))
  }
} 