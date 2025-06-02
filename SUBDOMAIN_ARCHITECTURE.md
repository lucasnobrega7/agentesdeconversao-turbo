# 🌐 ARQUITETURA ENTERPRISE DE SUBDOMÍNIOS

## 🎯 **Estrutura de Domínios**

```
agentesdeconversao.ai
├── 🏠 agentesdeconversao.ai           # Redirect → lp.agentesdeconversao.ai
├── 🎨 lp.agentesdeconversao.ai        # Landing Page & Marketing  
├── 📊 dash.agentesdeconversao.ai      # Dashboard Principal
├── 🔌 api.agentesdeconversao.ai       # Backend & API
├── 📖 docs.agentesdeconversao.ai      # Documentação
└── 🔐 login.agentesdeconversao.ai     # Autenticação
```

## 🚀 **Configuração de Deploy**

### **1. Landing Page (lp.agentesdeconversao.ai)**
- **Serviço:** Vercel
- **Repositório:** https://github.com/lucasnobrega7/agentesdeconversao-turbo
- **Path:** `/apps/web` 
- **Build:** `turbo build --filter=@repo/web`
- **Tipo:** Static/SSR Next.js

### **2. Dashboard (dash.agentesdeconversao.ai)**  
- **Serviço:** Vercel
- **Repositório:** Mesmo repositório
- **Path:** `/apps/web` (rotas protegidas)
- **Build:** `turbo build --filter=@repo/web`
- **Tipo:** SSR Next.js + Auth

### **3. API Backend (api.agentesdeconversao.ai)**
- **Serviço:** Railway  
- **Project ID:** fcda25f6-a7e8-4746-bf1e-2d7aa7091137
- **Path:** `/services/api`
- **Build:** Docker (FastAPI)
- **Port:** 8000

### **4. Documentação (docs.agentesdeconversao.ai)**
- **Serviço:** Vercel
- **Repositório:** Mesmo repositório  
- **Path:** `/docs` (Mintlify/Docusaurus)
- **Build:** Static site
- **Tipo:** Documentation

### **5. Autenticação (login.agentesdeconversao.ai)**
- **Serviço:** Vercel
- **Repositório:** Mesmo repositório
- **Path:** `/apps/web` (rotas de auth)
- **Build:** SSR Next.js + Supabase Auth
- **Tipo:** Authentication pages

## 🔧 **Configuração DNS & Routing**

### **Vercel Custom Domains:**
```bash
# Domain principal
agentesdeconversao.ai → Redirect to lp.agentesdeconversao.ai

# Landing Page  
lp.agentesdeconversao.ai → apps/web (landing routes)

# Dashboard
dash.agentesdeconversao.ai → apps/web (dashboard routes)

# Documentation
docs.agentesdeconversao.ai → docs/ (static docs)

# Authentication 
login.agentesdeconversao.ai → apps/web (auth routes)
```

### **Railway Custom Domain:**
```bash
# API Backend
api.agentesdeconversao.ai → services/api (FastAPI)
```

## 🛡️ **Segurança & CORS**

### **CORS Configuration:**
```javascript
// API (services/api)
ALLOWED_ORIGINS = [
  "https://agentesdeconversao.ai",
  "https://lp.agentesdeconversao.ai", 
  "https://dash.agentesdeconversao.ai",
  "https://login.agentesdeconversao.ai",
  "https://docs.agentesdeconversao.ai"
]
```

### **Authentication Flow:**
1. **Login:** `login.agentesdeconversao.ai` → Supabase Auth
2. **Redirect:** Dashboard `dash.agentesdeconversao.ai`
3. **API Calls:** `api.agentesdeconversao.ai` (JWT tokens)

## 📊 **Roteamento Inteligente**

### **Next.js Middleware (apps/web/middleware.ts):**
```typescript
// Redirect baseado no subdomínio
if (host === 'agentesdeconversao.ai') {
  return redirect('https://lp.agentesdeconversao.ai')
}

if (host === 'dash.agentesdeconversao.ai') {
  // Verificar autenticação
  if (!token) return redirect('https://login.agentesdeconversao.ai')
}

if (host === 'login.agentesdeconversao.ai') {
  // Apenas rotas de auth
  if (!pathname.startsWith('/auth/')) return redirect('/auth/login')
}
```

## 🎯 **URLs de Produção Finais**

- **🏠 Main:** https://agentesdeconversao.ai (redirect)
- **🎨 Landing:** https://lp.agentesdeconversao.ai
- **📊 Dashboard:** https://dash.agentesdeconversao.ai  
- **🔌 API:** https://api.agentesdeconversao.ai
- **📖 Docs:** https://docs.agentesdeconversao.ai
- **🔐 Login:** https://login.agentesdeconversao.ai

## ✅ **Status de Implementação**

- [✅] Repositório GitHub configurado
- [✅] Build commands Turborepo configurados  
- [✅] Railway backend linkado
- [✅] Supabase Auth integrado
- [🔄] Custom domains pendentes (via dashboard)
- [🔄] DNS configuration pendente
- [🔄] SSL certificates automáticos (Vercel/Railway)