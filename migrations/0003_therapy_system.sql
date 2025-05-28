-- Migração para sistema de planos terapêuticos e gamificação
-- Execute no Supabase SQL Editor

-- Tabela de planos terapêuticos
CREATE TABLE IF NOT EXISTS therapy_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_weeks INTEGER DEFAULT 4,
  status TEXT CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas do plano terapêutico
CREATE TABLE IF NOT EXISTS therapy_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES therapy_plans(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('daily', 'weekly', 'milestone')) DEFAULT 'daily',
  week_number INTEGER,
  day_number INTEGER,
  estimated_minutes INTEGER DEFAULT 5,
  instructions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de completude de tarefas
CREATE TABLE IF NOT EXISTS task_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES therapy_tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  feedback TEXT,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  notes TEXT,
  UNIQUE(task_id, user_id)
);

-- Tabela de badges/conquistas
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  icon TEXT,
  UNIQUE(user_id, badge_type, badge_name)
);

-- Tabela de streaks do usuário
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  current_checkin_streak INTEGER DEFAULT 0,
  longest_checkin_streak INTEGER DEFAULT 0,
  current_task_streak INTEGER DEFAULT 0,
  longest_task_streak INTEGER DEFAULT 0,
  last_checkin_date DATE,
  last_task_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de assinaturas (para Mercado Pago)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('active', 'canceled', 'expired')) DEFAULT 'active',
  amount NUMERIC(10,2) NOT NULL,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tentativas de pagamento
CREATE TABLE IF NOT EXISTS payment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  preference_id TEXT,
  payment_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs do sistema
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relatórios de usuário (para PDFs)
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Atualizar tabela profiles para incluir campos necessários
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT CHECK (plan IN ('free', 'pro', 'clinical')) DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS msg_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS session_used BOOLEAN DEFAULT false;

-- Triggers para updated_at
CREATE TRIGGER update_therapy_plans_updated_at
BEFORE UPDATE ON therapy_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payment_attempts_updated_at
BEFORE UPDATE ON payment_attempts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON user_streaks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Habilitar RLS
ALTER TABLE therapy_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own therapy plans" ON therapy_plans
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own therapy plans" ON therapy_plans
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their therapy tasks" ON therapy_tasks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM therapy_plans 
    WHERE therapy_plans.id = therapy_tasks.plan_id 
    AND therapy_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their task completions" ON task_completions
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own badges" ON user_badges
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own streaks" ON user_streaks
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON user_streaks
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscriptions" ON subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment attempts" ON payment_attempts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports" ON user_reports
FOR SELECT USING (auth.uid() = user_id);

-- Inserir dados iniciais de técnicas (se não existirem)
INSERT INTO therapy_techniques (name, description, category, instructions, benefits)
VALUES
  ('Respiração 4-7-8', 'Técnica de respiração para reduzir ansiedade', 'Mindfulness', 
   ARRAY['Inspire por 4 segundos', 'Segure por 7 segundos', 'Expire por 8 segundos', 'Repita 4 vezes'], 
   ARRAY['Reduz ansiedade', 'Melhora o sono', 'Diminui estresse']),
   
  ('Gratidão Diária', 'Prática de anotar 3 coisas pelas quais você é grato', 'Psicologia Positiva', 
   ARRAY['Anote 3 coisas específicas', 'Seja detalhado sobre por que é grato', 'Foque em pessoas e experiências'], 
   ARRAY['Melhora humor', 'Aumenta satisfação', 'Reduz negatividade']),
   
  ('Check-in Corporal', 'Escaneamento mental do corpo para detectar tensões', 'Mindfulness', 
   ARRAY['Feche os olhos', 'Respire profundamente', 'Escaneie o corpo dos pés à cabeça', 'Note tensões sem julgar'], 
   ARRAY['Aumenta consciência corporal', 'Reduz tensão muscular', 'Melhora relaxamento'])
ON CONFLICT (name) DO NOTHING; 