#!/bin/bash
# claude-code-next-phase.sh

echo "🚀 CLAUDE CODE - ATIVANDO PRÓXIMA FASE"

# 1. Verificar sistema atual
curl -s http://localhost:8000/api/status | jq '.'

# 2. Aplicar schema Supabase
cd backend && python setup_supabase_schema.py

# 3. Testar integração completa
cd ../apps/dashboard
pnpm dev

# 4. Deploy Evolution API
echo "Deploy Evolution: https://railway.app/new/template/LK1WXD"

echo "✅ Sistema pronto para fase final"