-- Configuração de políticas RLS para o DiarioTer
-- Este script define políticas de Row Level Security para todas as tabelas principais
-- garantindo que usuários só possam acessar seus próprios dados

-- Passo 1: Criar função para obter o ID do usuário atual da sessão
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text;
$$ LANGUAGE SQL STABLE;

-- Passo 2: Habilitar RLS em todas as tabelas principais 
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

-- Passo 3: Definir políticas para a tabela profiles
-- Política para SELECT (leitura)
CREATE POLICY "Usuários podem ler apenas o próprio perfil" 
ON profiles FOR SELECT 
USING (id = requesting_user_id());

-- Política para UPDATE (atualização)
CREATE POLICY "Usuários podem atualizar apenas o próprio perfil" 
ON profiles FOR UPDATE 
USING (id = requesting_user_id());

-- Passo 4: Definir políticas para journal_entries (diário)
-- Política para SELECT (leitura)
CREATE POLICY "Usuários podem ler apenas seus diários" 
ON journal_entries FOR SELECT 
USING (user_id = requesting_user_id());

-- Política para INSERT (inserção)
CREATE POLICY "Usuários podem criar entradas vinculadas a si mesmos" 
ON journal_entries FOR INSERT 
WITH CHECK (user_id = requesting_user_id());

-- Política para UPDATE (atualização)
CREATE POLICY "Usuários podem atualizar apenas seus diários" 
ON journal_entries FOR UPDATE 
USING (user_id = requesting_user_id());

-- Política para DELETE (exclusão)
CREATE POLICY "Usuários podem excluir apenas seus diários" 
ON journal_entries FOR DELETE 
USING (user_id = requesting_user_id());

-- Passo 5: Definir políticas para audio_entries (entradas de áudio)
-- Política para SELECT (leitura)
CREATE POLICY "Usuários podem ler apenas seus áudios" 
ON audio_entries FOR SELECT 
USING (user_id = requesting_user_id());

-- Política para INSERT (inserção)
CREATE POLICY "Usuários podem criar áudios vinculados a si mesmos" 
ON audio_entries FOR INSERT 
WITH CHECK (user_id = requesting_user_id());

-- Política para UPDATE (atualização)
CREATE POLICY "Usuários podem atualizar apenas seus áudios" 
ON audio_entries FOR UPDATE 
USING (user_id = requesting_user_id());

-- Política para DELETE (exclusão)
CREATE POLICY "Usuários podem excluir apenas seus áudios" 
ON audio_entries FOR DELETE 
USING (user_id = requesting_user_id());

-- Passo 6: Definir políticas para emotion_checkins (check-ins emocionais)
-- Política para SELECT (leitura)
CREATE POLICY "Usuários podem ler apenas seus check-ins emocionais" 
ON emotion_checkins FOR SELECT 
USING (user_id = requesting_user_id());

-- Política para INSERT (inserção)
CREATE POLICY "Usuários podem criar check-ins vinculados a si mesmos" 
ON emotion_checkins FOR INSERT 
WITH CHECK (user_id = requesting_user_id());

-- Política para DELETE (exclusão)
CREATE POLICY "Usuários podem excluir apenas seus check-ins" 
ON emotion_checkins FOR DELETE 
USING (user_id = requesting_user_id());

-- Passo 7: Definir políticas para weekly_reports (relatórios semanais)
-- Política para SELECT (leitura)
CREATE POLICY "Usuários podem ler apenas seus relatórios" 
ON weekly_reports FOR SELECT 
USING (user_id = requesting_user_id());

-- Política para INSERT (inserção)
CREATE POLICY "Usuários podem criar relatórios vinculados a si mesmos" 
ON weekly_reports FOR INSERT 
WITH CHECK (user_id = requesting_user_id());

-- Política para UPDATE (atualização)
CREATE POLICY "Usuários podem atualizar apenas seus relatórios" 
ON weekly_reports FOR UPDATE 
USING (user_id = requesting_user_id());

-- Política para DELETE (exclusão)
CREATE POLICY "Usuários podem excluir apenas seus relatórios" 
ON weekly_reports FOR DELETE 
USING (user_id = requesting_user_id());

