import { NextResponse } from 'next/server';
import { createAudioUploadsBucket } from '@/lib/supabase/create-bucket';
import { createServerSupabaseClient } from '@/lib/supabase/server-queries';

export async function POST(request: Request) {
  try {
    // Verificar se o usuário está autenticado e é admin
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se o usuário tem perfil de admin (opcional, você pode implementar isso depois)
    // Por enquanto, qualquer usuário autenticado pode criar o bucket
    
    const result = await createAudioUploadsBucket();
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Falha ao criar bucket', details: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Bucket audiouploads criado com sucesso',
      policyError: result.policyError || null
    });
    
  } catch (error: any) {
    console.error('Erro na API de criação de bucket:', error);
    return NextResponse.json(
      { error: 'Erro ao criar bucket', message: error.message },
      { status: 500 }
    );
  }
} 