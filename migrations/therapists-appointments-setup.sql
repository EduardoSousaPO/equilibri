-- Criar tabela para psicólogas
CREATE TABLE IF NOT EXISTS therapists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users,  -- login da psicóloga
  name text,
  crp text,
  timezone text,
  calendar_credentials jsonb
);

-- Criar tabela para horários ofertados
CREATE TABLE IF NOT EXISTS slots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id uuid REFERENCES therapists(id),
  start_utc timestamptz,
  end_utc timestamptz,
  status text CHECK (status IN ('free','booked')) DEFAULT 'free'
);

-- Criar tabela para agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id uuid REFERENCES slots(id) UNIQUE,
  user_id uuid REFERENCES auth.users,
  meet_link text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Adicionar campo de plano à tabela de profiles (assumindo que já existe)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan text CHECK (plan IN ('free', 'pro', 'clinical')) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS msg_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS session_used boolean DEFAULT false;

-- Policies para therapists
CREATE POLICY "Therapists podem visualizar suas próprias informações"
  ON therapists
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Therapists podem atualizar suas próprias informações"
  ON therapists
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies para slots
CREATE POLICY "Usuários podem visualizar apenas slots livres"
  ON slots
  FOR SELECT
  USING (status = 'free');

CREATE POLICY "Therapists podem visualizar todos seus slots"
  ON slots
  FOR SELECT
  USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

CREATE POLICY "Therapists podem criar slots"
  ON slots
  FOR INSERT
  WITH CHECK (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

CREATE POLICY "Therapists podem atualizar seus slots"
  ON slots
  FOR UPDATE
  USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

-- Policies para appointments
CREATE POLICY "Usuários podem visualizar seus próprios agendamentos"
  ON appointments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Therapists podem visualizar agendamentos com seus slots"
  ON appointments
  FOR SELECT
  USING (slot_id IN (SELECT id FROM slots WHERE therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid())));

CREATE POLICY "Usuários podem criar agendamentos"
  ON appointments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios agendamentos"
  ON appointments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Função para resetar contadores mensalmente
CREATE OR REPLACE FUNCTION reset_monthly_limits()
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET msg_count = 0, 
      session_used = CASE WHEN plan != 'clinical' THEN session_used ELSE false END;
END;
$$ LANGUAGE plpgsql; 