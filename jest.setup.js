import '@testing-library/jest-dom';

// Mock para o Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock para o Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClientSupabaseClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ data: null, error: null })),
        download: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    },
    rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
  })),
}));

// Mock para a OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn(() => Promise.resolve({
            choices: [{ message: { content: '{}' } }]
          })),
        },
      },
      audio: {
        transcriptions: {
          create: jest.fn(() => Promise.resolve('Transcrição de teste')),
        },
      },
    };
  });
});

// Mock para o Mercado Pago
jest.mock('mercadopago', () => ({
  configure: jest.fn(),
  preferences: {
    create: jest.fn(() => Promise.resolve({
      body: {
        id: 'test-preference-id',
        init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=test-preference-id',
      }
    })),
  },
  payment: {
    findById: jest.fn(() => Promise.resolve({
      body: {
        status: 'approved',
        transaction_amount: 29.90,
        payment_method_id: 'credit_card',
        metadata: { user_id: 'test-user-id' },
        external_reference: 'test-user-id',
        preference_id: 'test-preference-id',
      }
    })),
  },
}));

// Suprimir logs durante os testes
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Configuração para testes de componentes que usam ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Configuração para testes de componentes que usam window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
