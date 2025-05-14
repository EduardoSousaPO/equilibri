/**
 * Arquivo de índice para exportar funções do Supabase
 * 
 * Este arquivo centraliza as importações e exportações para garantir
 * uma API consistente para o Supabase em todo o projeto
 * 
 * ATENÇÃO: Este arquivo exporta apenas funções de cliente
 * Para funções de servidor, use diretamente server-queries.ts
 */

// Exportar apenas funções do cliente
export { 
  createClientSupabaseClient,
  checkUserAuthentication,
  createEmotionCheckin,
  createTherapyGoal,
  updateTherapyGoal,
  deleteTherapyGoal,
  toggleFavoriteTechnique,
  updateResourceUsage,
  updateProfile,
  checkMessageLimit,
  incrementMessageCount
} from './client-queries'

// NÃO exporte funções de servidor aqui!
// Estas devem ser importadas diretamente do arquivo server-queries.ts
// em componentes do lado do servidor
