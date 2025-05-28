import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UpgradePage from '@/app/app/upgrade/page';

// Mock do cliente Supabase
jest.mock('@/lib/supabase/client-queries', () => ({
  createClientSupabaseClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: { 
              id: 'test-user-id',
              plan: 'free',
              subscription_end_date: null
            }, 
            error: null 
          })),
        })),
      })),
    })),
  })),
}));

// Mock do fetch para a API de pagamentos
const originalFetch = global.fetch;
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      id: 'test-preference-id',
      init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=test-preference-id',
    }),
  } as Response)
);

// Mock para window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('UpgradePage', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
    mockLocation.href = '';
  });

  afterAll(() => {
    // Restaurar o fetch original
    global.fetch = originalFetch;
  });

  it('renderiza a página de upgrade corretamente', async () => {
    render(<UpgradePage />);
    
    // Verificar se o título está presente
    await waitFor(() => {
      expect(screen.getByText(/upgrade para premium/i)).toBeInTheDocument();
    });
    
    // Verificar se os planos são exibidos
    await waitFor(() => {
      expect(screen.getByText(/plano gratuito/i)).toBeInTheDocument();
      expect(screen.getByText(/plano premium/i)).toBeInTheDocument();
    });
    
    // Verificar se o preço do plano premium é exibido
    await waitFor(() => {
      expect(screen.getByText(/r\$ 29,90/i)).toBeInTheDocument();
    });
    
    // Verificar se o botão de upgrade está presente
    await waitFor(() => {
      expect(screen.getByText(/fazer upgrade agora/i)).toBeInTheDocument();
    });
  });

  it('inicia o processo de pagamento ao clicar no botão de upgrade', async () => {
    render(<UpgradePage />);
    
    // Aguardar o carregamento da página
    await waitFor(() => {
      expect(screen.getByText(/fazer upgrade agora/i)).toBeInTheDocument();
    });
    
    // Clicar no botão de upgrade
    fireEvent.click(screen.getByText(/fazer upgrade agora/i));
    
    // Verificar se a chamada à API foi feita corretamente
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/payments/create-preference', expect.any(Object));
    });
    
    // Verificar se o redirecionamento foi feito corretamente
    await waitFor(() => {
      expect(mockLocation.href).toBe('https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=test-preference-id');
    });
  });
});
