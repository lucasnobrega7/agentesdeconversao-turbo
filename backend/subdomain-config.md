# Configuração de Subdomínios Enterprise

## DNS Records (Cloudflare/Route53)

```
agentesdeconversao.ai           A/CNAME  → lp.agentesdeconversao.ai
lp.agentesdeconversao.ai        CNAME    → vercel.app
dash.agentesdeconversao.ai      CNAME    → vercel.app  
docs.agentesdeconversao.ai      CNAME    → vercel.app
login.agentesdeconversao.ai     CNAME    → vercel.app
api.agentesdeconversao.ai       CNAME    → railway.app
chat.agentesdeconversao.ai      CNAME    → vercel.app
```

## Vercel Configuration

### Project 1: Landing Page (lp.agentesdeconversao.ai)
- Build Command: `npm run build`
- Output Directory: `.next`
- Framework: Next.js

### Project 2: Dashboard (dash.agentesdeconversao.ai)  
- Build Command: `npm run build`
- Output Directory: `.next`
- Framework: Next.js

### Project 3: Docs (docs.agentesdeconversao.ai)
- Framework: Next.js/Nextra

## Railway Configuration

### API Service (api.agentesdeconversao.ai)
- Start Command: `uvicorn main_enterprise:app --host 0.0.0.0 --port $PORT`
- Environment: Production
- Health Check: `/health`
