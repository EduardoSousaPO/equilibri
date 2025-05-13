import resetLimits from '../reset_limits';
import { createClient } from '@supabase/supabase-js';

// Mock do Supabase
jest.mock('@supabase/supabase-js');

describe('Reset Limites Mensais', () => {
  const mockRpc = jest.fn();
  
  beforeEach(() => {
    // Configure mock
    (createClient as jest.Mock).mockReturnValue({
      rpc: mockRpc
    });
    
    // Mock environment variables
    process.env.SUPABASE_URL = 'https://test-url.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  test('deve resetar limites mensais com sucesso', async () => {
    // Configure o mock para simular sucesso
    mockRpc.mockResolvedValueOnce({
      error: null
    });
    
    // Execute a função
    const result = await resetLimits();
    
    // Verifique as chamadas e o resultado
    expect(createClient).toHaveBeenCalledWith(
      'https://test-url.supabase.co',
      'test-service-key'
    );
    
    expect(mockRpc).toHaveBeenCalledWith('reset_monthly_limits');
    
    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Limites mensais resetados' })
    });
  });
  
  test('deve lidar com erros do Supabase', async () => {
    // Configure o mock para simular erro
    mockRpc.mockResolvedValueOnce({
      error: { message: 'Erro de banco de dados' }
    });
    
    // Configura spy para console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Execute a função
    const result = await resetLimits();
    
    // Verifique o resultado
    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({ error: 'Falha ao resetar limites mensais' })
    });
    
    // Verifique se o erro foi logado
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Restaurar console.error
    consoleErrorSpy.mockRestore();
  });
  
  test('deve capturar exceções não tratadas', async () => {
    // Configure o mock para lançar uma exceção
    mockRpc.mockRejectedValueOnce(new Error('Erro inesperado'));
    
    // Configura spy para console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Execute a função
    const result = await resetLimits();
    
    // Verifique o resultado
    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    });
    
    // Verifique se o erro foi logado
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Restaurar console.error
    consoleErrorSpy.mockRestore();
  });
}); 