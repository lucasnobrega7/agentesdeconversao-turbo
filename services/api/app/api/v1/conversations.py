from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_conversations():
    """List all conversations"""
    return {"conversations": []}

@router.post("/")
async def create_conversation():
    """Create a new conversation"""
    return {"message": "Conversation created"}

@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get conversation by ID"""
    return {"conversation_id": conversation_id}

@router.post("/{conversation_id}/messages")
async def send_message(conversation_id: str):
    """Send message to conversation"""
    return {"message": "Message sent"}
