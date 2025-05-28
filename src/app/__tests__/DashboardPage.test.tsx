import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '@/app/app/dashboard/page';

// Mock do cliente Supabase
jest.mock('@/lib/supabase/client-queries', () => ({
  createClientSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { plan: 'free' }, error: null })),
          count: jest.fn(() => Promise.resolve({ count: 5, error: null })),
          order: jest.fn(() => Promise.resolve({ 
            data: [
              { id: '1', emotion: 'happy', intensity: 4, created_at: new Date().toISOString() },
              { id: '2', emotion: 'sad', intensity: 3, created_at: new Date().toISOString() }
            ], 
            error: null 
          })),
        })),
      })),
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
    },
  })),
}));

describe('DashboardPage', () => {
  it('renderiza o dashboard corretamente', async () => {
    render(<DashboardPage />);
    
    // Verificar se o título está presente
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
    
    // Verificar se os cards de estatísticas são exibidos
    await waitFor(() => {
      expect(screen.getByText(/entradas de diário/i)).toBeInTheDocument();
      expect(screen.getByText(/check-ins emocionais/i)).toBeInTheDocument();
    });
    
    // Verificar se os botões de ação rápida estão presentes
    await waitFor(() => {
      expect(screen.getByText(/nova entrada/i)).toBeInTheDocument();
      expect(screen.getByText(/check-in emocional/i)).toBeInTheDocument();
    });
  });
});
