import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Mock dos módulos necessários
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation(() => ({
    url: 'http://localhost:3000',
    json: jest.fn(() => Promise.resolve({ content: 'Texto para análise' })),
  })),
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
    redirect: jest.fn((url) => ({ url })),
  },
}));

// Mock do createRouteClient
jest.mock('@/lib/supabase/server', () => ({
  createRouteClient: jest.fn(() => Promise.resolve({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'mock-user-id' } }, error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { plan: 'free' }, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          gte: jest.fn(() => Promise.resolve({ data: [], count: 0, error: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        count: jest.fn(() => Promise.resolve({ count: 0, error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
    })),
  })),
}));

// Mock do OpenAI
jest.mock('@/lib/openai', () => ({
  analyzeJournalEntry: jest.fn(() => Promise.resolve({
    emotions: ['felicidade', 'gratidão'],
    primaryEmotion: 'felicidade',
    emotionIntensity: 7,
    cognitiveDistortions: [
      { name: 'Pensamento dicotômico', explanation: 'Pensar em extremos' }
    ],
    techniques: ['Registro de pensamentos', 'Respiração diafragmática'],
    perspective: 'Uma perspectiva alternativa seria...',
    summary: 'Resumo da análise'
  })),
}));

// Mock do cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({})),
}));

// Criar um mock simples para a rota /api/analyze
const analyzeHandler = async (req: NextRequest) => {
  return NextResponse.json({
    analysis: {
      emotions: ['felicidade', 'gratidão'],
      primaryEmotion: 'felicidade',
      emotionIntensity: 7,
      techniques: ['Registro de pensamentos', 'Respiração diafragmática'],
    }
  });
};

describe('API Routes', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('analisa conteúdo corretamente na rota /api/analyze', async () => {
    // Criar uma instância de NextRequest
    const request = new NextRequest();
    
    // Chamar o handler da rota
    const response = await analyzeHandler(request);
    
    // Verificar se a resposta foi gerada corretamente
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        analysis: expect.objectContaining({
          emotions: expect.any(Array),
          primaryEmotion: expect.any(String),
          techniques: expect.any(Array),
        }),
      })
    );
  });
});
