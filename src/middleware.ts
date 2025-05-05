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
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
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

  // Atualizar a sessão do usuário se existir
  const { data: { session } } = await supabase.auth.getSession()

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
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirecionar para o dashboard se o usuário estiver autenticado e acessar rotas de auth
  if (session && url.includes('/login') || session && url.includes('/register')) {
    return NextResponse.redirect(new URL('/app/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Ignorar arquivos estáticos do Next.js
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Sempre executar para rotas de API
    '/(api|trpc)(.*)',
  ],
}
