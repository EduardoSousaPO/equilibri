-- Tabela para mensagens de chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL,  -- 'user' ou 'assistant'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

-- Habilitar RLS na tabela de mensagens
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para mensagens de chat
CREATE POLICY "Usuários podem ver suas próprias mensagens de chat"
ON chat_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias mensagens de chat"
ON chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias mensagens de chat"
ON chat_messages FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias mensagens de chat"
ON chat_messages FOR DELETE
USING (auth.uid() = user_id); 