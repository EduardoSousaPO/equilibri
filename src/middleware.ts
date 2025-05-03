import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define as rotas públicas que não precisam de autenticação
const isPublicRoute = createRouteMatcher([
  '/',
  '/login',
  '/register',
  '/verify',
  '/sso-callback',
  '/api/webhook(.*)',
  '/_next/(.*)'
]);

// Define as rotas que precisam de proteção
const isAppRoute = createRouteMatcher(['/app/(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Se for uma rota protegida, exige autenticação
  if (isAppRoute(req) && !isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Ignorar arquivos estáticos do Next.js
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Sempre executar para rotas de API
    '/(api|trpc)(.*)',
  ],
};
