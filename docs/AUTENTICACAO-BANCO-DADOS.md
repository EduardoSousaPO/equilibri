# Documentação de Autenticação e Banco de Dados - Equilibri.IA

Este documento descreve o sistema de autenticação e a estrutura do banco de dados do Equilibri.IA, incluindo configurações essenciais, políticas de segurança, e possíveis problemas comuns.

## Sistema de Autenticação

### Configurações Essenciais do Supabase

1. **Tempo de Expiração do Token JWT**
   - Configuração recomendada: 86400 segundos (24 horas)
   - Localização: Authentication > Settings > JWT Settings
   - Observação: Um valor muito baixo causa desconexões frequentes

2. **URLs de Redirecionamento**
   - URLs obrigatórias:
     - `http://localhost:3000`
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/app/dashboard`
     - `http://localhost:3000/login`
     - `http://localhost:3000/api/auth-debug`
     - URL de produção (quando disponível)
   - Localização: Authentication > URL Configuration

3. **Políticas RLS (Row Level Security)**
   - Essencial: A tabela `profiles` deve ter políticas RLS para cada operação (SELECT, INSERT, UPDATE, DELETE)
   - A condição `auth.uid() = id` deve ser usada para garantir que usuários acessem apenas seus próprios dados
   - Todas as tabelas com dados de usuário devem ter RLS habilitado

### Implementação no Frontend

1. **Cliente Supabase no Browser**
   ```typescript
   // Importar a função do pacote correto
   import { createBrowserClient } from '@supabase/ssr';

   export function createClientSupabaseClient() {
     return createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     );
   }
   ```

2. **Cliente Supabase no Servidor**
   ```typescript
   import { createServerClient } from '@supabase/ssr';
   import { cookies } from 'next/headers';

   export async function createServerSupabaseClient() {
     const cookieStore = cookies();
     return createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           get: (name) => {
             return cookieStore.get(name)?.value;
           },
           set: (name, value, options) => {
             try {
               cookieStore.set({
                 name, 
                 value,
                 ...options,
                 sameSite: 'lax',
                 secure: process.env.NODE_ENV === 'production',
                 maxAge: 60 * 60 * 24 * 7, // 7 dias
                 path: '/'
               });
             } catch (error) {
               console.log(`Erro ao definir cookie ${name}, isso pode ser normal em SSR:`, error);
             }
           },
           remove: (name, options) => {
             cookieStore.set({
               name, 
               value: '',
               ...options,
               path: '/',
               maxAge: 0
             });
           },
         },
         auth: {
           persistSession: true,
           autoRefreshToken: true,
           detectSessionInUrl: true,
         },
       }
     );
   }
   ```

3. **Middleware de Autenticação**
   - Localizado em `src/middleware.ts`
   - Redireciona usuários não autenticados para a página de login
   - Redireciona usuários autenticados para o dashboard quando tentam acessar a página de login

## Estrutura do Banco de Dados

### Tabelas Essenciais

1. **profiles**
   - Crítica para autenticação
   - Associada ao usuário via `id` (que é igual ao `auth.users.id`)
   - Contém informações básicas do usuário

2. **chat_messages**
   - Armazena mensagens trocadas entre usuários e a IA
   - Referencia o usuário via `user_id`

3. **resource_usage**
   - Controla o uso de recursos por usuário
   - Essencial para limites do plano gratuito

### Funções RPC Importantes

1. **increment_message_count**
   ```sql
   -- Função para incrementar a contagem de mensagens
   CREATE OR REPLACE FUNCTION increment_message_count(user_id UUID)
   RETURNS void
   LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public
   AS $$
   BEGIN
     UPDATE profiles
     SET msg_count = COALESCE(msg_count, 0) + 1
     WHERE id = user_id;
   END;
   $$;
   ```

## Problemas Comuns e Soluções

### 1. Erro "Nenhuma sessão encontrada"

**Sintomas:**
- Usuário é redirecionado de volta para a página de login após tentativa de login
- Console mostra erro "Nenhuma sessão encontrada"

**Possíveis causas e soluções:**
- **Tempo de expiração do token muito curto**: Aumente para pelo menos 24 horas
- **Políticas RLS incorretas**: Verifique se a tabela `profiles` tem as políticas corretas
- **Cliente Supabase mal configurado**: Verifique importações e configurações
- **Cookies não persistindo**: Verifique as configurações de cookies no cliente

### 2. Erro ao incrementar contagem de mensagens

**Sintomas:**
- Erro ao enviar mensagens no chat
- Console mostra erro relacionado à função RPC

**Possíveis causas e soluções:**
- **Nome do parâmetro incorreto**: Verifique se a função usa `user_id` como parâmetro
- **Função não existe**: Verifique se a função foi criada no banco de dados
- **Políticas RLS bloqueando acesso**: Verifique se o usuário tem permissão para atualizar seu perfil

### 3. Problemas com políticas RLS

**Sintomas:**
- Usuário autenticado não consegue acessar seus próprios dados
- Erros 404 ou "Registro não encontrado" em APIs

**Possíveis causas e soluções:**
- **RLS habilitado sem políticas**: Crie políticas para cada operação
- **Condição incorreta nas políticas**: Use `auth.uid() = id` ou `auth.uid() = user_id`
- **Tabela sem coluna de referência ao usuário**: Adicione coluna `user_id` referenciando `auth.users.id`

## Procedimento de Recuperação

Se os problemas persistirem mesmo após as verificações acima, pode ser necessário recriar o banco de dados:

1. Execute o script SQL para criar tabelas (disponível em `docs/sql/create_tables.sql`)
2. Execute o script SQL para criar políticas RLS (disponível em `docs/sql/create_policies.sql`)
3. Execute o script SQL para criar funções RPC (disponível em `docs/sql/create_functions.sql`)
4. Configure as opções de autenticação no Supabase conforme descrito acima

## Testes de Verificação

Para verificar se a autenticação está funcionando corretamente:

1. Acesse o endpoint `/api/auth-debug` após login
2. Verifique se retorna `"authenticated": true`
3. Verifique se o acesso a tabelas principais (profiles, chat_messages, etc.) está funcionando 