'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { JournalEntryInsert, AudioEntryInsert, EmotionCheckinInsert, TherapyGoalInsert, UserSettingsUpdate } from '@/types/database'

export function createClientSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Verificar limite de entradas de diário para plano gratuito
export async function checkJournalEntryLimit() {
  const supabase = createClientSupabaseClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { limitReached: false, error: 'Não autenticado' }
    }
    
    // Verificar o plano do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()
    
    // Se for premium, não há limite
    if (profile?.subscription_tier !== 'free') {
      return { limitReached: false, error: null }
    }
    
    // Contar entradas de diário do mês atual
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const { count, error: countError } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())
    
    if (countError) throw countError
    
    // Limite para plano gratuito: 50 entradas por mês
    const limitReached = (count || 0) >= 50
    
    return { limitReached, error: null }
  } catch (error) {
    console.error('Error checking journal entry limit:', error)
    return { limitReached: false, error: 'Erro ao verificar limite de entradas' }
  }
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

// Funções para entradas de diário
export async function createJournalEntry(entry: JournalEntryInsert) {
  const supabase = createClientSupabaseClient()
  
  try {
    // Validar entrada
    if (!entry.user_id) {
      // Verificar autenticação do usuário
      const { user, error: authError } = await checkUserAuthentication()
      
      if (authError) {
        throw new Error(`Erro de autenticação: ${authError}`)
      }
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
      
      // Usar o ID do usuário autenticado
      entry.user_id = user.id
    }
    
    if (!entry.content || entry.content.trim() === '') {
      throw new Error('Conteúdo é obrigatório')
    }
    
    // Verificar limite antes de criar
    const { limitReached, error: limitError } = await checkJournalEntryLimit()
    
    if (limitError) {
      throw new Error(`Erro ao verificar limite de entradas: ${limitError}`)
    }
    
    if (limitReached) {
      return { data: null, error: 'Limite de entradas atingido para o plano gratuito' }
    }
    
    // Certificar-se de que todos os campos obrigatórios estão presentes
    const validatedEntry = {
      user_id: entry.user_id,
      title: entry.title || 'Sem título',
      content: entry.content.trim(),
      mood_score: entry.mood_score || 5,
      tags: entry.tags || null,
      analysis: entry.analysis || null,
      is_favorite: entry.is_favorite || false
    }
    
    // Tentar criar o registro principal
    const { data, error } = await supabase
      .from('journal_entries')
      .insert(validatedEntry)
      .select()
      .single()
    
    if (error) {
      console.error('Erro Supabase ao criar entrada:', JSON.stringify(error))
      throw error
    }
    
    if (!data) {
      throw new Error('Entrada criada, mas nenhum dado foi retornado')
    }
    
    // Atualizar o uso de recursos
    try {
    await updateResourceUsage('journal_entry')
    } catch (resourceError) {
      // Apenas logar erro, não deve impedir a criação da entrada
      console.warn('Erro ao atualizar uso de recursos:', resourceError)
    }
    
    return { data, error: null }
  } catch (error: any) {
    console.error('Erro detalhado ao criar entrada de diário:', error)
    console.error('Mensagem de erro:', error.message)
    
    if (error.code) {
      console.error('Código de erro:', error.code)
    }
    
    if (error.details) {
      console.error('Detalhes do erro:', error.details)
    }
    
    return { 
      data: null, 
      error: error.message || 'Erro ao criar entrada de diário'
    }
  }
}

export async function updateJournalEntry(id: string, updates: Partial<JournalEntryInsert>) {
  const supabase = createClientSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error updating journal entry:', error)
    return { data: null, error: 'Erro ao atualizar entrada de diário' }
  }
}

export async function deleteJournalEntry(id: string) {
  const supabase = createClientSupabaseClient()
  
  try {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return { error: null }
  } catch (error) {
    console.error('Error deleting journal entry:', error)
    return { error: 'Erro ao excluir entrada de diário' }
  }
}

// Funções para entradas de áudio
export async function createAudioEntry(entry: AudioEntryInsert) {
  const supabase = createClientSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('audio_entries')
      .insert(entry)
      .select()
      .single()
    
    if (error) throw error
    
    // Atualizar o uso de recursos
    await updateResourceUsage('audio_entry')
    
    return { data, error: null }
  } catch (error) {
    console.error('Error creating audio entry:', error)
    return { data: null, error: 'Erro ao criar entrada de áudio' }
  }
}

export async function updateAudioEntry(id: string, updates: Partial<AudioEntryInsert>) {
  const supabase = createClientSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('audio_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error updating audio entry:', error)
    return { data: null, error: 'Erro ao atualizar entrada de áudio' }
  }
}

export async function deleteAudioEntry(id: string) {
  const supabase = createClientSupabaseClient()
  
  try {
    const { error } = await supabase
      .from('audio_entries')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return { error: null }
  } catch (error) {
    console.error('Error deleting audio entry:', error)
    return { error: 'Erro ao excluir entrada de áudio' }
  }
}

// Funções para upload de áudio
export async function uploadAudio(file: File, userId: string) {
  const supabase = createClientSupabaseClient()
  
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    const filePath = `audio/${fileName}`
    
    const { data, error } = await supabase
      .storage
      .from('audio_uploads')
      .upload(filePath, file)
    
    if (error) throw error
    
    // Obter URL pública
    const { data: { publicUrl } } = supabase
      .storage
      .from('audio_uploads')
      .getPublicUrl(filePath)
    
    return { data: publicUrl, error: null }
  } catch (error) {
    console.error('Error uploading audio:', error)
    return { data: null, error: 'Erro ao fazer upload do áudio' }
  }
}

// Funções para check-ins emocionais
export async function createEmotionCheckin(checkin: EmotionCheckinInsert) {
  const supabase = createClientSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('emotion_checkins')
      .insert(checkin)
      .select()
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error creating emotion checkin:', error)
    return { data: null, error: 'Erro ao criar check-in emocional' }
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

export async function incrementTechniqueUsage(techniqueId: string) {
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
        .update({ 
          times_used: existingTechnique.times_used + 1,
          last_used: new Date().toISOString()
        })
        .eq('id', existingTechnique.id)
      
      if (error) throw error
    } else {
      // Criar um novo registro
      const { error } = await supabase
        .from('user_techniques')
        .insert({
          user_id: user.id,
          technique_id: techniqueId,
          times_used: 1,
          last_used: new Date().toISOString()
        })
      
      if (error) throw error
    }
    
    return { error: null }
  } catch (error) {
    console.error('Error incrementing technique usage:', error)
    return { error: 'Erro ao atualizar uso da técnica' }
  }
}

// Funções para configurações do usuário
export async function updateUserSettings(updates: UserSettingsUpdate) {
  const supabase = createClientSupabaseClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: 'Não autenticado' }
    }
    
    // Verificar se já existe um registro para este usuário
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    let data
    
    if (existingSettings) {
      // Atualizar o registro existente
      const { data: updatedData, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) throw error
      data = updatedData
    } else {
      // Criar um novo registro
      const { data: newData, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          ...updates
        })
        .select()
        .single()
      
      if (error) throw error
      data = newData
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error updating user settings:', error)
    return { data: null, error: 'Erro ao atualizar configurações do usuário' }
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
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { data: null, error: 'Erro ao atualizar perfil' }
  }
}
