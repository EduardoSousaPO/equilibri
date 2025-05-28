-- Funções e gatilhos para o Equilibri.IA
-- Este script cria as funções RPC e gatilhos necessários para o funcionamento do aplicativo

-- Função para incrementar a contagem de mensagens (CRÍTICA para o funcionamento do chat)
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

-- Função para criar perfil automaticamente após registro de usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, created_at, updated_at)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', NOW(), NOW());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gatilho para criar perfil após registro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para criar registros de configurações de usuário após criação de perfil
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar configurações padrão para o usuário
  INSERT INTO public.user_settings (user_id, theme, notifications_enabled, email_notifications, language, created_at, updated_at)
  VALUES (new.id, 'light', TRUE, TRUE, 'pt-BR', NOW(), NOW());
  
  -- Criar registro de sequências para o usuário
  INSERT INTO public.user_streaks (user_id, current_checkin_streak, longest_checkin_streak, current_task_streak, longest_task_streak, updated_at)
  VALUES (new.id, 0, 0, 0, 0, NOW());
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gatilho para criar configurações e sequências após criação de perfil
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile(); 