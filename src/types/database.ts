import { Database } from './supabase'

// Tipos de enumeração
export type EmotionType = 'happy' | 'calm' | 'neutral' | 'sad' | 'anxious' | 'angry';
export type PlanType = 'free' | 'pro' | 'clinical';
export type MessageRole = 'user' | 'assistant' | 'system';
export type SlotStatus = 'free' | 'booked';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded';
export type GoalStatus = 'active' | 'completed' | 'abandoned';
export type Theme = 'light' | 'dark' | 'system';
export type ResourceType = 'message' | 'checkin' | 'report';
export type TherapyCategory = 'TCC' | 'ACT' | 'DBT' | 'Mindfulness' | 'Other';

// Definição do perfil de usuário
export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  plan: PlanType;
  msg_count: number;
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

// Definições para check-ins emocionais
export interface EmotionCheckin {
  id: string;
  user_id: string;
  emotion: EmotionType;
  intensity: number;
  note: string | null;
  created_at: string;
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

export interface InteractionAnalysis {
  id: string;
  user_id: string;
  message_id: string;
  cognitive_automatic_thoughts: string[];
  cognitive_distortions: string[];
  cognitive_core_beliefs: string[];
  values_areas: string[];
  values_conflicts: string[];
  values_purpose_crisis: boolean;
  emotional_intensity: number;
  emotional_coping_strategies: string[];
  emotional_triggers: string[];
  behavioral_avoidance: string[];
  behavioral_functional: string[];
  behavioral_dysfunctional: string[];
  behavioral_context: string[];
  engagement_insight: number;
  engagement_motivation: number;
  engagement_interventions: string[];
  created_at: string;
}

export interface InteractionAnalysisSummary {
  user_id: string;
  total_interactions: number;
  avg_emotional_intensity: number;
  avg_insight_level: number;
  avg_motivation: number;
  purpose_crisis_count: number;
  all_distortions: string[];
  all_triggers: string[];
  all_valued_areas: string[];
}
