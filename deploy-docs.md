# DiarioTer - Documentação de Deploy

Este documento contém instruções para o deploy do DiarioTer na Vercel.

## Pré-requisitos

1. Conta na Vercel
2. Projeto configurado no Supabase
3. Conta na OpenAI com API key
4. Conta no Mercado Pago com credenciais de desenvolvedor

## Configuração do Supabase

1. Criar um novo projeto no Supabase
2. Executar o script SQL de migração (`migrations/0001_initial.sql`)
3. Configurar autenticação com email/senha
4. Configurar políticas de segurança (RLS)
5. Obter URL e chave anônima do projeto

## Configuração do Mercado Pago

1. Criar uma aplicação no Mercado Pago
2. Configurar webhook para `https://seu-dominio.com/api/payments/webhook`
3. Obter Access Token

## Configuração da OpenAI

1. Criar uma chave de API na OpenAI
2. Configurar limites de uso

## Deploy na Vercel

1. Conectar repositório Git à Vercel
2. Configurar variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `MERCADO_PAGO_ACCESS_TOKEN`
   - `NEXT_PUBLIC_APP_URL`
3. Configurar domínio personalizado (opcional)
4. Iniciar deploy

## Verificação pós-deploy

1. Testar autenticação
2. Testar criação de entradas de diário
3. Testar análise com OpenAI
4. Testar pagamentos com Mercado Pago
5. Verificar responsividade em diferentes dispositivos

## Monitoramento

1. Configurar alertas na Vercel
2. Monitorar uso da API da OpenAI
3. Monitorar transações no Mercado Pago
4. Configurar logs e rastreamento de erros
