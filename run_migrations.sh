#!/bin/bash

# Script para executar as migrações no banco de dados Supabase

echo "Iniciando migração de subscription_tier para plan..."

# Executando primeira migração
echo "Executando migração inicial..."
PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $SUPABASE_DB_HOST -U $SUPABASE_DB_USER -d $SUPABASE_DB_NAME -f migrations/0001_initial.sql

# Executando migração de atualização de colunas
echo "Executando migração para atualizar colunas..."
PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $SUPABASE_DB_HOST -U $SUPABASE_DB_USER -d $SUPABASE_DB_NAME -f migrations/0002_update_profile_columns.sql

echo "Migração concluída com sucesso!" 