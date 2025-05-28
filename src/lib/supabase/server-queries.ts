import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => {
          return cookieStore.get(name)?.value
        },
        set: (name, value, options) => {
          try {
            cookieStore.set({
              name, 
              value,
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              maxAge: 60 * 60 * 24 * 7, // 7 dias
              path: '/'
            })
          } catch (error) {
            // Supabase SSR tem um bug conhecido que tenta definir cookies mais de uma vez
            console.log(`Erro ao definir cookie ${name}, isso pode ser normal em SSR:`, error)
          }
        },
        remove: (name, options) => {
          cookieStore.set({
            name, 
            value: '',
            ...options,
            path: '/',
            maxAge: 0
          })
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  )
}

export async function getProfile() {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return null
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    return profile
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

export async function getJournalEntries(limit = 10, offset = 0) {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { data: null, error: 'Não autenticado' }
    }
    
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return { data: null, error: 'Erro ao buscar entradas do diário' }
  }
}

export async function getAudioEntries(limit = 10, offset = 0) {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { data: null, error: 'Não autenticado' }
    }
    
    const { data, error } = await supabase
      .from('audio_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching audio entries:', error)
    return { data: null, error: 'Erro ao buscar entradas de áudio' }
  }
}

export async function getEmotionCheckins(limit = 10, offset = 0) {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { data: null, error: 'Não autenticado' }
    }
    
    const { data, error } = await supabase
      .from('emotion_checkins')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching emotion checkins:', error)
    return { data: null, error: 'Erro ao buscar check-ins emocionais' }
  }
}

export async function getWeeklyReports(limit = 10, offset = 0) {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { data: null, error: 'Não autenticado' }
    }
    
    const { data, error } = await supabase
      .from('weekly_reports')
      .select('*')
      .eq('user_id', session.user.id)
      .order('week_start', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching weekly reports:', error)
    return { data: null, error: 'Erro ao buscar relatórios semanais' }
  }
}

export async function getTherapyGoals() {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { data: null, error: 'Não autenticado' }
    }
    
    const { data, error } = await supabase
      .from('therapy_goals')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching therapy goals:', error)
    return { data: null, error: 'Erro ao buscar metas terapêuticas' }
  }
}

export async function getTherapyTechniques() {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('therapy_techniques')
      .select('*')
      .order('name')
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching therapy techniques:', error)
    return { data: null, error: 'Erro ao buscar técnicas terapêuticas' }
  }
}

export async function getUserTechniques() {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { data: null, error: 'Não autenticado' }
    }
    
    const { data, error } = await supabase
      .from('user_techniques')
      .select(`
        *,
        therapy_techniques (*)
      `)
      .eq('user_id', session.user.id)
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching user techniques:', error)
    return { data: null, error: 'Erro ao buscar técnicas do usuário' }
  }
}

export async function getUserSettings() {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { data: null, error: 'Não autenticado' }
    }
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return { data: null, error: 'Erro ao buscar configurações do usuário' }
  }
}

export async function getResourceUsage(resourceType: string, month: string) {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { data: null, error: 'Não autenticado' }
    }
    
    const { data, error } = await supabase
      .from('resource_usage')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('resource_type', resourceType)
      .eq('month', month)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching resource usage:', error)
    return { data: null, error: 'Erro ao buscar uso de recursos' }
  }
}

export async function getPayments(limit = 10, offset = 0) {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { data: null, error: 'Não autenticado' }
    }
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching payments:', error)
    return { data: null, error: 'Erro ao buscar pagamentos' }
  }
}
