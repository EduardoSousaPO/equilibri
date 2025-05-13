import { generatePdfReport, generateMonthlyReport, MoodEntry, Highlight, ChatMessage } from '../pdf';
import { subDays } from 'date-fns';

// Mock do ambiente
// NODE_ENV é read-only, então usamos Object.defineProperty para modificá-lo
const originalEnv = process.env.NODE_ENV;
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  configurable: true
});

// Mock do URL.createObjectURL para caso o código real for executado
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

describe('Geração de PDF', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restaurar NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      configurable: true
    });
  });

  test('deve gerar um relatório PDF básico', async () => {
    // Dados de teste
    const userId = 'user-123';
    const userName = 'João Silva';
    const period = 'Julho 2023';
    const moodData: MoodEntry[] = [
      {
        date: subDays(new Date(), 5),
        value: 4,
        note: 'Dia produtivo'
      },
      {
        date: subDays(new Date(), 3),
        value: 3,
        note: 'Dia normal'
      },
      {
        date: subDays(new Date(), 1),
        value: 5,
        note: 'Dia excelente'
      }
    ];
    const highlights: Highlight[] = [
      {
        title: 'Progresso na terapia',
        content: 'Consegui aplicar as técnicas de respiração em uma situação de estresse',
        date: subDays(new Date(), 4)
      }
    ];
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: 'Como lidar com a ansiedade no trabalho?',
        created_at: subDays(new Date(), 7)
      },
      {
        role: 'assistant',
        content: 'Você pode tentar técnicas de respiração e pausas regulares para reduzir a ansiedade.',
        created_at: subDays(new Date(), 7)
      }
    ];

    // Chamar a função
    const report = await generatePdfReport(
      userId,
      userName,
      period,
      moodData,
      highlights,
      messages
    );

    // Verificar o resultado
    expect(report).toBeDefined();
    expect(report.title).toBe('Relatório Julho 2023');
    expect(report.url).toBe('mock-url');
  });

  test('deve gerar um relatório PDF vazio quando não há dados', async () => {
    // Chamar a função sem dados
    const report = await generatePdfReport(
      'user-123',
      'Maria Oliveira',
      'Agosto 2023',
      [], // Sem dados de humor
      [], // Sem destaques
      []  // Sem mensagens
    );

    // Verificar o resultado
    expect(report).toBeDefined();
    expect(report.title).toBe('Relatório Agosto 2023');
    expect(report.url).toBe('mock-url');
  });

  test('deve gerar um relatório mensal correto', async () => {
    // Dados de teste
    const userId = 'user-123';
    const userName = 'João Silva';
    const moodData: MoodEntry[] = [
      {
        date: subDays(new Date(), 5),
        value: 4
      }
    ];
    const highlights: Highlight[] = [
      {
        title: 'Progresso na terapia',
        content: 'Consegui aplicar as técnicas de respiração',
        date: subDays(new Date(), 4)
      }
    ];
    const messages: ChatMessage[] = [];

    // Mock da data atual para controlar o resultado do mês
    const mockDate = new Date(2023, 7, 15); // 15 de Agosto de 2023
    const originalDate = global.Date;
    
    // @ts-ignore - Para contornar problemas de tipagem no mock
    global.Date = jest.fn(() => mockDate);
    global.Date.UTC = originalDate.UTC;
    global.Date.parse = originalDate.parse;
    global.Date.now = originalDate.now;

    // Chamar a função
    const report = await generateMonthlyReport(
      userId,
      userName,
      moodData,
      highlights,
      messages
    );

    // Verificar o resultado
    expect(report).toBeDefined();
    expect(report.title).toContain('Relatório julho de 2023');
    expect(report.url).toBe('mock-url');

    // Restaurar o mock da data
    global.Date = originalDate;
  });
}); 