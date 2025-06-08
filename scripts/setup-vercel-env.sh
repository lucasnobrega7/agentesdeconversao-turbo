#!/bin/bash

echo "🔧 Configurando variáveis de ambiente no Vercel..."
echo ""

# API Configuration
vercel env add NEXT_PUBLIC_API_URL production <<< "https://api.agentesdeconversao.ai"

# Supabase Configuration
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://faccixlabriqwxkxqprw.supabase.co"
echo "⚠️  Lembre-se de adicionar NEXT_PUBLIC_SUPABASE_ANON_KEY manualmente no dashboard do Vercel"

# App Configuration
vercel env add NEXT_PUBLIC_APP_URL production <<< "https://agentesdeconversao.ai"
vercel env add NEXT_PUBLIC_DASHBOARD_URL production <<< "https://dash.agentesdeconversao.ai"

echo ""
echo "✅ Variáveis de ambiente configuradas!"
echo ""
echo "📋 Resumo das configurações:"
echo "- API_URL: https://api.agentesdeconversao.ai"
echo "- SUPABASE_URL: https://faccixlabriqwxkxqprw.supabase.co"
echo "- APP_URL: https://agentesdeconversao.ai"
echo "- DASHBOARD_URL: https://dash.agentesdeconversao.ai"
echo ""
echo "⚠️  Não esqueça de:"
echo "1. Adicionar NEXT_PUBLIC_SUPABASE_ANON_KEY no dashboard do Vercel"
echo "2. Configurar as variáveis de ambiente no Railway para o backend"
echo "3. Fazer deploy após as configurações"