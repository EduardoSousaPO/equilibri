import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { analyzeJournalEntry } from '@/lib/openai';

// Mock do OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn(() => Promise.resolve({
            choices: [{ 
              message: { 
                content: JSON.stringify({
                  emotions: ['felicidade', 'gratidão'],
                  primaryEmotion: 'felicidade',
                  emotionIntensity: 7,
                  cognitiveDistortions: [
                    { name: 'Pensamento dicotômico', explanation: 'Pensar em extremos' }
                  ],
                  techniques: ['Registro de pensamentos', 'Respiração diafragmática'],
                  perspective: 'Uma perspectiva alternativa seria...',
                  summary: 'Resumo da análise'
                })
              } 
            }]
          })),
        },
      },
    };
  });
});

describe('OpenAI Integration', () => {
  it('analisa corretamente uma entrada de diário', async () => {
    const content = 'Hoje foi um dia muito bom, me senti feliz com várias coisas que aconteceram.';
    
    const result = await analyzeJournalEntry(content);
    
    // Verificar se a análise contém os campos esperados
    expect(result).toHaveProperty('emotions');
    expect(result).toHaveProperty('primaryEmotion');
    expect(result).toHaveProperty('emotionIntensity');
    expect(result).toHaveProperty('cognitiveDistortions');
    expect(result).toHaveProperty('techniques');
    expect(result).toHaveProperty('perspective');
    
    // Verificar valores específicos
    expect(result.emotions).toContain('felicidade');
    expect(result.primaryEmotion).toBe('felicidade');
    expect(result.emotionIntensity).toBe(7);
    expect(result.techniques).toContain('Registro de pensamentos');
  });
});
