from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv("../.env.validation")

# Imports dos routers (quando existirem)
# from app.api.v1 import agents, conversations, analytics

# Lifespan para gerenciar conexões
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Iniciando Máquina de Milhões...")
    # TODO: Conectar Prisma aqui
    yield
    # Shutdown
    print("💤 Desligando... (mas voltamos amanhã para faturar mais)")

# App principal
app = FastAPI(
    title="Agentes de Conversão API",
    description="A API que separa os amadores dos profissionais",
    version="1.0.0",
    lifespan=lifespan
)

# CORS - Sem frescura
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em prod, seja específico ou vai tomar hack
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Bem-vindo à API dos Vencedores",
        "status": "Se você chegou aqui, já está à frente de 99%",
        "next_step": "Agora faça algo que gere dinheiro de verdade"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "API rodando como uma Ferrari",
        "uptime": "Mais tempo online que seus concorrentes",
        "potential": "R$1M+/ano se você executar direito"
    }

@app.get("/api/v1/test-openrouter")
async def test_openrouter():
    """Teste rápido do OpenRouter - Porque amador não testa nada"""
    try:
        import httpx
        
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            return {"error": "Sem chave do OpenRouter. Típico de amador."}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://openrouter.ai/api/v1/models",
                headers={"Authorization": f"Bearer {api_key}"}
            )
            
            if response.status_code == 200:
                models = response.json()
                return {
                    "status": "✅ OpenRouter VIVO",
                    "total_models": len(models.get("data", [])),
                    "message": "Agora use isso pra fazer dinheiro",
                    "top_models": [
                        "openai/gpt-4-turbo",
                        "anthropic/claude-3-opus",
                        "google/gemini-pro"
                    ]
                }
            else:
                return {"error": f"API morta: {response.status_code}"}
                
    except Exception as e:
        return {"error": f"Erro típico de iniciante: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    print("🔥 INICIANDO SERVIDOR - HORA DE FAZER MILHÕES!")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
