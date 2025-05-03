import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Webhook } from 'svix';
import type { WebhookEvent } from '@/types/clerk';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  // Verificar webhook do Clerk
  const headersList = await headers();
  const svix_id = headersList.get("svix-id");
  const svix_timestamp = headersList.get("svix-timestamp");
  const svix_signature = headersList.get("svix-signature");
  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Cabeçalhos Webhook ausentes');
    return new Response('Erro: cabeçalhos inválidos', {
      status: 400
    });
  }

  // Obter o corpo da solicitação
  const payload = await request.json();
  const body = JSON.stringify(payload);
  
  // Verificar assinatura do webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET não configurado');
    return new Response('Erro: Webhook secret não configurado', {
      status: 500
    });
  }
  
  let evt: WebhookEvent;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Erro na verificação da assinatura do webhook:', err);
    return new Response('Erro: assinatura inválida', {
      status: 400
    });
  }
  
  // Processar o evento
  const eventType = evt.type;
  console.log(`Evento webhook recebido: ${eventType}`);
  
  try {
    const supabase = await createRouteHandlerClient({ cookies });
    
    switch (eventType) {
      case 'user.created': {
        // Criar perfil no Supabase quando um novo usuário for criado no Clerk
        const { id, email_addresses, first_name, last_name, image_url } = evt.data as any;
        const email = email_addresses && email_addresses[0]?.email_address;
        
        console.log(`Criando perfil para usuário: ${id}, email: ${email}`);
        
        // Verificar se o perfil já existe
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (existingProfile) {
          console.log(`Perfil já existe para: ${id}`);
          return NextResponse.json({ success: true, message: "Perfil já existe" });
        }
        
        // Criar novo perfil
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            id,
            email,
            name: `${first_name || ''} ${last_name || ''}`.trim(),
            avatar_url: image_url,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) {
          console.error('Erro ao criar perfil:', error);
          throw error;
        }
        
        console.log('Perfil criado com sucesso:', data);
        break;
      }
      
      case 'user.updated': {
        // Atualizar perfil quando dados do usuário forem alterados
        const { id, email_addresses, first_name, last_name, image_url } = evt.data as any;
        const email = email_addresses && email_addresses[0]?.email_address;
        
        console.log(`Atualizando perfil para usuário: ${id}`);
        
        const { error } = await supabase
          .from('profiles')
          .update({
            email,
            name: `${first_name || ''} ${last_name || ''}`.trim(),
            avatar_url: image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        
        if (error) {
          console.error('Erro ao atualizar perfil:', error);
          throw error;
        }
        
        console.log('Perfil atualizado com sucesso');
        break;
      }
      
      case 'user.deleted': {
        // Remover perfil quando usuário for excluído
        const { id } = evt.data as any;
        
        console.log(`Removendo perfil para usuário: ${id}`);
        
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Erro ao remover perfil:', error);
          throw error;
        }
        
        console.log('Perfil removido com sucesso');
        break;
      }
      
      case 'session.created': {
        // Registrar sessão criada
        const { id, user_id } = evt.data as any;
        console.log(`Nova sessão criada: ${id} para usuário: ${user_id}`);
        break;
      }
      
      case 'session.ended': {
        // Registrar fim de sessão
        const { id, user_id } = evt.data as any;
        console.log(`Sessão finalizada: ${id} para usuário: ${user_id}`);
        break;
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return new Response(`Erro ao processar webhook: ${error}`, {
      status: 500
    });
  }
} 