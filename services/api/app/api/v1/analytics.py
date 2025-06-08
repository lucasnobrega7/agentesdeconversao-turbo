from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_analytics():
    """Get dashboard analytics"""
    return {
        "total_conversations": 0,
        "conversion_rate": 0,
        "active_agents": 0,
        "revenue": 0
    }

@router.get("/agents/{agent_id}")
async def get_agent_analytics(agent_id: str):
    """Get analytics for specific agent"""
    return {"agent_id": agent_id, "metrics": {}}

@router.get("/conversations/{conversation_id}")
async def get_conversation_analytics(conversation_id: str):
    """Get analytics for specific conversation"""
    return {"conversation_id": conversation_id, "metrics": {}}
