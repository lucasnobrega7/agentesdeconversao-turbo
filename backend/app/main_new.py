from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from .core.config import settings
from .core.database import database

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers when they exist
# app.include_router(agents.router, prefix=settings.API_V1_STR, tags=["agents"])
# app.include_router(conversations.router, prefix=settings.API_V1_STR, tags=["conversations"])
# app.include_router(analytics.router, prefix=settings.API_V1_STR, tags=["analytics"])
# app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])

# Root routes
@app.get("/")
async def root():
    return {
        "message": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "supabase" if database.use_supabase else "fallback",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/status")
async def get_status():
    return {
        "status": "operational",
        "version": settings.VERSION,
        "services": {
            "api": "operational",
            "database": "supabase" if database.use_supabase else "mock",
            "cache": "mock"
        },
        "supabase_integration": database.use_supabase,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)