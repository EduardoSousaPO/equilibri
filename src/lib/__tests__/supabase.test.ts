import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createClientSupabaseClient } from '@/lib/supabase/client-queries';

// Mock do Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { plan: 'free' }, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'new-entry-id' }, error: null })),
        })),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://test-url.com/test-path' } })),
      })),
    },
  })),
}));

describe('Supabase Integration', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('cria cliente Supabase corretamente', async () => {
    const supabase = createClientSupabaseClient();
    
    // Verificar se o cliente foi criado
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
    expect(supabase.storage).toBeDefined();
  });

  it('obtém usuário autenticado corretamente', async () => {
    const supabase = createClientSupabaseClient();
    const { data } = await supabase.auth.getUser();
    
    // Verificar se o usuário foi obtido
    expect(data.user).toBeDefined();
    expect(data.user?.id).toBe('test-user-id');
  });
});
