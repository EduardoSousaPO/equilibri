-- Adicionar chave estrangeira na tabela slots
ALTER TABLE public.slots
ADD COLUMN IF NOT EXISTS therapist_id UUID REFERENCES public.therapists(id);

-- Atualizar política RLS para slots
ALTER POLICY "Terapeutas podem ver seus slots" ON public.slots
USING (
    auth.uid() IN (
        SELECT user_id FROM public.therapists
        WHERE id = therapist_id
    )
); 