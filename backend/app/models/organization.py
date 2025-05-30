"""
=============================================================================
ORGANIZATION.PY - MULTI-TENANCY QUE SEPARA SaaS DE BRINCADEIRA
Se você não sabe o que é multi-tenancy, volta pro YouTube assistir tutorial
=============================================================================
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
import re

from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from sqlalchemy import (
    Column, String, Boolean, DateTime, Text, JSON, Integer,
    ForeignKey, UniqueConstraint, Index, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID, JSONB
from sqlalchemy.orm import relationship

from app.models.base import (
    Base, BaseSchema, TimestampSchema, TimestampMixin,
    SoftDeleteMixin, AuditMixin, BaseEnum, StatusEnum
)


# =============================================================================
# ENUMS - CONSTANTES QUE DEFINEM O JOGO
# =============================================================================

class OrganizationPlan(BaseEnum):
    """
    Planos de assinatura - do básico ao enterprise.
    
    Não é sobre preço, é sobre valor entregue.
    """
    STARTER = "starter"          # R$297/mês - Começa aqui
    GROWTH = "growth"            # R$797/mês - Crescendo
    SCALE = "scale"              # R$1997/mês - Escalando
    ENTERPRISE = "enterprise"    # Custom - Sky is the limit
    
    @property
    def limits(self) -> Dict[str, int]:
        """Limites por plano - generosos mas sensatos"""
        plan_limits = {
            self.STARTER: {
                "max_users": 3,
                "max_agents": 5,
                "max_conversations_month": 1000,
                "max_knowledge_mb": 100,
                "max_integrations": 2
            },
            self.GROWTH: {
                "max_users": 10,
                "max_agents": 20,
                "max_conversations_month": 10000,
                "max_knowledge_mb": 1000,
                "max_integrations": 5
            },
            self.SCALE: {
                "max_users": 50,
                "max_agents": 100,
                "max_conversations_month": 100000,
                "max_knowledge_mb": 10000,
                "max_integrations": -1  # Unlimited
            },
            self.ENTERPRISE: {
                "max_users": -1,      # Unlimited
                "max_agents": -1,     # Unlimited
                "max_conversations_month": -1,  # Unlimited
                "max_knowledge_mb": -1,         # Unlimited
                "max_integrations": -1          # Unlimited
            }
        }
        return plan_limits.get(self, {})
    
    @property
    def price_monthly(self) -> int:
        """Preço mensal em centavos (evita float)"""
        prices = {
            self.STARTER: 29700,      # R$297,00
            self.GROWTH: 79700,       # R$797,00
            self.SCALE: 199700,       # R$1.997,00
            self.ENTERPRISE: -1       # Custom pricing
        }
        return prices.get(self, 0)


class OrganizationStatus(BaseEnum):
    """Status da organização - lifecycle completo"""
    TRIAL = "trial"                      # 14 dias grátis
    ACTIVE = "active"                    # Pagando e feliz
    PAST_DUE = "past_due"               # Atrasado mas recuperável
    SUSPENDED = "suspended"              # Suspensa por falta de pagamento
    CANCELLED = "cancelled"              # Cancelou mas dados preservados
    CHURNED = "churned"                 # Perdemos o cliente
    ENTERPRISE_NEGOTIATION = "enterprise_negotiation"  # Negociando enterprise


class BillingPeriod(BaseEnum):
    """Período de cobrança - mensal ganha mais"""
    MONTHLY = "monthly"          # Paga todo mês
    QUARTERLY = "quarterly"      # 5% desconto
    YEARLY = "yearly"           # 20% desconto


# =============================================================================
# SQLALCHEMY MODEL - TABELA QUE AGUENTA PANCADA
# =============================================================================

class Organization(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    """
    Modelo de organização - o coração do multi-tenancy.
    
    Cada cliente é uma organização. Isolamento total.
    Row Level Security (RLS) garante que ninguém vê dados dos outros.
    """
    
    __tablename__ = "organizations"
    __table_args__ = (
        UniqueConstraint("slug", name="uq_organization_slug"),
        UniqueConstraint("cnpj", name="uq_organization_cnpj"),
        Index("idx_organization_status", "status"),
        Index("idx_organization_plan", "plan"),
        CheckConstraint("credits_balance >= 0", name="ck_positive_credits"),
    )
    
    # Primary Key
    id = Column(
        PostgresUUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()",
        comment="UUID único da organização"
    )
    
    # Basic Info
    name = Column(
        String(255),
        nullable=False,
        comment="Nome da empresa/organização"
    )
    slug = Column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
        comment="Slug único para URLs (ex: acme-corp)"
    )
    description = Column(
        Text,
        nullable=True,
        comment="Descrição da organização"
    )
    logo_url = Column(
        Text,
        nullable=True,
        comment="URL do logo"
    )
    website = Column(
        String(255),
        nullable=True,
        comment="Website da empresa"
    )
    
    # Legal Info - Brasil
    cnpj = Column(
        String(18),
        nullable=True,
        unique=True,
        comment="CNPJ formatado (XX.XXX.XXX/XXXX-XX)"
    )
    legal_name = Column(
        String(255),
        nullable=True,
        comment="Razão social"
    )
    state_registration = Column(
        String(50),
        nullable=True,
        comment="Inscrição estadual"
    )
    
    # Contact Info
    email = Column(
        String(255),
        nullable=False,
        comment="Email principal de contato"
    )
    phone = Column(
        String(20),
        nullable=True,
        comment="Telefone principal"
    )
    
    # Address
    address_street = Column(String(255), nullable=True)
    address_number = Column(String(20), nullable=True)
    address_complement = Column(String(100), nullable=True)
    address_neighborhood = Column(String(100), nullable=True)
    address_city = Column(String(100), nullable=True)
    address_state = Column(String(2), nullable=True)
    address_zipcode = Column(String(10), nullable=True)
    address_country = Column(String(2), default="BR")
    
    # Billing & Subscription
    plan = Column(
        String(50),
        nullable=False,
        default=OrganizationPlan.STARTER.value,
        comment="Plano atual"
    )
    status = Column(
        String(50),
        nullable=False,
        default=OrganizationStatus.TRIAL.value,
        comment="Status da assinatura"
    )
    billing_period = Column(
        String(20),
        nullable=False,
        default=BillingPeriod.MONTHLY.value,
        comment="Período de cobrança"
    )
    
    # Trial
    trial_ends_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Fim do trial (14 dias)"
    )
    
    # Subscription dates
    subscription_starts_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Início da assinatura paga"
    )
    subscription_ends_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Fim do período atual"
    )
    subscription_cancelled_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Data de cancelamento"
    )
    
    # Usage & Limits
    credits_balance = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Créditos disponíveis (para cobranças extras)"
    )
    
    # Current usage (reset monthly)
    current_users_count = Column(Integer, default=0)
    current_agents_count = Column(Integer, default=0)
    current_conversations_month = Column(Integer, default=0)
    current_knowledge_mb = Column(Integer, default=0)
    current_integrations_count = Column(Integer, default=0)
    
    # Settings & Features
    settings = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Configurações customizadas"
    )
    enabled_features = Column(
        JSONB,
        nullable=False,
        default=list,
        comment="Features habilitadas"
    )
    
    # API Access
    api_enabled = Column(
        Boolean,
        nullable=False,
        default=True,
        comment="API habilitada?"
    )
    webhook_url = Column(
        Text,
        nullable=True,
        comment="URL para webhooks"
    )
    webhook_secret = Column(
        String(255),
        nullable=True,
        comment="Secret para validar webhooks"
    )
    
    # Metadata
    tags = Column(
        JSONB,
        nullable=False,
        default=list,
        comment="Tags para segmentação"
    )
    metadata_json = Column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Metadados customizados"
    )
    
    # Relationships - o que importa
    users = relationship("User", back_populates="organization")
    agents = relationship("Agent", back_populates="organization")
    conversations = relationship("Conversation", back_populates="organization")
    api_keys = relationship("ApiKey", back_populates="organization")
    invoices = relationship("Invoice", back_populates="organization")
    
    def __repr__(self):
        return f"<Organization {self.name} ({self.slug})>"
    
    @property
    def is_trial(self) -> bool:
        """Está em trial?"""
        return self.status == OrganizationStatus.TRIAL.value
    
    @property
    def is_active(self) -> bool:
        """Assinatura ativa?"""
        return self.status in [
            OrganizationStatus.TRIAL.value,
            OrganizationStatus.ACTIVE.value
        ]
    
    @property
    def can_add_user(self) -> bool:
        """Pode adicionar mais usuários?"""
        limit = OrganizationPlan(self.plan).limits.get("max_users", 0)
        return limit == -1 or self.current_users_count < limit
    
    @property
    def can_add_agent(self) -> bool:
        """Pode adicionar mais agentes?"""
        limit = OrganizationPlan(self.plan).limits.get("max_agents", 0)
        return limit == -1 or self.current_agents_count < limit
    
    @property
    def usage_percentage(self) -> Dict[str, float]:
        """Percentual de uso por recurso"""
        limits = OrganizationPlan(self.plan).limits
        
        def calc_pct(current: int, limit: int) -> float:
            if limit == -1:  # Unlimited
                return 0.0
            return (current / limit * 100) if limit > 0 else 100.0
        
        return {
            "users": calc_pct(self.current_users_count, limits.get("max_users", 0)),
            "agents": calc_pct(self.current_agents_count, limits.get("max_agents", 0)),
            "conversations": calc_pct(self.current_conversations_month, limits.get("max_conversations_month", 0)),
            "knowledge": calc_pct(self.current_knowledge_mb, limits.get("max_knowledge_mb", 0)),
            "integrations": calc_pct(self.current_integrations_count, limits.get("max_integrations", 0))
        }


# =============================================================================
# PYDANTIC SCHEMAS - VALIDAÇÃO NIVEL RECEITA FEDERAL
# =============================================================================

class OrganizationBase(BaseSchema):
    """Base schema para organização"""
    name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Nome da organização",
        example="Acme Corporation"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Descrição da organização"
    )
    website: Optional[str] = Field(
        default=None,
        pattern=r"^https?://",
        description="Website da empresa",
        example="https://acme.com"
    )
    email: str = Field(
        ...,
        pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$",
        description="Email de contato",
        example="contato@acme.com"
    )
    phone: Optional[str] = Field(
        default=None,
        pattern=r"^\+?[1-9]\d{1,14}$",
        description="Telefone (formato E.164)",
        example="+5511999999999"
    )
    
    @field_validator("website")
    @classmethod
    def validate_website(cls, v: Optional[str]) -> Optional[str]:
        """Valida URL do website"""
        if v and not v.startswith(("http://", "https://")):
            raise ValueError("Website deve começar com http:// ou https://")
        return v


class OrganizationLegalInfo(BaseSchema):
    """Informações legais - Brasil"""
    cnpj: Optional[str] = Field(
        default=None,
        pattern=r"^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$",
        description="CNPJ formatado",
        example="12.345.678/0001-90"
    )
    legal_name: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Razão social"
    )
    state_registration: Optional[str] = Field(
        default=None,
        max_length=50,
        description="Inscrição estadual"
    )
    
    @field_validator("cnpj")
    @classmethod
    def validate_cnpj(cls, v: Optional[str]) -> Optional[str]:
        """
        Valida CNPJ com dígitos verificadores.
        
        Não é brincadeira, CNPJ inválido = problemas com receita.
        """
        if not v:
            return v
        
        # Remove formatação
        cnpj = re.sub(r"\D", "", v)
        
        if len(cnpj) != 14:
            raise ValueError("CNPJ deve ter 14 dígitos")
        
        # Algoritmo de validação do CNPJ
        # Se você não entende isso, nem tenta mexer
        def calc_digit(cnpj_base: str, weights: List[int]) -> str:
            total = sum(int(cnpj_base[i]) * weights[i] for i in range(len(weights)))
            remainder = total % 11
            return "0" if remainder < 2 else str(11 - remainder)
        
        # Primeiro dígito
        weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        digit1 = calc_digit(cnpj[:12], weights1)
        
        # Segundo dígito
        weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        digit2 = calc_digit(cnpj[:12] + digit1, weights2)
        
        # Verifica
        if cnpj[-2:] != digit1 + digit2:
            raise ValueError("CNPJ inválido")
        
        # Retorna formatado
        return f"{cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:]}"


class OrganizationAddress(BaseSchema):
    """Endereço completo - padrão brasileiro"""
    address_street: Optional[str] = Field(None, max_length=255)
    address_number: Optional[str] = Field(None, max_length=20)
    address_complement: Optional[str] = Field(None, max_length=100)
    address_neighborhood: Optional[str] = Field(None, max_length=100)
    address_city: Optional[str] = Field(None, max_length=100)
    address_state: Optional[str] = Field(
        None,
        pattern="^[A-Z]{2}$",
        description="Sigla do estado"
    )
    address_zipcode: Optional[str] = Field(
        None,
        pattern=r"^\d{5}-\d{3}$",
        description="CEP formatado",
        example="01310-100"
    )
    address_country: str = Field(
        default="BR",
        pattern="^[A-Z]{2}$",
        description="Código do país (ISO 3166-1 alpha-2)"
    )


class OrganizationCreate(
    OrganizationBase,
    OrganizationLegalInfo,
    OrganizationAddress
):
    """Schema para criar organização"""
    plan: Optional[OrganizationPlan] = Field(
        default=OrganizationPlan.STARTER,
        description="Plano inicial"
    )
    
    @model_validator(mode="after")
    def generate_slug(self) -> "OrganizationCreate":
        """Gera slug automaticamente se não fornecido"""
        if not hasattr(self, "slug") or not self.slug:
            # Gera slug do nome
            slug = re.sub(r"[^\w\s-]", "", self.name.lower())
            slug = re.sub(r"[-\s]+", "-", slug)
            slug = slug.strip("-")[:50]
            
            # Adiciona timestamp para unicidade
            slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
            
            self.slug = slug
        
        return self


class OrganizationUpdate(BaseSchema):
    """Schema para atualizar organização"""
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    
    # Legal
    cnpj: Optional[str] = None
    legal_name: Optional[str] = None
    state_registration: Optional[str] = None
    
    # Address
    address_street: Optional[str] = None
    address_number: Optional[str] = None
    address_complement: Optional[str] = None
    address_neighborhood: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_zipcode: Optional[str] = None
    
    # Settings
    settings: Optional[Dict[str, Any]] = None
    webhook_url: Optional[str] = None


class OrganizationResponse(OrganizationBase, TimestampSchema):
    """Schema de resposta da organização"""
    id: UUID
    slug: str
    logo_url: Optional[str]
    
    # Plan & Status
    plan: str
    status: str
    billing_period: str
    
    # Usage
    current_users_count: int
    current_agents_count: int
    current_conversations_month: int
    
    # Computed
    is_trial: bool
    is_active: bool
    can_add_user: bool
    can_add_agent: bool
    
    model_config = ConfigDict(from_attributes=True)


class OrganizationDetail(OrganizationResponse, OrganizationLegalInfo, OrganizationAddress):
    """Schema detalhado da organização"""
    # Dates
    trial_ends_at: Optional[datetime]
    subscription_starts_at: Optional[datetime]
    subscription_ends_at: Optional[datetime]
    subscription_cancelled_at: Optional[datetime]
    
    # Usage details
    credits_balance: int
    current_knowledge_mb: int
    current_integrations_count: int
    usage_percentage: Dict[str, float]
    
    # Settings
    settings: Dict[str, Any]
    enabled_features: List[str]
    api_enabled: bool
    webhook_url: Optional[str]
    
    # Metadata
    tags: List[str]
    metadata_json: Dict[str, Any]


class OrganizationStats(BaseSchema):
    """Estatísticas da organização"""
    organization_id: UUID
    period: str = Field(description="day|week|month|all")
    
    # Users
    total_users: int
    active_users: int
    
    # Agents
    total_agents: int
    active_agents: int
    
    # Conversations
    total_conversations: int
    avg_conversations_per_day: float
    peak_conversations_day: Optional[datetime]
    
    # Usage
    total_messages: int
    total_knowledge_mb: int
    api_calls_count: int
    
    # Business metrics
    conversion_rate: float
    avg_satisfaction_score: float
    total_revenue_generated: Optional[float]
    
    # Trends
    growth_rate: float
    churn_risk_score: float


class OrganizationBilling(BaseSchema):
    """Informações de billing"""
    organization_id: UUID
    
    # Current plan
    plan: str
    billing_period: str
    price_monthly: int
    price_with_discount: int
    
    # Usage
    overage_charges: int
    credits_used: int
    credits_remaining: int
    
    # Next billing
    next_billing_date: datetime
    next_billing_amount: int
    
    # History
    total_paid: int
    last_payment_date: Optional[datetime]
    last_payment_amount: Optional[int]
    
    # Status
    payment_status: str
    payment_method: Optional[str]


# =============================================================================
# EXPORTS - USE COM RESPONSABILIDADE E LUCRE MILHÕES
# =============================================================================

__all__ = [
    # Enums
    "OrganizationPlan",
    "OrganizationStatus",
    "BillingPeriod",
    
    # SQLAlchemy
    "Organization",
    
    # Schemas
    "OrganizationBase",
    "OrganizationLegalInfo",
    "OrganizationAddress",
    "OrganizationCreate",
    "OrganizationUpdate",
    "OrganizationResponse",
    "OrganizationDetail",
    "OrganizationStats",
    "OrganizationBilling"
]