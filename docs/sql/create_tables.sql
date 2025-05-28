-- Criação das tabelas principais para o Equilibri.IA
-- Este script cria todas as tabelas necessárias para o funcionamento do aplicativo

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  msg_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  meet_link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de entradas de áudio
CREATE TABLE IF NOT EXISTS public.audio_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT,
  title TEXT,
  duration INTEGER,
  transcription TEXT,
  mood_score INTEGER,
  analysis JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de transcrições de áudio
CREATE TABLE IF NOT EXISTS public.audio_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT,
  transcription TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de mensagens de chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de check-ins emocionais
CREATE TABLE IF NOT EXISTS public.emotion_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion TEXT,
  intensity INTEGER,
  note TEXT,
  triggers TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de entradas de diário
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  title TEXT,
  mood_score INTEGER,
  analysis JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de tentativas de pagamento
CREATE TABLE IF NOT EXISTS public.payment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT,
  amount NUMERIC,
  preference_id TEXT,
  payment_id TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id TEXT,
  amount NUMERIC,
  currency TEXT,
  status TEXT,
  payment_method TEXT,
  subscription_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de uso de recursos
CREATE TABLE IF NOT EXISTS public.resource_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT,
  month DATE,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de slots (horários disponíveis)
CREATE TABLE IF NOT EXISTS public.slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID,
  start_utc TIMESTAMPTZ,
  end_utc TIMESTAMPTZ,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id TEXT,
  plan TEXT,
  status TEXT,
  period TEXT,
  next_billing_date TIMESTAMPTZ,
  payment_method TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de logs do sistema
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de conclusões de tarefas
CREATE TABLE IF NOT EXISTS public.task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  feedback TEXT,
  difficulty_rating INTEGER,
  effectiveness_rating INTEGER,
  notes TEXT
);

-- Tabela de terapeutas
CREATE TABLE IF NOT EXISTS public.therapists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT,
  crp TEXT,
  timezone TEXT,
  calendar_credentials JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de metas terapêuticas
CREATE TABLE IF NOT EXISTS public.therapy_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  target_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de planos terapêuticos
CREATE TABLE IF NOT EXISTS public.therapy_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  duration_weeks INTEGER,
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de tarefas terapêuticas
CREATE TABLE IF NOT EXISTS public.therapy_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.therapy_plans(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  task_type TEXT,
  week_number INTEGER,
  day_number INTEGER,
  estimated_minutes INTEGER,
  instructions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de técnicas terapêuticas
CREATE TABLE IF NOT EXISTS public.therapy_techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  category TEXT,
  instructions TEXT[],
  benefits TEXT[]
);

-- Tabela de badges de usuários
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT,
  badge_name TEXT,
  description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  icon TEXT
);

-- Tabela de relatórios de usuários
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de configurações de usuários
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  reminder_time TIME,
  reminder_days TEXT[],
  language TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de sequências de usuários
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_checkin_streak INTEGER DEFAULT 0,
  longest_checkin_streak INTEGER DEFAULT 0,
  current_task_streak INTEGER DEFAULT 0,
  longest_task_streak INTEGER DEFAULT 0,
  last_checkin_date DATE,
  last_task_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de técnicas de usuários
CREATE TABLE IF NOT EXISTS public.user_techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  technique_id UUID REFERENCES public.therapy_techniques(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT FALSE,
  times_used INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  effectiveness_rating INTEGER,
  notes TEXT
);

-- Tabela de relatórios semanais
CREATE TABLE IF NOT EXISTS public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE,
  week_end DATE,
  content JSONB,
  insights TEXT[],
  recommendations TEXT[],
  average_mood NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar função para atualizar o timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar gatilhos para tabelas que possuem a coluna updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_entries_updated_at
BEFORE UPDATE ON audio_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
BEFORE UPDATE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_attempts_updated_at
BEFORE UPDATE ON payment_attempts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_usage_updated_at
BEFORE UPDATE ON resource_usage
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slots_updated_at
BEFORE UPDATE ON slots
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapists_updated_at
BEFORE UPDATE ON therapists
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapy_goals_updated_at
BEFORE UPDATE ON therapy_goals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapy_plans_updated_at
BEFORE UPDATE ON therapy_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON user_streaks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 