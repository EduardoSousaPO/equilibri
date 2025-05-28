'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { EmotionCheckinInsert, TherapyGoalInsert, UserSettingsUpdate } from '@/types/database'

export function createClientSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Verifica se o usuário está autenticado e retorna os dados do usuário
 * Útil para ser chamada antes de operações que exigem autenticação
 */
export async function checkUserAuthentication() {
  const supabase = createClientSupabaseClient()
  
  try {
    const { data, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Erro ao verificar autenticação:', error)
      return { user: null, error: 'Erro ao verificar autenticação' }
    }
    
    if (!data.user) {
      return { user: null, error: 'Usuário não autenticado' }
    }
    
    return { user: data.user, error: null }
  } catch (error: any) {
    console.error('Exceção ao verificar autenticação:', error)
    return { user: null, error: error.message || 'Erro desconhecido ao verificar autenticação' }
  }
}

/**
 * Criar novo registro de check-in emocional
 */
export async function createEmotionCheckin(checkinData: {
  user_id: string;
  emotion: string;
  intensity: number;
  note: string | null;
  triggers?: string[] | null;
}) {
  const supabase = createClientSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('emotion_checkins')
      .insert([{
        ...checkinData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Erro ao criar check-in emocional:', error);
    return { data: null, error: error.message };
  }
}

// Funções para metas terapêuticas
export async function createTherapyGoal(goal: TherapyGoalInsert) {
  const supabase = createClientSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('therapy_goals')
      .insert(goal)
      .select()
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error creating therapy goal:', error)
    return { data: null, error: 'Erro ao criar meta terapêutica' }
  }
}

export async function updateTherapyGoal(id: string, updates: Partial<TherapyGoalInsert>) {
  const supabase = createClientSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('therapy_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error updating therapy goal:', error)
    return { data: null, error: 'Erro ao atualizar meta terapêutica' }
  }
}

export async function deleteTherapyGoal(id: string) {
  const supabase = createClientSupabaseClient()
  
  try {
    const { error } = await supabase
      .from('therapy_goals')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return { error: null }
  } catch (error) {
    console.error('Error deleting therapy goal:', error)
    return { error: 'Erro ao excluir meta terapêutica' }
  }
}

// Funções para técnicas terapêuticas do usuário
export async function toggleFavoriteTechnique(techniqueId: string, isFavorite: boolean) {
  const supabase = createClientSupabaseClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Não autenticado' }
    }
    
    // Verificar se já existe um registro para esta técnica
    const { data: existingTechnique } = await supabase
      .from('user_techniques')
      .select('*')
      .eq('user_id', user.id)
      .eq('technique_id', techniqueId)
      .single()
    
    if (existingTechnique) {
      // Atualizar o registro existente
      const { error } = await supabase
        .from('user_techniques')
        .update({ is_favorite: isFavorite })
        .eq('id', existingTechnique.id)
      
      if (error) throw error
    } else {
      // Criar um novo registro
      const { error } = await supabase
        .from('user_techniques')
        .insert({
          user_id: user.id,
          technique_id: techniqueId,
          is_favorite: isFavorite,
          times_used: 0
        })
      
      if (error) throw error
    }
    
    return { error: null }
  } catch (error) {
    console.error('Error toggling favorite technique:', error)
    return { error: 'Erro ao atualizar técnica favorita' }
  }
}

// Funções para uso de recursos
export async function updateResourceUsage(resourceType: string) {
  const supabase = createClientSupabaseClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.warn('Usuário não autenticado ao tentar atualizar uso de recursos')
      return { error: 'Não autenticado' }
    }
    
    if (!resourceType) {
      console.warn('Tipo de recurso não fornecido')
      return { error: 'Tipo de recurso é obrigatório' }
    }
    
    // Obter o mês atual no formato YYYY-MM-01
    const today = new Date()
    const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
    
    try {
    // Verificar se já existe um registro para este recurso neste mês
      const { data: existingUsage, error: fetchError } = await supabase
      .from('resource_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('resource_type', resourceType)
      .eq('month', month)
      .single()
    
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 é "Nenhum resultado encontrado"
        console.error('Erro ao buscar uso de recursos:', fetchError)
        throw fetchError
      }
      
    if (existingUsage) {
      // Atualizar o registro existente
        const { error: updateError } = await supabase
        .from('resource_usage')
        .update({ count: existingUsage.count + 1 })
        .eq('id', existingUsage.id)
      
        if (updateError) {
          console.error('Erro ao atualizar contador de recursos:', updateError)
          throw updateError
        }
    } else {
      // Criar um novo registro
        const { error: insertError } = await supabase
        .from('resource_usage')
        .insert({
          user_id: user.id,
          resource_type: resourceType,
          month,
          count: 1
        })
      
        if (insertError) {
          console.error('Erro ao inserir registro de uso de recursos:', insertError)
          throw insertError
        }
    }
    
    return { error: null }
    } catch (dbError: any) {
      console.error(`Erro no banco de dados ao atualizar uso de recursos (${resourceType}):`, dbError)
      throw new Error(`Erro de banco de dados: ${dbError.message || dbError}`)
    }
  } catch (error: any) {
    console.error(`Falha ao atualizar uso de recursos (${resourceType}):`, error)
    return { error: `Erro ao atualizar uso de recursos: ${error.message || 'Erro desconhecido'}` }
  }
}

// Funções para perfil do usuário
export async function updateProfile(updates: Partial<{ name: string, avatar_url: string, therapist_share: boolean }>) {
  const supabase = createClientSupabaseClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: 'Não autenticado' }
    }
    
    // Verificar se o perfil já existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    // Preparar os dados a serem inseridos/atualizados
    const profileData = {
      id: user.id,
      ...existingProfile, // Manter dados existentes se houver
      ...updates, // Aplicar as atualizações
      updated_at: new Date().toISOString()
    }
    
    // Usar upsert para criar ou atualizar o perfil
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { data: null, error: 'Erro ao atualizar perfil' }
  }
}

/**
 * Verifica se o usuário atingiu o limite de mensagens no plano gratuito
 */
export async function checkMessageLimit() {
  try {
    // Cria cliente Supabase
    const supabase = createClientSupabaseClient();
    
    // Verifica usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Erro ao verificar usuário:', userError);
      return { limitReached: false, error: userError?.message };
    }
    
    // Busca perfil para verificar plano e contagem de mensagens
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, msg_count')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);
      return { limitReached: false, error: profileError.message };
    }
    
    const plan = profile?.plan || 'free';
    const msgCount = profile?.msg_count || 0;
    
    // Verifica se atingiu limite (30 mensagens para plano gratuito)
    const limitReached = plan === 'free' && msgCount >= 30;
    
    return { limitReached, error: null, plan, msgCount };
  } catch (error: any) {
    console.error('Erro ao verificar limite de mensagens:', error);
    return { limitReached: false, error: error.message };
  }
}

/**
 * Incrementa o contador de mensagens do usuário
 */
export async function incrementMessageCount() {
  try {
    // Cria cliente Supabase
    const supabase = createClientSupabaseClient();
    
    // Verifica usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Erro ao verificar usuário:', userError);
      return { success: false, error: userError?.message };
    }
    
    // Incrementa contagem de mensagens
    const { data, error } = await supabase.rpc('increment_message_count', {
      user_id: user.id
    });
    
    if (error) {
      console.error('Erro ao incrementar contagem:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Erro ao incrementar contagem de mensagens:', error);
    return { success: false, error: error.message };
  }
}
