-- Arquivo SQL para criação das tabelas no Supabase

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  plan TEXT DEFAULT 'free',
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  therapist_id UUID REFERENCES auth.users,
  therapist_share BOOLEAN DEFAULT FALSE,
  msg_count INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0
);

-- Tabela de entradas de diário
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  analysis JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[]
);

-- Tabela de entradas de áudio
CREATE TABLE IF NOT EXISTS audio_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  audio_url TEXT NOT NULL,
  title TEXT,
  duration INTEGER,
  transcription TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  analysis JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[]
);

-- Tabela de check-ins emocionais
CREATE TABLE IF NOT EXISTS emotion_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emotion TEXT NOT NULL,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  triggers TEXT[]
);

-- Tabela de relatórios semanais
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content JSONB NOT NULL,
  insights TEXT[],
  recommendations TEXT[],
  average_mood NUMERIC(3,1)
);

-- Tabela de metas terapêuticas
CREATE TABLE IF NOT EXISTS therapy_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  target_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de técnicas terapêuticas
CREATE TABLE IF NOT EXISTS therapy_techniques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  instructions TEXT[],
  benefits TEXT[]
);

-- Tabela de técnicas favoritas do usuário
CREATE TABLE IF NOT EXISTS user_techniques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  technique_id UUID REFERENCES therapy_techniques(id) ON DELETE CASCADE NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  times_used INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  effectiveness_rating INTEGER,
  notes TEXT,
  UNIQUE(user_id, technique_id)
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_id UUID,
  description TEXT
);

-- Tabela de uso de recursos
CREATE TABLE IF NOT EXISTS resource_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  resource_type TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  month DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_type, month)
);

-- Tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  reminder_time TIME,
  reminder_days INTEGER[],
  language TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Funções e gatilhos

-- Função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Gatilhos para atualizar o campo updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_journal_entries_updated_at
BEFORE UPDATE ON journal_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_audio_entries_updated_at
BEFORE UPDATE ON audio_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_therapy_goals_updated_at
BEFORE UPDATE ON therapy_goals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_resource_usage_updated_at
BEFORE UPDATE ON resource_usage
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Políticas de segurança RLS (Row Level Security)

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para perfis
CREATE POLICY "Usuários podem ver seus próprios perfis"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Políticas para entradas de diário
CREATE POLICY "Usuários podem ver suas próprias entradas de diário"
ON journal_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias entradas de diário"
ON journal_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias entradas de diário"
ON journal_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias entradas de diário"
ON journal_entries FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para entradas de áudio
CREATE POLICY "Usuários podem ver suas próprias entradas de áudio"
ON audio_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias entradas de áudio"
ON audio_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias entradas de áudio"
ON audio_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias entradas de áudio"
ON audio_entries FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para check-ins emocionais
CREATE POLICY "Usuários podem ver seus próprios check-ins emocionais"
ON emotion_checkins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios check-ins emocionais"
ON emotion_checkins FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios check-ins emocionais"
ON emotion_checkins FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios check-ins emocionais"
ON emotion_checkins FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para relatórios semanais
CREATE POLICY "Usuários podem ver seus próprios relatórios semanais"
ON weekly_reports FOR SELECT
USING (auth.uid() = user_id);

-- Políticas para metas terapêuticas
CREATE POLICY "Usuários podem ver suas próprias metas terapêuticas"
ON therapy_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias metas terapêuticas"
ON therapy_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias metas terapêuticas"
ON therapy_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias metas terapêuticas"
ON therapy_goals FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para técnicas terapêuticas
CREATE POLICY "Qualquer pessoa pode ver técnicas terapêuticas"
ON therapy_techniques FOR SELECT
USING (true);

-- Políticas para técnicas favoritas do usuário
CREATE POLICY "Usuários podem ver suas próprias técnicas favoritas"
ON user_techniques FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias técnicas favoritas"
ON user_techniques FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias técnicas favoritas"
ON user_techniques FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias técnicas favoritas"
ON user_techniques FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para pagamentos
CREATE POLICY "Usuários podem ver seus próprios pagamentos"
ON payments FOR SELECT
USING (auth.uid() = user_id);

-- Políticas para uso de recursos
CREATE POLICY "Usuários podem ver seu próprio uso de recursos"
ON resource_usage FOR SELECT
USING (auth.uid() = user_id);

