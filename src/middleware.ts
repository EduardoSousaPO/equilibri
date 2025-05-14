import { createServerClient } from '@supabase/ssr'
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
    // Criar uma resposta vazia para começar
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
    
    // Criar o cliente Supabase para o middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Quando configuramos cookies no middleware, precisamos definir tanto no request quanto na response
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            // Quando removemos cookies no middleware, precisamos fazer no request e na response
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Verificar autenticação com getUser() em vez de getSession()
    // getUser() é mais confiável pois sempre verifica com o servidor
    const { data, error } = await supabase.auth.getUser()
    const user = data?.user
    const hasValidSession = !!user

    // Log para depuração
    console.log('Middleware - URL:', request.nextUrl.pathname)
    console.log('Middleware - User:', hasValidSession ? 'Autenticado' : 'Não autenticado')
    if (hasValidSession) {
      console.log('Middleware - User ID:', user.id)
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
