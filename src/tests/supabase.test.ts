import { test, expect } from '@jest/globals';
import { createClient } from '../lib/supabase/client';
import { createClientSupabaseClient } from '../lib/supabase/client-queries';
import { createServerSupabaseClient } from '../lib/supabase/server-queries';

// Mock das funções do Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } },
        error: null
      }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      })
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'test-id', name: 'Test User' },
        error: null
      })
    })
  }))
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } },
        error: null
      })
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'test-id', name: 'Test User' },
        error: null
      })
    })
  }))
}));

// Testes para o cliente Supabase
describe('Supabase Client', () => {
  test('createClient deve retornar um cliente Supabase válido', () => {
    const client = createClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.from).toBeDefined();
  });

  test('createClientSupabaseClient deve retornar um cliente Supabase válido', () => {
    const client = createClientSupabaseClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.from).toBeDefined();
  });

  test('createServerSupabaseClient deve retornar um cliente Supabase válido', async () => {
    const client = await createServerSupabaseClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.from).toBeDefined();
  });
});

// Testes para autenticação
describe('Autenticação', () => {
  test('getSession deve retornar uma sessão válida', async () => {
    const client = createClient();
    const { data, error } = await client.auth.getSession();
    
    expect(error).toBeNull();
    expect(data.session).toBeDefined();
    expect(data.session.user.id).toBe('test-user-id');
    expect(data.session.user.email).toBe('test@example.com');
  });

  test('getUser deve retornar um usuário válido', async () => {
    const client = createClient();
    const { data, error } = await client.auth.getUser();
    
    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user.id).toBe('test-user-id');
    expect(data.user.email).toBe('test@example.com');
  });
});

// Testes para operações de banco de dados
describe('Operações de Banco de Dados', () => {
  test('select deve retornar dados válidos', async () => {
    const client = createClient();
    const { data, error } = await client.from('profiles').select('*').eq('id', 'test-user-id').single();
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.id).toBe('test-id');
    expect(data.name).toBe('Test User');
  });
});
