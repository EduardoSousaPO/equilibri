import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Implementação do hook useMediaQuery
export function useMediaQuery(query: string): boolean {
  // Implementação simplificada para testes
  return window.matchMedia(query).matches;
}

// Componente de exemplo para testes de responsividade
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
