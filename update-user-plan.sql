-- Atualizar o usuário para o plano Premium Clínico
UPDATE profiles 
SET 
  plan = 'clinical',
  session_used = false
WHERE 
  email = 'eduspires123@gmail.com'; 