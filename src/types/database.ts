import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Tipos para as tabelas do Supabase
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
export type AudioEntry = Database['public']['Tables']['audio_entries']['Row'];
export type EmotionCheckin = Database['public']['Tables']['emotion_checkins']['Row'];
export type WeeklyReport = Database['public']['Tables']['weekly_reports']['Row'];
export type TherapyGoal = Database['public']['Tables']['therapy_goals']['Row'];
export type TherapyTechnique = Database['public']['Tables']['therapy_techniques']['Row'];
export type UserTechnique = Database['public']['Tables']['user_techniques']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type ResourceUsage = Database['public']['Tables']['resource_usage']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];

// Tipos para inserção de dados
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert'];
export type AudioEntryInsert = Database['public']['Tables']['audio_entries']['Insert'];
export type EmotionCheckinInsert = Database['public']['Tables']['emotion_checkins']['Insert'];
export type TherapyGoalInsert = Database['public']['Tables']['therapy_goals']['Insert'];
export type UserTechniqueInsert = Database['public']['Tables']['user_techniques']['Insert'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];

// Tipos para atualização de dados
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type JournalEntryUpdate = Database['public']['Tables']['journal_entries']['Update'];
export type AudioEntryUpdate = Database['public']['Tables']['audio_entries']['Update'];
export type TherapyGoalUpdate = Database['public']['Tables']['therapy_goals']['Update'];
export type UserTechniqueUpdate = Database['public']['Tables']['user_techniques']['Update'];
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

// Tipos para emoções
export type Emotion = 'happy' | 'calm' | 'sad' | 'anxious' | 'angry' | 'neutral';

// Tipos para níveis de assinatura
export type SubscriptionTier = 'free' | 'premium';

// Tipos para status de assinatura
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

// Tipos para status de pagamento
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded';

// Tipos para status de metas
export type GoalStatus = 'active' | 'completed' | 'abandoned';

// Tipos para temas
export type Theme = 'light' | 'dark' | 'system';

// Tipos para categorias de técnicas terapêuticas
export type TherapyCategory = 'TCC' | 'ACT' | 'DBT' | 'Mindfulness' | 'Other';

// Tipos para recursos
export type ResourceType = 'journal_entry' | 'audio_entry' | 'weekly_report';
