-- Arquivo SQL para atualizar as colunas da tabela profiles

-- Renomear subscription_tier para plan
ALTER TABLE profiles RENAME COLUMN subscription_tier TO plan;

-- Remover subscription_status que não é mais necessário
ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_status;

-- Adicionar msg_count e streak_days se ainda não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'msg_count') THEN
        ALTER TABLE profiles ADD COLUMN msg_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'streak_days') THEN
        ALTER TABLE profiles ADD COLUMN streak_days INTEGER DEFAULT 0;
    END IF;
END $$; 