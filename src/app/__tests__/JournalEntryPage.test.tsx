// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import JournalEntryPage from '@/app/app/journal/new/page';

// // Mock do cliente Supabase
// jest.mock('@/lib/supabase/client-queries', () => ({
//   createClientSupabaseClient: jest.fn(() => ({
//     auth: {
//       getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
//     },
//     from: jest.fn(() => ({
//       select: jest.fn(() => ({
//         eq: jest.fn(() => ({
//           single: jest.fn(() => Promise.resolve({ data: null, error: null })),
//         })),
//       })),
//       insert: jest.fn(() => ({
//         select: jest.fn(() => ({
//           single: jest.fn(() => Promise.resolve({ data: { id: 'new-entry-id' }, error: null })),
//         })),
//       })),
//     })),
//   })),
//   createJournalEntry: jest.fn(() => Promise.resolve({ data: { id: 'new-entry-id' }, error: null })),
// }));

// // Mock do fetch para a API de análise
// global.fetch = jest.fn(() =>
//   Promise.resolve({
//     ok: true,
//     json: () => Promise.resolve({
//       analysis: {
//         emotions: ['felicidade', 'gratidão'],
//         primaryEmotion: 'felicidade',
//         emotionIntensity: 7,
//         cognitiveDistortions: [
//           { name: 'Pensamento dicotômico', explanation: 'Pensar em extremos' }
//         ],
//         techniques: ['Registro de pensamentos', 'Respiração diafragmática'],
//         perspective: 'Uma perspectiva alternativa seria...',
//         summary: 'Resumo da análise'
//       }
//     }),
//   })
// );

// describe('JournalEntryPage', () => {
//   beforeEach(() => {
//     // Limpar mocks antes de cada teste
//     jest.clearAllMocks();
//   });
// 
//   it('renderiza a página de nova entrada de diário corretamente', async () => {
//     render(<JournalEntryPage />);
//     
//     // Verificar se o título está presente
//     expect(screen.getByText(/nova entrada de diário/i)).toBeInTheDocument();
//     
//     // Verificar se os campos do formulário estão presentes
//     expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/conteúdo/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/humor/i)).toBeInTheDocument();
//     
//     // Verificar se o botão de análise está presente
//     expect(screen.getByText(/analisar conteúdo/i)).toBeInTheDocument();
//   });
// 
//   it('permite preencher e analisar uma entrada de diário', async () => {
//     render(<JournalEntryPage />);
//     
//     // Preencher os campos
//     fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Meu dia hoje' } });
//     fireEvent.change(screen.getByLabelText(/conteúdo/i), { 
//       target: { value: 'Hoje foi um dia muito bom, me senti feliz com várias coisas que aconteceram.' } 
//     });
//     
//     // Clicar no botão de análise
//     fireEvent.click(screen.getByText(/analisar conteúdo/i));
//     
//     // Verificar se a análise é exibida após o carregamento
//     await waitFor(() => {
//       expect(screen.getByText(/análise terapêutica/i)).toBeInTheDocument();
//       expect(screen.getByText(/emoções identificadas/i)).toBeInTheDocument();
//       expect(screen.getByText(/felicidade/i)).toBeInTheDocument();
//     });
//     
//     // Verificar se a chamada à API foi feita corretamente
//     expect(global.fetch).toHaveBeenCalledWith('/api/analyze', expect.any(Object));
//   });
// });
