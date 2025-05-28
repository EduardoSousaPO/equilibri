import { createServerSupabaseClient } from './server-queries';

async function createAudioUploadsBucket() {
  try {
    console.log('Iniciando criação do bucket audiouploads...');
    
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase.storage.createBucket('audiouploads', {
      public: false, // Bucket privado para maior segurança
      fileSizeLimit: 26214400, // 25MB em bytes
      allowedMimeTypes: [
        'audio/webm',
        'audio/mp3',
        'audio/mpeg',
        'audio/mp4',
        'audio/wav',
        'audio/ogg'
      ]
    });
    
    if (error) {
      // Se o erro for que o bucket já existe, considere isso um sucesso
      if (error.message?.includes('already exists')) {
        console.log('Bucket audiouploads já existe, continuando com as políticas...');
      } else {
        console.error('Erro ao criar bucket:', error);
        return { success: false, error };
      }
    } else {
      console.log('Bucket audiouploads criado com sucesso:', data);
    }
    
    // Adicionar políticas RLS para o bucket usando SQL direto
    // 1. Política para leitura - usuários podem ler seus próprios arquivos
    const { error: readPolicyError } = await supabase.rpc('run_sql', {
      sql: `
        CREATE POLICY "Usuários podem ler seus próprios arquivos de áudio" 
        ON storage.objects 
        FOR SELECT 
        USING (
          (bucket_id = 'audiouploads' AND auth.uid()::text = (storage.foldername(name))[1])
        );
      `
    }).catch(e => ({ error: e }));
    
    // 2. Política para inserção - usuários podem fazer upload para sua pasta
    const { error: insertPolicyError } = await supabase.rpc('run_sql', {
      sql: `
        CREATE POLICY "Usuários podem fazer upload para sua pasta de áudio" 
        ON storage.objects 
        FOR INSERT 
        WITH CHECK (
          (bucket_id = 'audiouploads' AND auth.uid()::text = (storage.foldername(name))[1])
        );
      `
    }).catch(e => ({ error: e }));
    
    // 3. Política para atualização - usuários podem atualizar seus próprios arquivos
    const { error: updatePolicyError } = await supabase.rpc('run_sql', {
      sql: `
        CREATE POLICY "Usuários podem atualizar seus próprios arquivos de áudio" 
        ON storage.objects 
        FOR UPDATE 
        USING (
          (bucket_id = 'audiouploads' AND auth.uid()::text = (storage.foldername(name))[1])
        );
      `
    }).catch(e => ({ error: e }));
    
    // 4. Política para exclusão - usuários podem excluir seus próprios arquivos
    const { error: deletePolicyError } = await supabase.rpc('run_sql', {
      sql: `
        CREATE POLICY "Usuários podem excluir seus próprios arquivos de áudio" 
        ON storage.objects 
        FOR DELETE 
        USING (
          (bucket_id = 'audiouploads' AND auth.uid()::text = (storage.foldername(name))[1])
        );
      `
    }).catch(e => ({ error: e }));
    
    // Se houver erros nas políticas, registre-os, mas ainda considere sucesso parcial
    const policyErrors = {
      read: readPolicyError,
      insert: insertPolicyError,
      update: updatePolicyError,
      delete: deletePolicyError
    };
    
    const hasPolicyErrors = Object.values(policyErrors).some(e => e);
    
    if (hasPolicyErrors) {
      console.warn('Alguns erros ocorreram ao criar políticas RLS:', policyErrors);
      return { 
        success: true, 
        bucketCreated: !error || error.message?.includes('already exists'),
        policyErrors 
      };
    }
    
    return { 
      success: true, 
      bucketCreated: !error || error.message?.includes('already exists') 
    };
  } catch (error) {
    console.error('Exceção ao criar bucket:', error);
    return { success: false, error };
  }
}

export { createAudioUploadsBucket }; 