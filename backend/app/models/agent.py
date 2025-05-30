"""
=============================================================================
AGENT.PY - MODEL DE AGENTE QUE VAI FAZER VOCÊ CHORAR DE INVEJA
Enquanto outros fazem chatbot de WhatsApp com 3 respostas, nós fazemos IA enterprise
=============================================================================
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from uuid import UUID
import json

from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from sqlalchemy import (
    Column, String, Boolean, DateTime, Text, JSON, Integer, Float,
    ForeignKey, UniqueConstraint, Index, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID, JSONB
from sqlalchemy.orm import relationship

from app.models.base import (
    Base, BaseSchema, TimestampSchema, TimestampMixin,
    SoftDeleteMixin, AuditMixin, BaseEnum, StatusEnum
)
from app.models.user import User


# =============================================================================
# ENUMS - PORQUE CONSTANTES MÁGICAS SÃO COISA DE INICIANTE
# =============================================================================

class AgentType(BaseEnum):
    """Tipos de agente - cada um com seu propósito"""
    SALES = "sales"                    # Vende como ninguém
    SUPPORT = "support"                # Suporte que resolve
    LEAD_CAPTURE = "lead_capture"      # Captura leads como pescador
    QUALIFICATION = "qualification"    # Qualifica leads como filtro
    ONBOARDING = "onboarding"         # Onboarding suave
    RETENTION = "retention"           # Retém clientes como cola
    CUSTOM = "custom"                 # Customizado para qualquer coisa


class AgentStatus(BaseEnum):
    """Status do agente - controle fino"""
    DRAFT = "draft"                   # Em construção
    TESTING = "testing"               # Em testes
    ACTIVE = "active"                 # Ativo e funcionando
    PAUSED = "paused"                 # Pausado temporariamente
    ARCHIVED = "archived"             # Arquivado
    ERROR = "error"                   # Com erro


class AgentModel(BaseEnum):
    """Modelos de IA disponíveis - só o melhor"""
    GPT4_TURBO = "gpt-4-turbo"
    GPT4 = "gpt-4"
    GPT35_TURBO = "gpt-3.5-turbo"
    CLAUDE_3_OPUS = "anthropic/claude-3-opus"
    CLAUDE_3_SONNET = "anthropic/claude-3-sonnet"
    CLAUDE_3_HAIKU = "anthropic/claude-3-haiku"
    LLAMA_3_70B = "meta-llama/llama-3-70b"
    MIXTRAL_8X7B = "mistralai/mixtral-8x7b"
    CUSTOM = "custom"


class ConversationMode(BaseEnum):
    """Modos de conversa - flexibilidade total"""
    REACTIVE = "reactive"             # Responde quando perguntado
    PROACTIVE = "proactive"           # Toma iniciativa
    MIXED = "mixed"                   # Mistura dos dois
    SCRIPTED = "scripted"             # Segue script rígido


class IntegrationType(BaseEnum):
    """Tipos de integração - conecta com tudo"""
    WHATSAPP = "whatsapp"
    TELEGRAM = "telegram"
    WEBCHAT = "webchat"
    SLACK = "slack"
    DISCORD = "discord"
    API = "api"
    EMAIL = "email"
    SMS = "sms"


# =============================================================================
# SQLALCHEMY MODEL - ONDE A MÁGICA ACONTECE
# =============================================================================

class Agent(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    """
    Modelo de Agente AI - O cérebro da operação.
    Multi-canal, multi-modelo, multi-propósito.
    Enterprise grade que faz concorrente chorar.
    """
    
    __tablename__ = "agents"
    __table_args__ = (
        UniqueConstraint("organization_id", "slug", name="uq_agent_org_slug"),
        Index("idx_agent_status", "status"),
        Index("idx_agent_type", "type"),
        Index("idx_agent_org_status", "organization_id", "status"),
    )
    
    # Primary Key
    id = Column(
        PostgresUUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()",
        comment="UUID único do agente"
    )
    
    # Organization & Owner
    organization_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Organização dona do agente"
    )
    owner_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Usuário dono do agente"
    )
    
    # Basic Info
    name = Column(
        String(100),
        nullable=False,
        comment="Nome do agente"
    )
    slug = Column(
        String(100),
        nullable=False,
        index=True,
        comment="Slug único para URLs"
    )
    description = Column(
        Text,
        nullable=True,
        comment="Descrição do agente"
    )
    avatar_url = Column(
        Text,
        nullable=True,
        comment="Avatar do agente"
    )
    
    # Type & Status
    type = Column(
        String(50),
        nullable=False,
        default=AgentType.CUSTOM.value,
        comment="Tipo do agente"
    )
    status = Column(
        String(50),
        nullable=False,
        default=AgentStatus.DRAFT.value,
        comment="Status atual"
    )
    
    # AI Configuration
    model = Column(
        String(100),
        nullable=False,
        default=AgentModel.GPT4_TURBO.value,
        comment="Modelo de IA"
    )
    model_config = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Configurações do modelo"
    )
    temperature = Column(
        Float,
        nullable=False,
        default=0.7,
        comment="Temperatura (criatividade)"
    )
    max_tokens = Column(
        Integer,
        nullable=False,
        default=2048,
        comment="Máximo de tokens por resposta"
    )
    
    # Conversation Settings
    conversation_mode = Column(
        String(50),
        nullable=False,
        default=ConversationMode.MIXED.value,
        comment="Modo de conversa"
    )
    response_time_ms = Column(
        Integer,
        nullable=False,
        default=1000,
        comment="Tempo de resposta simulado (ms)"
    )
    typing_simulation = Column(
        Boolean,
        nullable=False,
        default=True,
        comment="Simula digitação?"
    )
    
    # System Prompt & Instructions
    system_prompt = Column(
        Text,
        nullable=False,
        comment="Prompt do sistema (personalidade)"
    )
    instructions = Column(
        Text,
        nullable=True,
        comment="Instruções específicas"
    )
    greeting_message = Column(
        Text,
        nullable=True,
        comment="Mensagem de boas-vindas"
    )
    
    # Knowledge Base
    knowledge_base = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Base de conhecimento estruturada"
    )
    vector_store_id = Column(
        String(255),
        nullable=True,
        comment="ID do vector store (embeddings)"
    )
    
    # Flow Configuration (AgentStudio)
    flow_data = Column(
        JSONB,
        nullable=True,
        comment="Configuração do fluxo (ReactFlow)"
    )
    flow_version = Column(
        Integer,
        nullable=False,
        default=1,
        comment="Versão do fluxo"
    )
    
    # Tools & Integrations
    enabled_tools = Column(
        JSONB,
        nullable=False,
        default=list,
        comment="Ferramentas habilitadas (MCP, etc)"
    )
    integrations = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Configurações de integrações"
    )
    
    # Performance & Limits
    rate_limit_per_minute = Column(
        Integer,
        nullable=False,
        default=60,
        comment="Limite de mensagens por minuto"
    )
    concurrent_conversations = Column(
        Integer,
        nullable=False,
        default=100,
        comment="Conversas simultâneas máximo"
    )
    
    # Analytics & Metrics
    total_conversations = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Total de conversas"
    )
    total_messages = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Total de mensagens"
    )
    avg_conversation_duration = Column(
        Float,
        nullable=True,
        comment="Duração média das conversas (segundos)"
    )
    satisfaction_score = Column(
        Float,
        nullable=True,
        comment="Score de satisfação (0-5)"
    )
    conversion_rate = Column(
        Float,
        nullable=True,
        comment="Taxa de conversão (%)"
    )
    
    # Scheduling
    active_hours = Column(
        JSONB,
        nullable=True,
        comment="Horários de funcionamento"
    )
    timezone = Column(
        String(50),
        nullable=False,
        default="America/Sao_Paulo",
        comment="Timezone do agente"
    )
    
    # Advanced Features
    sentiment_analysis = Column(
        Boolean,
        nullable=False,
        default=True,
        comment="Análise de sentimento ativa?"
    )
    auto_escalation = Column(
        Boolean,
        nullable=False,
        default=True,
        comment="Escalonamento automático?"
    )
    multilingual = Column(
        Boolean,
        nullable=False,
        default=False,
        comment="Suporte multilíngue?"
    )
    supported_languages = Column(
        JSONB,
        nullable=False,
        default=lambda: ["pt-BR"],
        comment="Idiomas suportados"
    )
    
    # Metadata
    tags = Column(
        JSONB,
        nullable=False,
        default=list,
        comment="Tags para organização"
    )
    metadata_json = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Metadados customizados"
    )
    
    # Relationships
    organization = relationship("Organization", back_populates="agents")
    owner = relationship("User", back_populates="agents")
    conversations = relationship("Conversation", back_populates="agent")
    flows = relationship("AgentFlow", back_populates="agent")
    analytics = relationship("AgentAnalytics", back_populates="agent")
    
    def __repr__(self):
        return f"<Agent {self.name} ({self.type})>"
    
    @property
    def is_active(self) -> bool:
        """Verifica se está ativo"""
        return self.status == AgentStatus.ACTIVE.value
    
    @property
    def can_handle_conversation(self) -> bool:
        """Pode lidar com nova conversa?"""
        return (
            self.is_active and 
            self.total_conversations < self.concurrent_conversations
        )


# =============================================================================
# PYDANTIC SCHEMAS - VALIDAÇÃO NIVEL NASA
# =============================================================================

class AgentBase(BaseSchema):
    """Base schema para agente"""
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Nome do agente",
        example="Assistente de Vendas"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Descrição do agente",
        example="Especialista em converter leads em clientes"
    )
    type: AgentType = Field(
        default=AgentType.CUSTOM,
        description="Tipo do agente"
    )
    avatar_url: Optional[str] = Field(
        default=None,
        description="URL do avatar"
    )


class AgentAIConfig(BaseSchema):
    """Configuração de IA do agente"""
    model: AgentModel = Field(
        default=AgentModel.GPT4_TURBO,
        description="Modelo de IA"
    )
    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0,
        description="Temperatura (0-2)"
    )
    max_tokens: int = Field(
        default=2048,
        ge=100,
        le=8192,
        description="Máximo de tokens"
    )
    model_config: Dict[str, Any] = Field(
        default_factory=dict,
        description="Configurações extras do modelo"
    )
    
    @field_validator("temperature")
    @classmethod
    def validate_temperature(cls, v: float) -> float:
        """Valida temperatura"""
        if not 0 <= v <= 2:
            raise ValueError("Temperatura deve estar entre 0 e 2")
        return round(v, 2)


class AgentPromptConfig(BaseSchema):
    """Configuração de prompts do agente"""
    system_prompt: str = Field(
        ...,
        min_length=10,
        max_length=4000,
        description="Prompt do sistema",
        example="Você é um assistente de vendas especializado..."
    )
    instructions: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Instruções adicionais"
    )
    greeting_message: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Mensagem de boas-vindas",
        example="Olá! Como posso ajudar você hoje?"
    )


class AgentConversationConfig(BaseSchema):
    """Configuração de conversa do agente"""
    conversation_mode: ConversationMode = Field(
        default=ConversationMode.MIXED,
        description="Modo de conversa"
    )
    response_time_ms: int = Field(
        default=1000,
        ge=0,
        le=10000,
        description="Tempo de resposta (ms)"
    )
    typing_simulation: bool = Field(
        default=True,
        description="Simular digitação?"
    )
    rate_limit_per_minute: int = Field(
        default=60,
        ge=1,
        le=1000,
        description="Limite por minuto"
    )
    concurrent_conversations: int = Field(
        default=100,
        ge=1,
        le=10000,
        description="Conversas simultâneas"
    )


class AgentScheduleConfig(BaseSchema):
    """Configuração de horários do agente"""
    timezone: str = Field(
        default="America/Sao_Paulo",
        description="Timezone"
    )
    active_hours: Optional[Dict[str, List[str]]] = Field(
        default=None,
        description="Horários ativos por dia",
        example={
            "monday": ["09:00-12:00", "14:00-18:00"],
            "tuesday": ["09:00-18:00"]
        }
    )


class AgentCreate(AgentBase):
    """Schema para criar agente"""
    ai_config: AgentAIConfig = Field(
        default_factory=AgentAIConfig,
        description="Configuração de IA"
    )
    prompt_config: AgentPromptConfig = Field(
        ...,
        description="Configuração de prompts"
    )
    conversation_config: Optional[AgentConversationConfig] = Field(
        default_factory=AgentConversationConfig,
        description="Configuração de conversa"
    )
    schedule_config: Optional[AgentScheduleConfig] = Field(
        default_factory=AgentScheduleConfig,
        description="Configuração de horários"
    )
    
    # Features
    sentiment_analysis: bool = Field(
        default=True,
        description="Ativar análise de sentimento?"
    )
    auto_escalation: bool = Field(
        default=True,
        description="Ativar escalonamento automático?"
    )
    multilingual: bool = Field(
        default=False,
        description="Suporte multilíngue?"
    )
    
    # Metadata
    tags: List[str] = Field(
        default_factory=list,
        description="Tags do agente"
    )
    
    @model_validator(mode="after")
    def validate_config(self) -> "AgentCreate":
        """Validações complexas"""
        # Se multilingual, precisa de idiomas
        if self.multilingual and not self.schedule_config:
            self.schedule_config = AgentScheduleConfig()
        return self


class AgentUpdate(BaseSchema):
    """Schema para atualizar agente"""
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[AgentType] = None
    status: Optional[AgentStatus] = None
    avatar_url: Optional[str] = None
    
    # Nested configs
    ai_config: Optional[AgentAIConfig] = None
    prompt_config: Optional[AgentPromptConfig] = None
    conversation_config: Optional[AgentConversationConfig] = None
    schedule_config: Optional[AgentScheduleConfig] = None
    
    # Features
    sentiment_analysis: Optional[bool] = None
    auto_escalation: Optional[bool] = None
    multilingual: Optional[bool] = None
    
    # Metadata
    tags: Optional[List[str]] = None


class AgentResponse(AgentBase, TimestampSchema):
    """Schema de resposta do agente"""
    id: UUID
    organization_id: UUID
    owner_id: Optional[UUID]
    slug: str
    status: str
    
    # AI Config
    model: str
    temperature: float
    max_tokens: int
    
    # Stats
    total_conversations: int
    total_messages: int
    satisfaction_score: Optional[float]
    conversion_rate: Optional[float]
    
    # Features
    sentiment_analysis: bool
    auto_escalation: bool
    multilingual: bool
    
    # Computed
    is_active: bool
    can_handle_conversation: bool
    
    model_config = ConfigDict(from_attributes=True)


class AgentDetail(AgentResponse):
    """Schema detalhado do agente"""
    # Full configs
    model_config: Dict[str, Any]
    system_prompt: str
    instructions: Optional[str]
    greeting_message: Optional[str]
    
    # Advanced
    conversation_mode: str
    response_time_ms: int
    typing_simulation: bool
    rate_limit_per_minute: int
    concurrent_conversations: int
    
    # Knowledge
    knowledge_base: Dict[str, Any]
    vector_store_id: Optional[str]
    
    # Flow
    flow_data: Optional[Dict[str, Any]]
    flow_version: int
    
    # Tools & Integrations
    enabled_tools: List[str]
    integrations: Dict[str, Any]
    
    # Schedule
    active_hours: Optional[Dict[str, List[str]]]
    timezone: str
    supported_languages: List[str]
    
    # Metadata
    tags: List[str]
    metadata_json: Dict[str, Any]
    avg_conversation_duration: Optional[float]


class AgentStats(BaseSchema):
    """Estatísticas do agente"""
    agent_id: UUID
    period: str = Field(description="Período (day|week|month|all)")
    
    # Conversations
    total_conversations: int
    active_conversations: int
    completed_conversations: int
    abandoned_conversations: int
    
    # Messages
    total_messages: int
    avg_messages_per_conversation: float
    
    # Performance
    avg_response_time_ms: float
    avg_conversation_duration_seconds: float
    
    # Quality
    satisfaction_score: float
    positive_conversations: int
    negative_conversations: int
    neutral_conversations: int
    
    # Business
    conversion_rate: float
    total_conversions: int
    revenue_generated: Optional[float]
    
    # Engagement
    engagement_rate: float
    escalation_rate: float
    resolution_rate: float


# =============================================================================
# FLOW SCHEMAS - AGENTSTUDIO
# =============================================================================

class FlowNode(BaseSchema):
    """Nó do fluxo do AgentStudio"""
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]


class FlowEdge(BaseSchema):
    """Conexão entre nós"""
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class AgentFlow(BaseSchema):
    """Fluxo completo do AgentStudio"""
    nodes: List[FlowNode]
    edges: List[FlowEdge]
    viewport: Dict[str, Any] = Field(
        default={"x": 0, "y": 0, "zoom": 1}
    )
    metadata: Dict[str, Any] = Field(default_factory=dict)


# =============================================================================
# EXPORTS - USE COM SABEDORIA
# =============================================================================

__all__ = [
    # Enums
    "AgentType",
    "AgentStatus",
    "AgentModel",
    "ConversationMode",
    "IntegrationType",
    
    # SQLAlchemy
    "Agent",
    
    # Schemas
    "AgentBase",
    "AgentAIConfig",
    "AgentPromptConfig",
    "AgentConversationConfig",
    "AgentScheduleConfig",
    "AgentCreate",
    "AgentUpdate",
    "AgentResponse",
    "AgentDetail",
    "AgentStats",
    
    # Flow
    "FlowNode",
    "FlowEdge",
    "AgentFlow"
]