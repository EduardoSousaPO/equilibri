import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Troca o código de autorização por uma sessão
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL para redirecionar após autenticação bem-sucedida
  return NextResponse.redirect(new URL('/app/dashboard', request.url))
} 