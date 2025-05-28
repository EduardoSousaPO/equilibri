ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS session_used BOOLEAN DEFAULT false;
