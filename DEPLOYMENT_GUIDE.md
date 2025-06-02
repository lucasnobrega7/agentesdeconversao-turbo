# 🚀 GUIA DE DEPLOY - Agentes de Conversão

## ✅ Checklist Pré-Deploy

### 1. **Variáveis de Ambiente**
```bash
# Verificar se todas estão configuradas na Vercel:
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_SUPABASE_URL  
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_DASHBOARD_URL
- OPENROUTER_API_KEY
- SUPABASE_SERVICE_ROLE_KEY
```

### 2. **Build Local Funcionando**
```bash
cd apps/web
pnpm build
```

### 3. **Supabase Configurado**
- ✅ Schema aplicado
- ✅ RLS policies ativas
- ✅ Auth configurado

## 📦 Deploy na Vercel

### Opção 1: Via CLI
```bash
# Na raiz do projeto
vercel

# Ou direto para produção
vercel --prod
```

### Opção 2: Via Git Push
```bash
git add .
git commit -m "feat: v0.dev UI components integrated"
git push origin main
```

## 🔧 Configurações da Vercel

### Framework Preset
- **Framework**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `cd ../.. && pnpm build --filter=web`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

### Environment Variables
Adicionar no painel da Vercel:
1. Production
2. Preview
3. Development

## 🌐 Domínios Customizados

### Configurar Subdomínios
1. `agentesdeconversao.ai` → Landing
2. `dash.agentesdeconversao.ai` → Dashboard
3. `api.agentesdeconversao.ai` → Backend API
4. `docs.agentesdeconversao.ai` → Documentação

### DNS Records (Cloudflare/Route53)
```
A     @      76.76.21.21
A     dash   76.76.21.21
A     api    [Railway IP]
CNAME www    cname.vercel-dns.com
```

## 🔍 Pós-Deploy Verificações

### 1. Funcionalidades Críticas
- [ ] Login/Signup funcionando
- [ ] Dark mode toggle
- [ ] Organization switcher
- [ ] Notifications dropdown
- [ ] User navigation menu

### 2. Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

### 3. SEO
- [ ] Meta tags corretas
- [ ] Open Graph images
- [ ] Sitemap gerado

## 🚨 Troubleshooting

### Build Failing
```bash
# Limpar cache
rm -rf .next node_modules
pnpm install
pnpm build
```

### Environment Variables Missing
- Verificar painel Vercel
- Confirmar valores em .env.production
- Rebuild após adicionar vars

### 404 em Rotas
- Verificar next.config.js
- Confirmar estrutura de pastas
- Clear cache no Vercel

## 📊 Monitoramento

### Vercel Analytics
- Habilitar no dashboard
- Monitorar Web Vitals
- Configurar alertas

### Supabase Dashboard
- Monitor de queries
- Usage tracking
- Error logs

---

**Última atualização**: 02/06/2025
**Status**: Pronto para deploy
**Ambiente**: Production