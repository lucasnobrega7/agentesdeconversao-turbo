# Última parte do conversation.py que foi cortada

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