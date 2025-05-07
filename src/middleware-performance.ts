import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware para otimização de desempenho e segurança
export function middleware(request: NextRequest) {
  // Criar resposta
  const response = NextResponse.next();
  
  // Definir cabeçalhos de cache para recursos estáticos
  const url = request.nextUrl.pathname;
  
  if (
    url.includes('/_next/static') || 
    url.includes('/images/') ||
    url.endsWith('.jpg') ||
    url.endsWith('.png') ||
    url.endsWith('.svg') ||
    url.endsWith('.webp') ||
    url.endsWith('.css') ||
    url.endsWith('.js')
  ) {
    // Usar Headers API para manipular cabeçalhos
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Adicionar cabeçalhos de segurança usando Headers API
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co https://api.openai.com https://api.mercadopago.com;");
  
  return response;
}
