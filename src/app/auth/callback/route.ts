import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log('Auth Callback - Código recebido:', code ? 'Sim' : 'Não')
  
  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      // Troca o código de autorização por uma sessão
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth Callback - Erro ao trocar código por sessão:', error.message)
        return NextResponse.redirect(new URL('/login?error=auth_callback_error', requestUrl))
      }
      
      console.log('Auth Callback - Sessão criada com sucesso')
      
      // Redirecionar para dashboard
      return NextResponse.redirect(new URL('/app/dashboard', requestUrl))
    } catch (err) {
      console.error('Auth Callback - Exceção ao processar autenticação:', err)
      return NextResponse.redirect(new URL('/login?error=auth_exception', requestUrl))
    }
  }

  // Código não encontrado, redirecionar para login
  console.log('Auth Callback - Código não encontrado, redirecionando para login')
  return NextResponse.redirect(new URL('/login?error=no_code', requestUrl))
} 