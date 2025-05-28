# Cores para output
$Red = [System.ConsoleColor]::Red
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow

# Função para executar uma migration
function Run-Migration {
    param (
        [string]$file
    )
    Write-Host "Executando migration: $file" -ForegroundColor $Yellow
    
    # Executar a migration usando o cliente psql do Supabase
    Get-Content $file | supabase db reset --db-url "$env:SUPABASE_DB_URL"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Migration executada com sucesso: $file" -ForegroundColor $Green
    }
    else {
        Write-Host "✗ Erro ao executar migration: $file" -ForegroundColor $Red
        exit 1
    }
}

# Verificar se o diretório de migrations existe
if (-not (Test-Path "migrations")) {
    Write-Host "Diretório de migrations não encontrado" -ForegroundColor $Red
    exit 1
}

# Executar todas as migrations em ordem alfabética
Get-ChildItem "migrations\*.sql" | ForEach-Object {
    Run-Migration $_.FullName
}

Write-Host "Todas as migrations foram executadas com sucesso!" -ForegroundColor $Green 