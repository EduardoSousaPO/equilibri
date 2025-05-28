#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Função para executar uma migration
run_migration() {
    local file=$1
    echo -e "${YELLOW}Executando migration: $file${NC}"
    
    # Executar a migration usando o cliente psql do Supabase
    supabase db reset --db-url "$SUPABASE_DB_URL" < "$file"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Migration executada com sucesso: $file${NC}"
    else
        echo -e "${RED}✗ Erro ao executar migration: $file${NC}"
        exit 1
    fi
}

# Verificar se o diretório de migrations existe
if [ ! -d "migrations" ]; then
    echo -e "${RED}Diretório de migrations não encontrado${NC}"
    exit 1
fi

# Executar todas as migrations em ordem alfabética
for file in migrations/*.sql; do
    if [ -f "$file" ]; then
        run_migration "$file"
    fi
done

echo -e "${GREEN}Todas as migrations foram executadas com sucesso!${NC}" 