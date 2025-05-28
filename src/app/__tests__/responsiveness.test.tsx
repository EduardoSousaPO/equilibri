import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useMediaQuery } from '@/hooks/mediaQueryUtils';

// Mock do hook useMediaQuery
jest.mock('@/hooks/mediaQueryUtils', () => ({
  useMediaQuery: jest.fn(),
}));

// Componente de teste para responsividade
function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  
  return (
    <div>
      {isMobile && <div data-testid="mobile-view">Visualização Mobile</div>}
      {isTablet && <div data-testid="tablet-view">Visualização Tablet</div>}
      {isDesktop && <div data-testid="desktop-view">Visualização Desktop</div>}
    </div>
  );
}

describe('Responsividade', () => {
  it('exibe a visualização mobile em telas pequenas', () => {
    // Configurar o mock para simular uma tela mobile
    (useMediaQuery as jest.Mock).mockImplementation((query) => {
      if (query === '(max-width: 768px)') return true;
      return false;
    });
    
    render(<ResponsiveComponent />);
    
    // Verificar se a visualização mobile está presente
    expect(screen.getByTestId('mobile-view')).toBeInTheDocument();
    expect(screen.queryByTestId('tablet-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('desktop-view')).not.toBeInTheDocument();
  });
  
  it('exibe a visualização tablet em telas médias', () => {
    // Configurar o mock para simular uma tela tablet
    (useMediaQuery as jest.Mock).mockImplementation((query) => {
      if (query === '(min-width: 769px) and (max-width: 1024px)') return true;
      return false;
    });
    
    render(<ResponsiveComponent />);
    
    // Verificar se a visualização tablet está presente
    expect(screen.queryByTestId('mobile-view')).not.toBeInTheDocument();
    expect(screen.getByTestId('tablet-view')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-view')).not.toBeInTheDocument();
  });
  
  it('exibe a visualização desktop em telas grandes', () => {
    // Configurar o mock para simular uma tela desktop
    (useMediaQuery as jest.Mock).mockImplementation((query) => {
      if (query === '(min-width: 1025px)') return true;
      return false;
    });
    
    render(<ResponsiveComponent />);
    
    // Verificar se a visualização desktop está presente
    expect(screen.queryByTestId('mobile-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tablet-view')).not.toBeInTheDocument();
    expect(screen.getByTestId('desktop-view')).toBeInTheDocument();
  });
});
