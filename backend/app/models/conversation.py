"""
=============================================================================
CONVERSATION.PY - MODEL DE CONVERSA QUE FAZ DINHEIRO
Não é chat. É máquina de conversão que transforma visitante em cliente
=============================================================================
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Union
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from sqlalchemy import (
    Column, String, Boolean, DateTime, Text, JSON, Integer, Float,
    ForeignKey, UniqueConstraint, Index, CheckConstraint, func
)
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID, JSONB, ARRAY
from sqlalchemy.orm import relationship

from app.models.base import (
    Base, BaseSchema, TimestampSchema, TimestampMixin,
    SoftDeleteMixin, AuditMixin, BaseEnum, StatusEnum
)


# =============================================================================
# ENUMS - ESTADOS QUE DEFINEM O JOGO
# =============================================================================

class ConversationStatus(BaseEnum):
    """
    Status da conversa - cada um vale dinheiro diferente.
    
    Sabe quantas vendas você perde por não rastrear isso? 60%.
    """
    WAITING = "waiting"              # Cliente esperando - cada segundo custa
    ACTIVE = "active"                # Conversa rolando - oportunidade viva
    HUMAN_TAKEOVER = "human_takeover" # Humano assumiu - custo alto
    RESOLVED = "resolved"            # Resolvida com sucesso
    ABANDONED = "abandoned"          # Cliente desistiu - dinheiro perdido
    ARCHIVED = "archived"            # Arquivada para análise


class ConversationChannel(BaseEnum):
    """Canais de conversa - onde o dinheiro entra"""
    WHATSAPP = "whatsapp"           # 87% de abertura
    TELEGRAM = "telegram"           # Público tech
    WEBCHAT = "webchat"             # Direto do site
    API = "api"                     # Integração custom
    SLACK = "slack"                 # B2B enterprise
    DISCORD = "discord"             # Comunidades
    EMAIL = "email"                 # Formal mas funciona
    SMS = "sms"                     # Urgência máxima


class MessageRole(BaseEnum):
    """Quem tá falando - importante para análise"""
    USER = "user"                   # Cliente/prospect
    ASSISTANT = "assistant"         # Seu agente AI
    SYSTEM = "system"              # Mensagens do sistema
    HUMAN_AGENT = "human_agent"    # Quando humano assume


class ConversationPriority(BaseEnum):
    """Prioridade - porque nem todo lead é igual"""
    LOW = "low"                     # Curioso
    MEDIUM = "medium"               # Interessado
    HIGH = "high"                   # Pronto pra comprar
    URGENT = "urgent"               # Feche agora ou perde


class SentimentScore(BaseEnum):
    """Sentimento do cliente - prevê conversão"""
    VERY_NEGATIVE = "very_negative"  # -2: Vai dar ruim
    NEGATIVE = "negative"           # -1: Tá difícil
    NEUTRAL = "neutral"             # 0: Em cima do muro
    POSITIVE = "positive"           # +1: Tá quase
    VERY_POSITIVE = "very_positive" # +2: Fecha negócio


class ConversationOutcome(BaseEnum):
    """Resultado final - o que importa de verdade"""
    CONVERTED = "converted"          # 💰 Vendeu!
    QUALIFIED_LEAD = "qualified_lead" # Lead quente
    INFO_PROVIDED = "info_provided"  # Só tirou dúvida
    ISSUE_RESOLVED = "issue_resolved" # Resolveu problema
    NOT_INTERESTED = "not_interested" # Não rolou
    SPAM = "spam"                   # Lixo


# =============================================================================
# SQLALCHEMY MODELS - ONDE O DINHEIRO É RASTREADO
# =============================================================================

class Conversation(Base, TimestampMixin, SoftDeleteMixin):
    """
    Conversa completa - cada interação vale ouro.
    
    Não é sobre quantidade de mensagens.
    É sobre conversão, timing e insights.
    """
    
    __tablename__ = "conversations"
    __table_args__ = (
        Index("idx_conversation_status", "status"),
        Index("idx_conversation_channel", "channel"),
        Index("idx_conversation_org_status", "organization_id", "status"),
        Index("idx_conversation_agent", "agent_id"),
        Index("idx_conversation_user", "assigned_user_id"),
        Index("idx_conversation_created", "created_at"),
        CheckConstraint("duration_seconds >= 0", name="ck_positive_duration"),
        CheckConstraint("messages_count >= 0", name="ck_positive_messages"),
    )
    
    # IDs
    id = Column(
        PostgresUUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()"
    )
    organization_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    agent_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    assigned_user_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Identificação
    external_id = Column(
        String(255),
        nullable=True,
        index=True,
        comment="ID externo (WhatsApp, Telegram, etc)"
    )
    session_id = Column(
        String(255),
        nullable=False,
        index=True,
        comment="Sessão única para agrupar mensagens"
    )
    
    # Canal e Status
    channel = Column(
        String(50),
        nullable=False,
        comment="Canal de origem"
    )
    status = Column(
        String(50),
        nullable=False,
        default=ConversationStatus.WAITING.value,
        index=True
    )
    priority = Column(
        String(20),
        nullable=False,
        default=ConversationPriority.MEDIUM.value
    )
    
    # Cliente
    customer_name = Column(String(255), nullable=True)
    customer_email = Column(String(255), nullable=True, index=True)
    customer_phone = Column(String(50), nullable=True, index=True)
    customer_metadata = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Dados extras do cliente"
    )
    
    # Timing (cada segundo importa)
    started_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )
    first_response_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Primeira resposta do agente"
    )
    last_message_at = Column(
        DateTime(timezone=True),
        nullable=True
    )
    ended_at = Column(
        DateTime(timezone=True),
        nullable=True
    )
    human_takeover_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Quando humano assumiu"
    )
    
    # Métricas
    duration_seconds = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Duração total em segundos"
    )
    messages_count = Column(
        Integer,
        nullable=False,
        default=0
    )
    user_messages_count = Column(
        Integer,
        nullable=False,
        default=0
    )
    agent_messages_count = Column(
        Integer,
        nullable=False,
        default=0
    )
    
    # Análise
    sentiment_score = Column(
        String(20),
        nullable=True,
        comment="Sentimento geral"
    )
    sentiment_history = Column(
        JSONB,
        nullable=False,
        default=list,
        comment="Evolução do sentimento"
    )
    language = Column(
        String(10),
        nullable=False,
        default="pt-BR"
    )
    
    # Resultado
    outcome = Column(
        String(50),
        nullable=True,
        comment="Resultado final"
    )
    outcome_metadata = Column(
        JSONB,
        nullable=True,
        comment="Detalhes do resultado (valor da venda, etc)"
    )
    
    # Tags e Contexto
    tags = Column(
        ARRAY(String),
        nullable=False,
        default=list
    )
    context = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Contexto completo da conversa"
    )
    
    # Rating
    customer_rating = Column(
        Integer,
        nullable=True,
        comment="Avaliação do cliente (1-5)"
    )
    customer_feedback = Column(
        Text,
        nullable=True
    )
    
    # Metadata
    metadata_json = Column(
        JSONB,
        nullable=False,
        default=dict
    )
    
    # Relationships
    organization = relationship("Organization", back_populates="conversations")
    agent = relationship("Agent", back_populates="conversations")
    assigned_user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Conversation {self.id} ({self.status})>"
    
    @property
    def is_active(self) -> bool:
        """Conversa ainda ativa?"""
        return self.status in [
            ConversationStatus.WAITING.value,
            ConversationStatus.ACTIVE.value,
            ConversationStatus.HUMAN_TAKEOVER.value
        ]
    
    @property
    def response_time_seconds(self) -> Optional[int]:
        """Tempo até primeira resposta"""
        if self.started_at and self.first_response_at:
            return (self.first_response_at - self.started_at).total_seconds()
        return None
    
    @property
    def conversion_value(self) -> float:
        """Valor da conversão (se houver)"""
        if self.outcome == ConversationOutcome.CONVERTED.value:
            return self.outcome_metadata.get("value", 0.0) if self.outcome_metadata else 0.0
        return 0.0


class Message(Base, TimestampMixin):
    """
    Mensagem individual - cada palavra conta.
    
    Não guarda só texto. Guarda intenção, contexto, timing.
    """
    
    __tablename__ = "messages"
    __table_args__ = (
        Index("idx_message_conversation", "conversation_id"),
        Index("idx_message_created", "created_at"),
        Index("idx_message_role", "role"),
    )
    
    # IDs
    id = Column(
        PostgresUUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()"
    )
    conversation_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Conteúdo
    role = Column(
        String(20),
        nullable=False,
        comment="Quem enviou"
    )
    content = Column(
        Text,
        nullable=False,
        comment="Conteúdo da mensagem"
    )
    content_type = Column(
        String(50),
        nullable=False,
        default="text",
        comment="text, image, audio, video, document"
    )
    
    # Metadata da mensagem
    metadata = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Dados extras (mídia, localização, etc)"
    )
    
    # Análise
    intent = Column(
        String(100),
        nullable=True,
        comment="Intenção detectada"
    )
    entities = Column(
        JSONB,
        nullable=True,
        comment="Entidades extraídas"
    )
    sentiment = Column(
        String(20),
        nullable=True,
        comment="Sentimento da mensagem"
    )
    confidence_score = Column(
        Float,
        nullable=True,
        comment="Confiança da análise (0-1)"
    )
    
    # Tracking
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Erro handling
    error = Column(
        JSONB,
        nullable=True,
        comment="Erro se falhou envio"
    )
    retry_count = Column(
        Integer,
        nullable=False,
        default=0
    )
    
    # Relationship
    conversation = relationship("Conversation", back_populates="messages")
    
    def __repr__(self):
        return f"<Message {self.id} ({self.role})>"


# =============================================================================
# PYDANTIC SCHEMAS - VALIDAÇÃO QUE PREVINE BUGS IDIOTAS
# =============================================================================

class MessageBase(BaseSchema):
    """Base para mensagem"""
    content: str = Field(
        ...,
        min_length=1,
        max_length=4096,
        description="Conteúdo da mensagem"
    )
    content_type: str = Field(
        default="text",
        description="Tipo do conteúdo"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Metadata adicional"
    )


class MessageCreate(MessageBase):
    """Criar mensagem"""
    role: MessageRole = Field(
        default=MessageRole.USER,
        description="Quem enviou"
    )


class MessageResponse(MessageBase, TimestampSchema):
    """Resposta de mensagem"""
    id: UUID
    conversation_id: UUID
    role: str
    intent: Optional[str]
    sentiment: Optional[str]
    delivered_at: Optional[datetime]
    read_at: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)


class ConversationBase(BaseSchema):
    """Base para conversa"""
    channel: ConversationChannel
    customer_name: Optional[str] = Field(None, max_length=255)
    customer_email: Optional[str] = Field(None, regex=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    customer_phone: Optional[str] = Field(None, regex=r"^\+?[1-9]\d{1,14}$")
    priority: ConversationPriority = Field(default=ConversationPriority.MEDIUM)
    tags: List[str] = Field(default_factory=list)


class ConversationCreate(ConversationBase):
    """Criar conversa"""
    agent_id: UUID
    external_id: Optional[str] = None
    customer_metadata: Dict[str, Any] = Field(default_factory=dict)
    context: Dict[str, Any] = Field(default_factory=dict)
    language: str = Field(default="pt-BR")


class ConversationUpdate(BaseSchema):
    """Atualizar conversa"""
    status: Optional[ConversationStatus] = None
    priority: Optional[ConversationPriority] = None
    assigned_user_id: Optional[UUID] = None
    tags: Optional[List[str]] = None
    outcome: Optional[ConversationOutcome] = None
    outcome_metadata: Optional[Dict[str, Any]] = None
    customer_rating: Optional[int] = Field(None, ge=1, le=5)
    customer_feedback: Optional[str] = None


class ConversationResponse(ConversationBase, TimestampSchema):
    """Resposta de conversa"""
    id: UUID
    organization_id: UUID
    agent_id: Optional[UUID]
    session_id: str
    status: str
    
    # Timing
    started_at: datetime
    last_message_at: Optional[datetime]
    
    # Metrics
    messages_count: int
    duration_seconds: int
    
    # Analysis
    sentiment_score: Optional[str]
    outcome: Optional[str]
    
    # Computed
    is_active: bool
    response_time_seconds: Optional[int]
    conversion_value: float
    
    model_config = ConfigDict(from_attributes=True)


class ConversationDetail(ConversationResponse):
    """Detalhes completos da conversa"""
    external_id: Optional[str]
    assigned_user_id: Optional[UUID]
    
    # Customer
    customer_metadata: Dict[str, Any]
    
    # Timing details
    first_response_at: Optional[datetime]
    ended_at: Optional[datetime]
    human_takeover_at: Optional[datetime]
    
    # Metrics details
    user_messages_count: int
    agent_messages_count: int
    
    # Analysis details
    sentiment_history: List[Dict[str, Any]]
    language: str
    outcome_metadata: Optional[Dict[str, Any]]
    
    # Context
    context: Dict[str, Any]
    metadata_json: Dict[str, Any]
    
    # Rating
    customer_rating: Optional[int]
    customer_feedback: Optional[str]
    
    # Messages
    messages: List[MessageResponse] = Field(default_factory=list)


class ConversationStats(BaseSchema):
    """Stats de conversas"""
    total: int
    by_status: Dict[str, int]
    by_channel: Dict[str, int]
    by_outcome: Dict[str, int]
    
    # Performance
    avg_duration_seconds: float
    avg_messages_per_conversation: float
    avg_response_time_seconds: float
    
    # Quality
    avg_satisfaction_score: float
    positive_sentiment_rate: float
    
    # Business
    conversion_rate: float
    total_conversion_value: float
    avg_conversion_value: float


class ConversationFilter(BaseSchema):
    """Filtros para buscar conversas"""
    status: Optional[List[ConversationStatus]] = None
    channel: Optional[List[ConversationChannel]] = None
    priority: Optional[List[ConversationPriority]] = None
    outcome: Optional[List[ConversationOutcome]] = None
    
    # Date filters
    started_after: Optional[datetime] = None
    started_before: Optional[datetime] = None
    ended_after: Optional[datetime] = None
    ended_before: Optional[datetime] = None
    
    # Customer filters
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    
    # Other filters
    agent_id: Optional[UUID] = None
    assigned_user_id: Optional[UUID] = None
    has_human_takeover: Optional[bool] = None
    has_rating: Optional[bool] = None
    min_rating: Optional[int] = Field(None, ge=1, le=5)
    
    # Sentiment
    sentiment_score: Optional[List[SentimentScore]] = None
    
    # Tags
    tags: Optional[List[str]] = None
    
    # Search
    search: Optional[str] = Field(
        None,
        description="Busca em conteúdo, nome, email, etc"
    )


# =============================================================================
# CONVERSATION ANALYTICS - MÉTRICAS QUE FAZEM DIFERENÇA
# =============================================================================

class ConversationAnalytics(BaseSchema):
    """Analytics que mostram onde tá o dinheiro"""
    
    # Volume
    total_conversations: int
    conversations_by_hour: Dict[int, int]
    conversations_by_day: Dict[str, int]
    peak_hour: int
    peak_day: str
    
    # Channels
    channel_distribution: Dict[str, float]
    channel_conversion_rates: Dict[str, float]
    best_channel: str
    
    # Performance
    avg_response_time: timedelta
    avg_resolution_time: timedelta
    first_contact_resolution_rate: float
    
    # Quality
    avg_messages_to_resolution: float
    escalation_rate: float
    abandonment_rate: float
    
    # Sentiment
    sentiment_distribution: Dict[str, float]
    sentiment_trend: List[Dict[str, Any]]
    
    # Business Impact
    total_conversions: int
    conversion_rate: float
    total_revenue: float
    avg_ticket_value: float
    
    # Agent Performance
    agent_rankings: List[Dict[str, Any]]
    
    # Customer Satisfaction
    avg_rating: float
    nps_score: float
    csat_score: float


# =============================================================================
# EXPORTS - O QUE VOCÊ USA PARA GANHAR DINHEIRO
# =============================================================================

__all__ = [
    # Enums
    "ConversationStatus",
    "ConversationChannel",
    "MessageRole",
    "ConversationPriority",
    "SentimentScore",
    "ConversationOutcome",
    
    # SQLAlchemy
    "Conversation",
    "Message",
    
    # Message Schemas
    "MessageBase",
    "MessageCreate",
    "MessageResponse",
    
    # Conversation Schemas
    "ConversationBase",
    "ConversationCreate",
    "ConversationUpdate",
    "ConversationResponse",
    "ConversationDetail",
    "ConversationStats",
    "ConversationFilter",
    "ConversationAnalytics"
]