-- Políticas para configurações do usuário
CREATE POLICY "Usuários podem ver suas próprias configurações"
ON user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configurações"
ON user_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Inserir dados iniciais para técnicas terapêuticas
INSERT INTO therapy_techniques (name, description, category, instructions, benefits)
VALUES
  ('Respiração Diafragmática', 'Técnica de respiração profunda que utiliza o diafragma', 'Mindfulness', 
   ARRAY['Sente-se confortavelmente', 'Coloque uma mão no peito e outra no abdômen', 'Inspire lentamente pelo nariz, expandindo o abdômen', 'Expire lentamente pela boca', 'Repita por 5-10 minutos'], 
   ARRAY['Redução da ansiedade', 'Diminuição da frequência cardíaca', 'Melhora da concentração']),
  
  ('Reestruturação Cognitiva', 'Identificação e modificação de pensamentos distorcidos', 'TCC', 
   ARRAY['Identifique o pensamento negativo', 'Questione a evidência desse pensamento', 'Considere interpretações alternativas', 'Desenvolva um pensamento mais equilibrado'], 
   ARRAY['Redução de pensamentos negativos', 'Melhora do humor', 'Aumento da resiliência emocional']),
  
  ('Escaneamento Corporal', 'Prática de atenção plena focada nas sensações do corpo', 'Mindfulness', 
   ARRAY['Deite-se confortavelmente', 'Feche os olhos e respire profundamente', 'Direcione sua atenção para diferentes partes do corpo', 'Observe as sensações sem julgamento', 'Avance gradualmente dos pés à cabeça'], 
   ARRAY['Redução do estresse', 'Maior consciência corporal', 'Melhora da qualidade do sono']),
  
  ('Registro de Pensamentos', 'Documentação de pensamentos automáticos e emoções associadas', 'TCC', 
   ARRAY['Identifique a situação', 'Anote seus pensamentos automáticos', 'Identifique as emoções associadas', 'Avalie a intensidade das emoções', 'Desenvolva respostas mais adaptativas'], 
   ARRAY['Maior autoconsciência', 'Identificação de padrões de pensamento', 'Base para reestruturação cognitiva']),
  
  ('Aceitação Radical', 'Prática de aceitar completamente a realidade presente', 'ACT', 
   ARRAY['Observe a situação sem julgamento', 'Reconheça sua resistência à realidade', 'Pratique afirmações de aceitação', 'Foque no que pode ser mudado'], 
   ARRAY['Redução do sofrimento emocional', 'Maior flexibilidade psicológica', 'Melhor adaptação a situações difíceis']),
  
  ('Defusão Cognitiva', 'Técnica para criar distância entre você e seus pensamentos', 'ACT', 
   ARRAY['Observe seus pensamentos como eventos mentais', 'Adicione "Estou tendo o pensamento de que..." antes do pensamento', 'Visualize os pensamentos como folhas em um riacho', 'Agradeça sua mente pelos pensamentos'], 
   ARRAY['Redução da ruminação', 'Menor identificação com pensamentos negativos', 'Aumento da liberdade psicológica']),
  
  ('Regulação Emocional TIPP', 'Conjunto de técnicas para regular emoções intensas', 'DBT', 
   ARRAY['T: Temperatura (use água fria no rosto)', 'I: Intensidade (exercício físico intenso)', 'P: Respiração Compassada (respiração lenta)', 'P: Relaxamento Muscular Progressivo'], 
   ARRAY['Rápida redução da intensidade emocional', 'Prevenção de comportamentos impulsivos', 'Retorno ao equilíbrio emocional']),
  
  ('Meditação Loving-Kindness', 'Prática de cultivar sentimentos de bondade e compaixão', 'Mindfulness', 
   ARRAY['Sente-se confortavelmente', 'Comece direcionando amor a si mesmo', 'Expanda para pessoas queridas', 'Inclua pessoas neutras e difíceis', 'Termine com todos os seres'], 
   ARRAY['Aumento da compaixão', 'Melhora dos relacionamentos', 'Redução da autocrítica']),
  
  ('Análise Funcional', 'Identificação de gatilhos, comportamentos e consequências', 'TCC', 
   ARRAY['Identifique o comportamento problemático', 'Anote os antecedentes (o que aconteceu antes)', 'Descreva as consequências (o que aconteceu depois)', 'Identifique a função do comportamento'], 
   ARRAY['Compreensão de padrões comportamentais', 'Base para mudança de hábitos', 'Identificação de gatilhos emocionais']),
  
  ('Valores e Ações Comprometidas', 'Identificação de valores pessoais e ações alinhadas', 'ACT', 
   ARRAY['Identifique seus valores em diferentes áreas da vida', 'Avalie a importância de cada valor', 'Defina ações específicas alinhadas com esses valores', 'Comprometa-se com pequenos passos diários'], 
   ARRAY['Vida mais significativa', 'Maior motivação intrínseca', 'Redução de conflitos internos']);
