from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_integrations():
    """List all integrations"""
    return {
        "integrations": [
            {"name": "WhatsApp", "status": "active"},
            {"name": "Instagram", "status": "inactive"},
            {"name": "Facebook", "status": "inactive"},
        ]
    }

@router.post("/whatsapp/webhook")
async def whatsapp_webhook():
    """WhatsApp webhook endpoint"""
    return {"message": "Webhook received"}

@router.post("/instagram/webhook")
async def instagram_webhook():
    """Instagram webhook endpoint"""
    return {"message": "Webhook received"}

@router.post("/evolution/instance")
async def create_evolution_instance():
    """Create Evolution API instance"""
    return {"message": "Instance created"}
