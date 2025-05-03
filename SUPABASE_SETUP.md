# Configuração do Supabase

Este projeto utiliza Supabase para autenticação e armazenamento de dados. Para configurar corretamente o projeto com o Supabase, siga estas instruções:

## 1. Criar uma conta e projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta ou faça login
2. Crie um novo projeto na plataforma Supabase
3. Anote a URL do projeto e a chave anônima (anon key)

## 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

Substitua os valores acima pelas credenciais do seu projeto Supabase.

## 3. Ativar a autenticação no middleware

Uma vez que as variáveis de ambiente estiverem configuradas, edite o arquivo `src/middleware.ts` e descomente o código relacionado ao Supabase:

1. Remova o comentário na linha de importação do `createServerClient`
2. Descomente o bloco de código que usa o Supabase para autenticação

## 4. Reiniciar o servidor de desenvolvimento

Após configurar todas as variáveis e descomentar o código, reinicie o servidor de desenvolvimento:

```
npm run dev
```

Agora o projeto deve estar funcionando corretamente com a autenticação do Supabase. 