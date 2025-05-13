-- Tabela de psicólogos/terapeutas
CREATE TABLE IF NOT EXISTS public.therapists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users,  -- login da psicóloga
  name text NOT NULL,
  crp text, -- Registro profissional
  timezone text,
  calendar_credentials jsonb, -- Para armazenar tokens do Google Calendar
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Horários disponíveis
CREATE TABLE IF NOT EXISTS public.slots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id uuid REFERENCES public.therapists(id),
  start_utc timestamptz NOT NULL,
  end_utc timestamptz NOT NULL,
  status text CHECK (status IN ('free','booked')) DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agendamentos
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id uuid REFERENCES public.slots(id) UNIQUE,
  user_id uuid REFERENCES auth.users,
  meet_link text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Modificações na tabela de perfis para suportar planos e limites
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text CHECK (plan IN ('free', 'pro', 'clinical')) DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS msg_count integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS session_used boolean DEFAULT false;

-- Policies para controlar o acesso às tabelas
-- Somente terapeutas podem gerenciar seus próprios slots
CREATE POLICY IF NOT EXISTS "Terapeutas gerenciam seus slots" 
ON public.slots FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.therapists 
    WHERE therapists.id = slots.therapist_id AND therapists.user_id = auth.uid()
  )
);

-- Usuários podem ver slots livres
CREATE POLICY IF NOT EXISTS "Usuários podem ver slots livres" 
ON public.slots FOR SELECT 
TO authenticated 
USING (status = 'free');

-- Usuários podem ver seus próprios agendamentos
CREATE POLICY IF NOT EXISTS "Usuários veem seus agendamentos" 
ON public.appointments FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Terapeutas podem ver agendamentos relacionados aos seus slots
CREATE POLICY IF NOT EXISTS "Terapeutas veem agendamentos de seus slots" 
ON public.appointments FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.slots 
    INNER JOIN public.therapists ON slots.therapist_id = therapists.id
    WHERE slots.id = appointments.slot_id AND therapists.user_id = auth.uid()
  )
);

-- Usuários podem criar agendamentos
CREATE POLICY IF NOT EXISTS "Usuários podem criar agendamentos" 
ON public.appointments FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Função para resetar contadores mensais de usuários
CREATE OR REPLACE FUNCTION reset_monthly_counters()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles SET msg_count = 0, session_used = false;
END;
$$ LANGUAGE plpgsql;

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_slots_therapist_id ON public.slots(therapist_id);
CREATE INDEX IF NOT EXISTS idx_slots_status ON public.slots(status);
CREATE INDEX IF NOT EXISTS idx_slots_start_utc ON public.slots(start_utc);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_slot_id ON public.appointments(slot_id); 