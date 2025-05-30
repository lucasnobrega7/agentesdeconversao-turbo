"""
=============================================================================
MODELS INIT - EXPORTAÇÃO INTELIGENTE QUE SEPARA PRO DE AMADOR
Enquanto outros fazem import *, nós controlamos exatamente o que exporta
=============================================================================
"""

# Base models - fundação de tudo
from app.models.base import (
    Base, BaseSchema, TimestampSchema, PaginationSchema,
    PaginatedResponse, ErrorResponse, SuccessResponse,
    BaseEnum, StatusEnum
)

# User models - quem paga as contas
from app.models.user import (
    User, UserRole, UserStatus,
    UserCreate, UserUpdate, UserResponse, UserDetail
)

# Organization models - multi-tenancy de verdade
from app.models.organization import (
    Organization, OrganizationPlan, OrganizationStatus,
    OrganizationCreate, OrganizationUpdate, 
    OrganizationResponse, OrganizationDetail
)

# Agent models - onde a mágica acontece
from app.models.agent import (
    Agent, AgentType, AgentStatus, AgentModel,
    AgentCreate, AgentUpdate, AgentResponse, AgentDetail
)

# Conversation models - onde o dinheiro é feito
from app.models.conversation import (
    Conversation, Message, ConversationStatus, ConversationChannel,
    ConversationCreate, MessageCreate, ConversationResponse,
    ConversationDetail, ConversationStats
)

__all__ = [
    # Base
    "Base", "BaseSchema", "TimestampSchema", "PaginationSchema",
    "PaginatedResponse", "ErrorResponse", "SuccessResponse",
    "BaseEnum", "StatusEnum",
    
    # User
    "User", "UserRole", "UserStatus",
    "UserCreate", "UserUpdate", "UserResponse", "UserDetail",
    
    # Organization
    "Organization", "OrganizationPlan", "OrganizationStatus",
    "OrganizationCreate", "OrganizationUpdate",
    "OrganizationResponse", "OrganizationDetail",
    
    # Agent
    "Agent", "AgentType", "AgentStatus", "AgentModel",
    "AgentCreate", "AgentUpdate", "AgentResponse", "AgentDetail",
    
    # Conversation
    "Conversation", "Message", "ConversationStatus", "ConversationChannel",
    "ConversationCreate", "MessageCreate", "ConversationResponse",
    "ConversationDetail", "ConversationStats"
]