/**
 * Hook de utilidade para verificar media queries
 */
import { useState, useEffect } from 'react';
import React from 'react';

/**
 * Hook para verificar se uma media query corresponde ao viewport atual
 * @param query String de media query (ex: '(max-width: 768px)')
 * @returns boolean indicando se a query corresponde
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Verificar se estamos no lado do cliente, pois window.matchMedia não está disponível no servidor
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Definir o estado inicial
      setMatches(media.matches);
      
      // Definir um listener para atualizar o estado quando a media query mudar
      const listener = () => setMatches(media.matches);
      media.addEventListener('change', listener);
      
      // Limpar o listener quando o componente for desmontado
      return () => media.removeEventListener('change', listener);
    }
    
    return undefined;
  }, [query]);

  return matches;
}

/**
 * Componente para testes de layout responsivo
 */
export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  
  return (
    <div className={`layout ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''} ${isDesktop ? 'desktop' : ''}`}>
      {children}
    </div>
  );
} 