-- Passo 8: Definir políticas para therapy_goals (metas terapêuticas)
-- Política para SELECT (leitura)
CREATE POLICY "Usuários podem ler apenas suas metas" 
ON therapy_goals FOR SELECT 
USING (user_id = requesting_user_id());

-- Política para INSERT (inserção)
CREATE POLICY "Usuários podem criar metas vinculadas a si mesmos" 
ON therapy_goals FOR INSERT 
WITH CHECK (user_id = requesting_user_id());

-- Política para UPDATE (atualização)
CREATE POLICY "Usuários podem atualizar apenas suas metas" 
ON therapy_goals FOR UPDATE 
USING (user_id = requesting_user_id());

-- Política para DELETE (exclusão)
CREATE POLICY "Usuários podem excluir apenas suas metas" 
ON therapy_goals FOR DELETE 
USING (user_id = requesting_user_id());

-- Passo 9: Definir políticas para user_techniques (técnicas do usuário)
-- Política para SELECT (leitura)
CREATE POLICY "Usuários podem ler apenas suas técnicas" 
ON user_techniques FOR SELECT 
USING (user_id = requesting_user_id());

-- Política para INSERT (inserção)
CREATE POLICY "Usuários podem adicionar técnicas vinculadas a si mesmos" 
ON user_techniques FOR INSERT 
WITH CHECK (user_id = requesting_user_id());

-- Política para UPDATE (atualização)
CREATE POLICY "Usuários podem atualizar apenas suas técnicas" 
ON user_techniques FOR UPDATE 
USING (user_id = requesting_user_id());

-- Política para DELETE (exclusão)
CREATE POLICY "Usuários podem excluir apenas suas técnicas" 
ON user_techniques FOR DELETE 
USING (user_id = requesting_user_id());

-- Passo 10: Definir políticas para payments (pagamentos)
-- Política para SELECT (leitura)
CREATE POLICY "Usuários podem ler apenas seus pagamentos" 
ON payments FOR SELECT 
USING (user_id = requesting_user_id());

-- Política para INSERT (inserção)
CREATE POLICY "Usuários podem inserir pagamentos vinculados a si mesmos" 
ON payments FOR INSERT 
WITH CHECK (user_id = requesting_user_id());

-- Passo 11: Definir políticas para resource_usage (uso de recursos)
-- Política para SELECT (leitura)
CREATE POLICY "Usuários podem ler apenas seu uso de recursos" 
ON resource_usage FOR SELECT 
USING (user_id = requesting_user_id());

-- Política para INSERT (inserção)
CREATE POLICY "Usuários podem registrar uso vinculado a si mesmos" 
ON resource_usage FOR INSERT 
WITH CHECK (user_id = requesting_user_id());

-- Passo 12: Definir políticas para user_settings (configurações)
-- Política para SELECT (leitura)
CREATE POLICY "Usuários podem ler apenas suas configurações" 
ON user_settings FOR SELECT 
USING (user_id = requesting_user_id());

-- Política para INSERT (inserção)
CREATE POLICY "Usuários podem inserir configurações vinculadas a si mesmos" 
ON user_settings FOR INSERT 
WITH CHECK (user_id = requesting_user_id());

-- Política para UPDATE (atualização)
CREATE POLICY "Usuários podem atualizar apenas suas configurações" 
ON user_settings FOR UPDATE 
USING (user_id = requesting_user_id());

-- Passo 13: Política especial para permitir leitura de terapeutas compartilhados
-- Esta política permite que terapeutas acessem diários compartilhados pelos usuários
CREATE POLICY "Terapeutas podem ler diários compartilhados"
ON journal_entries FOR SELECT
USING (
  (SELECT therapist_share FROM profiles WHERE id = journal_entries.user_id) = true
  AND
  requesting_user_id() IN (SELECT therapist_id FROM therapist_clients WHERE client_id = journal_entries.user_id)
);

-- Nota: Este script deve ser executado no SQL Editor do Console do Supabase
-- É necessário que as tabelas já existam antes de aplicar as políticas
-- Em caso de erro ao executar alguma política, verifique se a tabela existe e se a política já foi criada 