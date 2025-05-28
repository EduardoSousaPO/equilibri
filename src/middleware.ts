// Arquivo de middleware mínimo sem verificações
import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'

// Este middleware não faz nada, apenas passa todas as requisições adiante
export async function middleware(req: NextRequest) {
  // Criar cliente Supabase para o middleware
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Verificar se há uma sessão válida
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // URL atual
  const url = new URL(req.url)
  const { pathname } = url
  
  console.log("🔑 [Middleware] Verificando acesso para:", pathname)

  // Rotas que não exigem autenticação
  const publicRoutes = [
    '/login', 
    '/register', 
    '/auth/', 
    '/quick-login',
    '/api/auth-debug'
  ]
  
  // Verificar se a rota atual é pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || 
                        pathname === '/' || 
                        pathname.startsWith('/_next') || 
                        pathname.startsWith('/images/') ||
                        pathname.startsWith('/api/payments/') ||
                        pathname.includes('.ico') ||
                        pathname.includes('.svg') ||
                        pathname.includes('.jpg') ||
                        pathname.includes('.png')
  
  // Redirecionar usuários não autenticados para login
  // Exceto em rotas públicas
  if (!session && !isPublicRoute) {
    console.log("🔒 [Middleware] Usuário não autenticado, redirecionando para login")
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  
  // Redirecionar usuários já autenticados para o dashboard
  // Quando tentam acessar páginas de login/registro
  if (session && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
    console.log("🔓 [Middleware] Usuário já autenticado, redirecionando para dashboard")
    url.pathname = '/app/dashboard'
    return NextResponse.redirect(url)
  }
  
  return res
}

// Configurar o matcher para as rotas que o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
