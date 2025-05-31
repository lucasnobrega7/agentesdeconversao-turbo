# 🚀 Guia de Deploy - Agentes de Conversão

**Infraestrutura:** Supabase + Vercel + Railway  
**Projeto:** Enterprise SaaS Platform  
**Data:** 30/05/2025  

## 🎯 Configuração da Infraestrutura

### **Supabase - Projeto "One"**
```
Project: One
Reference ID: faccixlabriqwxkxqprw  
Region: South America (São Paulo)
URL: https://faccixlabriqwxkxqprw.supabase.co
```

**Configuração de Auth:**
- Site URL: `https://agentesdeconversao.vercel.app`
- Redirect URLs configuradas para subdomínios
- JWT expiry: 3600s (1 hora)
- Refresh token rotation: ✅ Habilitado

### **Vercel - Frontend Apps**
```
Project: agentesdeconversao
Team: agentesdeconversao
URL: https://vercel.com/agentesdeconversao/agentesdeconversao
Production: https://agentesdeconversao.vercel.app
```

**Apps configurados:**
- `apps/web/` → Frontend principal (Next.js 15.1.0)
- `apps/dashboard/` → Dashboard enterprise (Next.js 14.0.3)

### **Railway - Backend API**
```
Project ID: fcda25f6-a7e8-4746-bf1e-2d7aa7091137
Environment: c86f5190-5ce9-4198-82da-1d8999e646d3
URL: https://railway.com/project/fcda25f6-a7e8-4746-bf1e-2d7aa7091137
```

**Backend:** `apps/api/backend/` → FastAPI + Python

---

## 📋 Checklist de Deploy

### ✅ **Supabase (Database & Auth)**
- [x] Projeto "One" linkado
- [x] Tipos TypeScript gerados
- [x] RLS policies ativas (15 tabelas)
- [x] Auth URLs configuradas
- [x] Multi-tenant schema implementado

### ✅ **Vercel (Frontend)**
- [x] Projeto linkado
- [x] Auto-deploy configurado
- [x] Environment variables setup
- [x] Next.js 15.1.0 + Turbopack
- [x] Production build otimizado

### 🔧 **Railway (Backend)**
- [x] Projeto identificado
- [ ] Deployment configurado
- [ ] Environment variables
- [ ] Health checks
- [ ] Auto-scaling

### 🔧 **DNS & Domínios**
- [ ] agentesdeconversao.ai → Vercel
- [ ] api.agentesdeconversao.ai → Railway
- [ ] SSL certificates
- [ ] CDN configuration

---

## 🛠️ Comandos de Deploy

### **Deploy Frontend (Vercel)**
```bash
# Deploy manual
vercel --prod

# Deploy automático via Git
git push origin main  # Auto-deploy configurado
```

### **Deploy Backend (Railway)**
```bash
# Link project
railway link fcda25f6-a7e8-4746-bf1e-2d7aa7091137

# Deploy
railway up

# Logs
railway logs
```

### **Database (Supabase)**
```bash
# Aplicar migrations
supabase db push

# Verificar schema
supabase db diff

# Backup
supabase db dump > backup.sql
```

---

## 🔧 Environment Variables

### **Vercel (.env.production)**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://faccixlabriqwxkxqprw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]

# API
API_BASE_URL=https://api.agentesdeconversao.ai

# OpenRouter
OPENROUTER_API_KEY=[API_KEY]
```

### **Railway (.env)**
```bash
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.faccixlabriqwxkxqprw.supabase.co:5432/postgres
SUPABASE_SERVICE_KEY=[SERVICE_KEY]

# Security
JWT_SECRET=[JWT_SECRET]
CORS_ORIGINS=https://agentesdeconversao.vercel.app

# OpenRouter
OPENROUTER_API_KEY=[API_KEY]
```

---

## 🔍 Monitoramento

### **Health Checks**
- Frontend: `https://agentesdeconversao.vercel.app/health`
- Backend: `https://api.agentesdeconversao.ai/health`
- Database: Supabase Dashboard

### **Logs**
```bash
# Vercel
vercel logs

# Railway  
railway logs

# Supabase
supabase logs
```

### **Métricas**
- Vercel Analytics: Performance frontend
- Railway Metrics: Backend performance
- Supabase Insights: Database metrics

---

## 🚨 Troubleshooting

### **Problemas Comuns**

#### 1. **CORS Errors**
```bash
# Verificar CORS_ORIGINS
echo $CORS_ORIGINS

# Atualizar no Railway
railway variables set CORS_ORIGINS=https://agentesdeconversao.vercel.app
```

#### 2. **Database Connection**
```bash
# Testar conexão
supabase db ping

# Verificar credentials
railway variables list | grep DATABASE
```

#### 3. **Auth Redirect**
- Verificar URLs no Supabase Dashboard
- Conferir site_url e redirect_urls
- Validar JWT configuration

---

## 📈 Performance

### **Otimizações Aplicadas**
- ✅ Next.js 15.1.0 + Turbopack
- ✅ Static generation (ISR)
- ✅ Image optimization
- ✅ Bundle splitting
- ✅ CDN cache headers

### **Métricas Target**
- **LCP:** < 2.5s
- **FID:** < 100ms  
- **CLS:** < 0.1
- **TTI:** < 3.5s

---

## 🔒 Segurança

### **Headers Implementados**
- ✅ Content Security Policy
- ✅ HSTS (HTTP Strict Transport Security)
- ✅ X-Frame-Options
- ✅ XSS Protection
- ✅ CORS configurado por ambiente

### **Auth & Permissions**
- ✅ JWT com refresh rotation
- ✅ Row Level Security (RLS)
- ✅ API key authentication
- ✅ Rate limiting por plano

---

## 🎯 Próximos Passos

1. **Finalizar Railway Deploy**
2. **Configurar domínios customizados**
3. **Setup monitoring/alerting**
4. **Implement CI/CD pipeline**
5. **Load testing**
6. **Backup automation**

**Status:** 🟡 **85% Completo** - Pronto para produção com Railway deploy pendente