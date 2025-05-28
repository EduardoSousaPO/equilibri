# Migração de Colunas do Banco de Dados

Este documento descreve a migração realizada no banco de dados, substituindo as colunas `subscription_tier` e `subscription_status` por uma abordagem mais simplificada.

## Mudanças Realizadas

1. Renomeação da coluna `subscription_tier` para `plan` na tabela `profiles`
2. Remoção da coluna `subscription_status` da tabela `profiles` (assumindo sempre o valor 'active')
3. Adição das colunas `msg_count` e `streak_days` à tabela `profiles` (se ainda não existirem)

## Como Executar a Migração

Para executar as migrações no banco de dados Supabase, siga os passos abaixo:

### 1. Configure as variáveis de ambiente

```bash
export SUPABASE_DB_HOST=seu-host.supabase.co
export SUPABASE_DB_USER=seu-usuario
export SUPABASE_DB_PASSWORD=sua-senha
export SUPABASE_DB_NAME=postgres
```

### 2. Execute o script de migração

```bash
./run_migrations.sh
```

## Impacto no Código

Esta migração afeta diversas partes do código que faziam referência às colunas antigas. Todos os arquivos foram atualizados para usar a nova estrutura.

Principais alterações:

- Todas as queries que selecionavam `subscription_tier` agora selecionam `plan` 
- Referências a `subscription_status` foram removidas ou substituídas por um valor padrão 'active'
- Todas as interfaces de tipo que continham estas propriedades foram atualizadas

## Notas Adicionais

- A migração é compatível com aplicações em execução, pois a coluna `plan` mantém os mesmos valores que `subscription_tier`
- Para verificar o status real de uma assinatura, será necessário implementar uma lógica adicional no futuro, possivelmente utilizando uma nova tabela `subscriptions` 