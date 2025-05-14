import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define as rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/verify',
  '/api/webhook(.*)',
  '/api/payments/webhook(.*)',
  '/api/webhooks/mercadopago(.*)',
  '/_next/(.*)',
  '/favicon.ico',
  '/auth/(.*)'
];

// Define as rotas que precisam de proteção
const PROTECTED_ROUTES = ['/app/(.*)'];

export async function middleware(request: NextRequest) {
  try {
    // Criar resposta padrão
    let response = NextResponse.next()
    
    // Criar o cliente Supabase para o middleware usando a biblioteca auth-helpers-nextjs
    const supabase = createMiddlewareClient({ req: request, res: response })

    // Verificar a sessão e atualizar os cookies de autenticação
    const { data: { session } } = await supabase.auth.getSession()
    const hasValidSession = !!session

    // Log para depuração
    console.log('Middleware - URL:', request.nextUrl.pathname)
    console.log('Middleware - User:', hasValidSession ? 'Autenticado' : 'Não autenticado')
    if (hasValidSession) {
      console.log('Middleware - User ID:', session.user.id)
    }

    // Verificar se a rota atual é protegida
    const url = request.nextUrl.pathname
    const isProtectedRoute = PROTECTED_ROUTES.some(route => {
      const regex = new RegExp(`^${route.replace(/\(\.\*\)/g, '.*')}$`)
      return regex.test(url)
    })
    
    const isPublicRoute = PUBLIC_ROUTES.some(route => {
      const regex = new RegExp(`^${route.replace(/\(\.\*\)/g, '.*')}$`)
      return regex.test(url)
    })

    // Redirecionar para login se a rota for protegida e o usuário não estiver autenticado
    if (isProtectedRoute && !hasValidSession) {
      console.log('Middleware - Redirecionando para login, rota protegida sem sessão')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirecionar para o dashboard se o usuário estiver autenticado e acessar rotas de auth
    if (hasValidSession && (url === '/login' || url === '/register')) {
      console.log('Middleware - Redirecionando para dashboard, usuário autenticado acessando rotas de auth')
      return NextResponse.redirect(new URL('/app/dashboard', request.url))
    }

    console.log('Middleware - Continuando navegação normal')
    return response
  } catch (error) {
    console.error('Middleware - Erro ao processar requisição:', error)
    
    // Em caso de erro, direcionar para rotas públicas por segurança
    const url = request.nextUrl.pathname
    const isProtectedRoute = PROTECTED_ROUTES.some(route => {
      const regex = new RegExp(`^${route.replace(/\(\.\*\)/g, '.*')}$`)
      return regex.test(url)
    })
    
    if (isProtectedRoute) {
      console.log('Middleware - Erro ao autenticar usuário, redirecionando para login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Ignorar arquivos estáticos do Next.js
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Sempre executar para rotas de API
    '/(api|trpc)(.*)',
  ],
}
