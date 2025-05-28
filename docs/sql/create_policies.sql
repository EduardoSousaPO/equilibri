-- Políticas RLS (Row Level Security) para o Equilibri.IA
-- Este script configura as políticas de segurança para todas as tabelas

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

-- CRÍTICO: Políticas para a tabela profiles (essencial para autenticação)
CREATE POLICY "Usuários podem ver seus próprios perfis" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem criar seus próprios perfis" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem excluir seus próprios perfis" 
ON public.profiles FOR DELETE 
USING (auth.uid() = id);

-- Políticas para a tabela appointments
CREATE POLICY "Usuários podem ver seus próprios agendamentos" 
ON public.appointments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar agendamentos" 
ON public.appointments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios agendamentos" 
ON public.appointments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios agendamentos" 
ON public.appointments FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para a tabela audio_entries
CREATE POLICY "Usuários podem ver suas próprias entradas de áudio" 
ON public.audio_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias entradas de áudio" 
ON public.audio_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias entradas de áudio" 
ON public.audio_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias entradas de áudio" 
ON public.audio_entries FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para a tabela audio_transcriptions
CREATE POLICY "Usuários podem ver suas próprias transcrições" 
ON public.audio_transcriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias transcrições" 
ON public.audio_transcriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- CRÍTICO: Políticas para a tabela chat_messages
CREATE POLICY "Usuários podem ver suas próprias mensagens" 
ON public.chat_messages FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias mensagens" 
ON public.chat_messages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Políticas para a tabela emotion_checkins
CREATE POLICY "Usuários podem ver seus próprios check-ins emocionais" 
ON public.emotion_checkins FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios check-ins emocionais" 
ON public.emotion_checkins FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios check-ins emocionais" 
ON public.emotion_checkins FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios check-ins emocionais" 
ON public.emotion_checkins FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para a tabela journal_entries
CREATE POLICY "Usuários podem ver suas próprias entradas de diário" 
ON public.journal_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias entradas de diário" 
ON public.journal_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias entradas de diário" 
ON public.journal_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias entradas de diário" 
ON public.journal_entries FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para a tabela payment_attempts
CREATE POLICY "Usuários podem ver suas próprias tentativas de pagamento" 
ON public.payment_attempts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias tentativas de pagamento" 
ON public.payment_attempts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Políticas para a tabela payments
CREATE POLICY "Usuários podem ver seus próprios pagamentos" 
ON public.payments FOR SELECT 
USING (auth.uid() = user_id);

-- CRÍTICO: Políticas para a tabela resource_usage
CREATE POLICY "Usuários podem ver seu próprio uso de recursos" 
ON public.resource_usage FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar registros de uso de recursos" 
ON public.resource_usage FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio uso de recursos" 
ON public.resource_usage FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas para a tabela slots
CREATE POLICY "Usuários podem ver slots disponíveis" 
ON public.slots FOR SELECT 
USING (TRUE);

-- Políticas para a tabela subscriptions
CREATE POLICY "Usuários podem ver suas próprias assinaturas" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Políticas para a tabela therapy_goals
CREATE POLICY "Usuários podem ver suas próprias metas terapêuticas" 
ON public.therapy_goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias metas terapêuticas" 
ON public.therapy_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias metas terapêuticas" 
ON public.therapy_goals FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias metas terapêuticas" 
ON public.therapy_goals FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para a tabela therapy_plans
CREATE POLICY "Usuários podem ver seus próprios planos terapêuticos" 
ON public.therapy_plans FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios planos terapêuticos" 
ON public.therapy_plans FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios planos terapêuticos" 
ON public.therapy_plans FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas para a tabela user_badges
CREATE POLICY "Usuários podem ver suas próprias badges" 
ON public.user_badges FOR SELECT 
USING (auth.uid() = user_id);

-- Políticas para a tabela user_reports
CREATE POLICY "Usuários podem ver seus próprios relatórios" 
ON public.user_reports FOR SELECT 
USING (auth.uid() = user_id);

-- Políticas para a tabela user_settings
CREATE POLICY "Usuários podem ver suas próprias configurações" 
ON public.user_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias configurações" 
ON public.user_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configurações" 
ON public.user_settings FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas para a tabela user_streaks
CREATE POLICY "Usuários podem ver suas próprias sequências" 
ON public.user_streaks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias sequências" 
ON public.user_streaks FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas para a tabela user_techniques
CREATE POLICY "Usuários podem ver suas próprias técnicas" 
ON public.user_techniques FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias técnicas" 
ON public.user_techniques FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias técnicas" 
ON public.user_techniques FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias técnicas" 
ON public.user_techniques FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para a tabela weekly_reports
CREATE POLICY "Usuários podem ver seus próprios relatórios semanais" 
ON public.weekly_reports FOR SELECT 
USING (auth.uid() = user_id);

-- Política para que qualquer pessoa possa ver técnicas terapêuticas
CREATE POLICY "Qualquer pessoa pode ver técnicas terapêuticas" 
ON public.therapy_techniques FOR SELECT 
USING (TRUE); 