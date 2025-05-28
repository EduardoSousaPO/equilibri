export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          plan: string
          subscription_start_date: string | null
          subscription_end_date: string | null
          therapist_id: string | null
          therapist_share: boolean
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          plan?: string
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          therapist_id?: string | null
          therapist_share?: boolean
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          plan?: string
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          therapist_id?: string | null
          therapist_share?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_therapist_id_fkey"
            columns: ["therapist_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          content: string
          title: string | null
          created_at: string
          updated_at: string
          mood_score: number | null
          analysis: Json | null
          is_favorite: boolean
          tags: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          title?: string | null
          created_at?: string
          updated_at?: string
          mood_score?: number | null
          analysis?: Json | null
          is_favorite?: boolean
          tags?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          title?: string | null
          created_at?: string
          updated_at?: string
          mood_score?: number | null
          analysis?: Json | null
          is_favorite?: boolean
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      audio_entries: {
        Row: {
          id: string
          user_id: string
          audio_url: string
          title: string | null
          duration: number | null
          transcription: string | null
          created_at: string
          updated_at: string
          mood_score: number | null
          analysis: Json | null
          is_favorite: boolean
          tags: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          audio_url: string
          title?: string | null
          duration?: number | null
          transcription?: string | null
          created_at?: string
          updated_at?: string
          mood_score?: number | null
          analysis?: Json | null
          is_favorite?: boolean
          tags?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          audio_url?: string
          title?: string | null
          duration?: number | null
          transcription?: string | null
          created_at?: string
          updated_at?: string
          mood_score?: number | null
          analysis?: Json | null
          is_favorite?: boolean
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_entries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      emotion_checkins: {
        Row: {
          id: string
          user_id: string
          emotion: string
          intensity: number
          note: string | null
          created_at: string
          triggers: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          emotion: string
          intensity: number
          note?: string | null
          created_at?: string
          triggers?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          emotion?: string
          intensity?: number
          note?: string | null
          created_at?: string
          triggers?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "emotion_checkins_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      weekly_reports: {
        Row: {
          id: string
          user_id: string
          week_start: string
          week_end: string
          created_at: string
          content: Json
          insights: string[] | null
          recommendations: string[] | null
          average_mood: number | null
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          week_end: string
          created_at?: string
          content: Json
          insights?: string[] | null
          recommendations?: string[] | null
          average_mood?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          week_start?: string
          week_end?: string
          created_at?: string
          content?: Json
          insights?: string[] | null
          recommendations?: string[] | null
          average_mood?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reports_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      therapy_goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          created_at: string
          updated_at: string
          status: string
          progress: number
          target_date: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
          status?: string
          progress?: number
          target_date?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          status?: string
          progress?: number
          target_date?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapy_goals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      therapy_techniques: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          instructions: string[]
          benefits: string[]
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          instructions: string[]
          benefits: string[]
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          instructions?: string[]
          benefits?: string[]
        }
        Relationships: []
      }
      user_techniques: {
        Row: {
          id: string
          user_id: string
          technique_id: string
          is_favorite: boolean
          times_used: number
          last_used: string | null
          effectiveness_rating: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          technique_id: string
          is_favorite?: boolean
          times_used?: number
          last_used?: string | null
          effectiveness_rating?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          technique_id?: string
          is_favorite?: boolean
          times_used?: number
          last_used?: string | null
          effectiveness_rating?: number | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_techniques_technique_id_fkey"
            columns: ["technique_id"]
            referencedRelation: "therapy_techniques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_techniques_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          user_id: string
          external_id: string | null
          amount: number
          currency: string
          status: string
          payment_method: string | null
          created_at: string
          updated_at: string
          subscription_id: string | null
          description: string | null
        }
        Insert: {
          id?: string
          user_id: string
          external_id?: string | null
          amount: number
          currency?: string
          status: string
          payment_method?: string | null
          created_at?: string
          updated_at?: string
          subscription_id?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          external_id?: string | null
          amount?: number
          currency?: string
          status?: string
          payment_method?: string | null
          created_at?: string
          updated_at?: string
          subscription_id?: string | null
          description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      resource_usage: {
        Row: {
          id: string
          user_id: string
          resource_type: string
          count: number
          month: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_type: string
          count?: number
          month: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_type?: string
          count?: number
          month?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_usage_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          user_id: string
          theme: string
          notifications_enabled: boolean
          email_notifications: boolean
          reminder_time: string | null
          reminder_days: number[] | null
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: string
          notifications_enabled?: boolean
          email_notifications?: boolean
          reminder_time?: string | null
          reminder_days?: number[] | null
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          theme?: string
          notifications_enabled?: boolean
          email_notifications?: boolean
          reminder_time?: string | null
          reminder_days?: number[] | null
          language?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
