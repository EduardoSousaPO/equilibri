import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Tipos para as tabelas do Supabase
export type ProfileDB = Database['public']['Tables']['profiles']['Row'];
export type JournalEntryDB = Database['public']['Tables']['journal_entries']['Row'];
export type AudioEntryDB = Database['public']['Tables']['audio_entries']['Row'];
export type EmotionCheckinDB = Database['public']['Tables']['emotion_checkins']['Row'];
export type WeeklyReport = Database['public']['Tables']['weekly_reports']['Row'];
export type TherapyGoalDB = Database['public']['Tables']['therapy_goals']['Row'];
export type TherapyTechnique = Database['public']['Tables']['therapy_techniques']['Row'];
export type UserTechnique = Database['public']['Tables']['user_techniques']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type ResourceUsage = Database['public']['Tables']['resource_usage']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];

// Tipos para inserção de dados
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type JournalEntryInsertDB = Database['public']['Tables']['journal_entries']['Insert'];
export type AudioEntryInsertDB = Database['public']['Tables']['audio_entries']['Insert'];
export type EmotionCheckinInsertDB = Database['public']['Tables']['emotion_checkins']['Insert'];
export type TherapyGoalInsertDB = Database['public']['Tables']['therapy_goals']['Insert'];
export type UserTechniqueInsert = Database['public']['Tables']['user_techniques']['Insert'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];

// Tipos para atualização de dados
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type JournalEntryUpdate = Database['public']['Tables']['journal_entries']['Update'];
export type AudioEntryUpdate = Database['public']['Tables']['audio_entries']['Update'];
export type TherapyGoalUpdate = Database['public']['Tables']['therapy_goals']['Update'];
export type UserTechniqueUpdate = Database['public']['Tables']['user_techniques']['Update'];
export type UserSettingsUpdateDB = Database['public']['Tables']['user_settings']['Update'];

// Tipos para emoções e planos
export type Emotion = 'happy' | 'calm' | 'sad' | 'anxious' | 'angry' | 'neutral';
export type EmotionType = 'happy' | 'sad' | 'neutral' | 'anxious' | 'angry' | 'calm';
export type PlanType = 'free' | 'pro' | 'clinical';
export type SlotStatus = 'free' | 'booked';

// Outros tipos existentes
export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded';
export type GoalStatus = 'active' | 'completed' | 'abandoned';
export type Theme = 'light' | 'dark' | 'system';
export type TherapyCategory = 'TCC' | 'ACT' | 'DBT' | 'Mindfulness' | 'Other';
export type ResourceType = 'journal_entry' | 'audio_entry' | 'weekly_report';

// Definição do perfil de usuário com novos campos
export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: PlanType;
  therapist_share: boolean;
  msg_count: number;
  session_used: boolean;
}

// Interface para atualização de configurações de usuário
export interface UserSettingsUpdate {
  plan?: PlanType;
  therapist_share?: boolean;
  notification_settings?: {
    email?: boolean;
    push?: boolean;
  };
}

// Definições para entradas de diário
export interface JournalEntry {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
  content: string;
  mood_score: number;
  tags: string[] | null;
  analysis: any | null;
  is_favorite: boolean;
}

export interface JournalEntryInsert {
  user_id: string;
  title?: string;
  content: string;
  mood_score?: number;
  tags?: string[] | null;
  analysis?: any | null;
  is_favorite?: boolean;
}

// Definições para entradas de áudio
export interface AudioEntry {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  audio_url: string;
  duration_seconds: number;
  transcription: string | null;
  analysis: any | null;
  is_favorite: boolean;
}

export interface AudioEntryInsert {
  user_id: string;
  title?: string;
  audio_url: string;
  duration_seconds: number;
  transcription?: string | null;
  analysis?: any | null;
  is_favorite?: boolean;
}

// Definições para check-ins emocionais
export interface EmotionCheckin {
  id: string;
  created_at: string;
  user_id: string;
  emotion: EmotionType;
  intensity: number;
  note: string | null;
  triggers: string[] | null;
}

export interface EmotionCheckinInsert {
  user_id: string;
  emotion: EmotionType;
  intensity: number;
  note?: string | null;
  triggers?: string[] | null;
}

// Definições para metas terapêuticas
export interface TherapyGoal {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string | null;
  completed_at: string | null;
}

export interface TherapyGoalInsert {
  user_id: string;
  description: string;
  status?: 'pending' | 'in_progress' | 'completed';
  due_date?: string | null;
}

// Definições para terapeutas
export interface Therapist {
  id: string;
  user_id: string;
  name: string;
  crp: string | null;
  timezone: string | null;
  calendar_credentials: any | null;
  created_at: string;
  updated_at: string;
}

// Definições para slots
export interface Slot {
  id: string;
  therapist_id: string;
  start_utc: string;
  end_utc: string;
  status: SlotStatus;
  created_at: string;
  updated_at: string;
  therapist?: Therapist;
}

export interface SlotInsert {
  therapist_id: string;
  start_utc: string;
  end_utc: string;
  status?: SlotStatus;
}

// Definições para agendamentos
export interface Appointment {
  id: string;
  slot_id: string;
  user_id: string;
  meet_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  slot?: Slot;
}

export interface AppointmentInsert {
  slot_id: string;
  user_id: string;
  meet_link?: string | null;
  notes?: string | null;
}
