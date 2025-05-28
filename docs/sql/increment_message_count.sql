-- Função para incrementar a contagem de mensagens de um usuário
CREATE OR REPLACE FUNCTION increment_message_count(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualiza a contagem de mensagens para o usuário especificado
  UPDATE profiles
  SET msg_count = COALESCE(msg_count, 0) + 1
  WHERE id = user_id;
END;
$$; 