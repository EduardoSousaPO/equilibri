'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgendaRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página de agenda correta
    router.push('/agenda');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-l-2 border-primary"></div>
      <p className="ml-3 text-text-primary">Redirecionando para agenda...</p>
    </div>
  );
} 