-- Storage setup for audio files
-- Criar bucket para uploads de áudio
INSERT INTO storage.buckets (id, name, public)
VALUES ('audiouploads', 'audiouploads', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir uploads de áudio por usuários autenticados
CREATE POLICY "Usuários podem fazer upload de áudios" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'audiouploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir visualização de áudios pelos próprios usuários
CREATE POLICY "Usuários podem ver seus próprios áudios" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'audiouploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir exclusão de áudios pelos próprios usuários
CREATE POLICY "Usuários podem excluir seus próprios áudios" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'audiouploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
); 