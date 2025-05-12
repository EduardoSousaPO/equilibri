#!/bin/bash
# Script para verificar o status do deploy na Vercel

echo "Verificando status do projeto Equilibri.IA na Vercel..."
echo "=====================================================
"

# Obtendo informações de deployment
echo "COMMIT ATUAL:"
git log -1 --oneline
echo ""

echo "CONFIGURAÇÕES DE BUILD:"
cat next.config.js
echo ""

echo "DEPENDÊNCIAS PRINCIPAIS:"
grep -e "\"name\":" -e "\"version\":" package.json | head -n 10
echo ""

echo "CONFIGURAÇÕES DE TYPESCRIPT:"
grep -e "\"compilerOptions\":" -e "\"target\":" -e "\"lib\":" -e "\"jsx\":" tsconfig.json
echo ""

echo "COMPONENTES UI DISPONÍVEIS:"
ls -la src/components/ui/
echo ""

echo "VERIFICAR BUILD LOCAL:"
echo "Execute 'pnpm build' para verificar se a compilação local está funcionando corretamente."
echo ""

echo "PRÓXIMOS PASSOS:"
echo "1. Verifique o status do deploy na interface da Vercel"
echo "2. Se o build falhar, verifique os logs na Vercel"
echo "3. Corrija quaisquer erros adicionais encontrados"
echo "4. Faça novos commits conforme necessário"
echo ""

echo "Status de verificação concluído!" 