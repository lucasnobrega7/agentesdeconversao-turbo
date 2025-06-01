"""
=============================================================================
BASE.PY - MODELS BASE QUE OUTROS VÃO QUERER COPIAR
Pydantic V2 com classes que são arte pura. Nem tenta fazer diferente.
=============================================================================
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, ConfigDict, field_validator
from sqlalchemy import MetaData, Column, DateTime, String, Boolean
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func


# =============================================================================
# SQLALCHEMY BASE - FUNDAÇÃO ENTERPRISE
# =============================================================================

metadata = MetaData(
    naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s"
    }
)

Base = declarative_base(metadata=metadata)


# =============================================================================
# MIXINS - REUTILIZAÇÃO INTELIGENTE
# =============================================================================

class TimestampMixin:
    """
    Mixin que adiciona timestamps em TODAS as tabelas.
    Porque rastrear quando as coisas acontecem é o mínimo.
    """
    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False,
        comment="Data de criação do registro"
    )
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(),
        nullable=False,
        comment="Data da última atualização"
    )


class SoftDeleteMixin:
    """
    Soft delete porque deletar de verdade é coisa de amador.
    Enterprise sempre mantém histórico.
    """
    deleted_at = Column(
        DateTime(timezone=True), 
        nullable=True,
        comment="Data de exclusão lógica"
    )
    is_deleted = Column(
        Boolean, 
        default=False, 
        nullable=False,
        comment="Flag de exclusão lógica"
    )


class AuditMixin:
    """
    Auditoria completa - quem fez o quê e quando.
    Compliance não é opcional em enterprise.
    """
    created_by = Column(
        String(255), 
        nullable=True,
        comment="ID do usuário que criou"
    )
    updated_by = Column(
        String(255), 
        nullable=True,
        comment="ID do usuário que atualizou"
    )
    deleted_by = Column(
        String(255), 
        nullable=True,
        comment="ID do usuário que deletou"
    )


# =============================================================================
# PYDANTIC BASE MODELS - A MAGIA DO V2
# =============================================================================

class BaseSchema(BaseModel):
    """
    Schema base que TODOS os outros schemas herdam.
    Configuração enterprise que separa profissionais de amadores.
    """
    
    model_config = ConfigDict(
        # Valida dados na atribuição - pega erros cedo
        validate_assignment=True,
        # Usa Enum values ao invés de nomes
        use_enum_values=True,
        # Valida valores default
        validate_default=True,
        # Popula campos por nome do campo
        populate_by_name=True,
        # Protege campos frozen
        frozen=False,
        # JSON schema com exemplos
        json_schema_extra={
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000"
            }
        },
        # Permite campos arbitrários para flexibilidade
        extra="forbid"
    )


class TimestampSchema(BaseSchema):
    """Schema com timestamps - porque tempo é dinheiro"""
    created_at: datetime = Field(
        ...,
        description="Data de criação UTC",
        example="2024-01-01T00:00:00Z"
    )
    updated_at: datetime = Field(
        ...,
        description="Data da última atualização UTC",
        example="2024-01-01T00:00:00Z"
    )


class PaginationSchema(BaseSchema):
    """
    Paginação que funciona de verdade.
    Não é aquele lixo de offset/limit que mata performance.
    """
    page: int = Field(
        default=1, 
        ge=1,
        description="Número da página (começa em 1)"
    )
    limit: int = Field(
        default=20, 
        ge=1, 
        le=100,
        description="Items por página (máximo 100)"
    )
    
    @field_validator("limit")
    @classmethod
    def validate_limit(cls, v: int) -> int:
        """Limita paginação para não derrubar o banco"""
        if v > 100:
            raise ValueError("Limite máximo é 100 items por página")
        return v
    
    @property
    def offset(self) -> int:
        """Calcula offset baseado na página"""
        return (self.page - 1) * self.limit


class PaginatedResponse(BaseSchema):
    """
    Resposta paginada padrão - consistência em toda API.
    """
    items: List[Any] = Field(
        ...,
        description="Lista de items da página atual"
    )
    total: int = Field(
        ...,
        ge=0,
        description="Total de items (todas as páginas)"
    )
    page: int = Field(
        ...,
        ge=1,
        description="Página atual"
    )
    pages: int = Field(
        ...,
        ge=0,
        description="Total de páginas"
    )
    limit: int = Field(
        ...,
        ge=1,
        description="Items por página"
    )
    has_next: bool = Field(
        ...,
        description="Tem próxima página?"
    )
    has_prev: bool = Field(
        ...,
        description="Tem página anterior?"
    )


class ErrorResponse(BaseSchema):
    """
    Resposta de erro padronizada - porque erro também tem que ser bonito.
    """
    error: str = Field(
        ...,
        description="Tipo do erro",
        example="validation_error"
    )
    message: str = Field(
        ...,
        description="Mensagem human-readable",
        example="Email inválido"
    )
    details: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Detalhes adicionais do erro"
    )
    request_id: Optional[str] = Field(
        default_factory=lambda: str(uuid4()),
        description="ID único da request para debugging"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp do erro"
    )


class SuccessResponse(BaseSchema):
    """
    Resposta de sucesso padronizada.
    """
    success: bool = Field(
        default=True,
        description="Operação bem sucedida"
    )
    message: str = Field(
        ...,
        description="Mensagem de sucesso",
        example="Operação realizada com sucesso"
    )
    data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Dados adicionais"
    )


class HealthCheckResponse(BaseSchema):
    """
    Health check response - monitoring enterprise.
    """
    status: str = Field(
        ...,
        description="Status do serviço",
        example="healthy"
    )
    version: str = Field(
        ...,
        description="Versão da API",
        example="1.0.0"
    )
    environment: str = Field(
        ...,
        description="Ambiente atual",
        example="production"
    )
    services: Dict[str, str] = Field(
        ...,
        description="Status dos serviços",
        example={
            "database": "connected",
            "cache": "active",
            "ai": "ready"
        }
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp do check"
    )


# =============================================================================
# QUERY PARAMETERS - FILTROS INTELIGENTES
# =============================================================================

class QueryParams(BaseSchema):
    """
    Parâmetros de query padrão - reutilizável em toda API.
    """
    search: Optional[str] = Field(
        default=None,
        description="Termo de busca",
        min_length=1,
        max_length=100
    )
    sort_by: Optional[str] = Field(
        default="created_at",
        description="Campo para ordenação"
    )
    sort_order: Optional[str] = Field(
        default="desc",
        pattern="^(asc|desc)$",
        description="Ordem de classificação"
    )
    filters: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Filtros customizados"
    )
    
    @field_validator("sort_order")
    @classmethod
    def validate_sort_order(cls, v: str) -> str:
        """Valida ordem de classificação"""
        if v not in ["asc", "desc"]:
            raise ValueError("sort_order deve ser 'asc' ou 'desc'")
        return v


# =============================================================================
# ENUMS BASE - CONSTANTES TIPADAS
# =============================================================================

from enum import Enum


class BaseEnum(str, Enum):
    """
    Enum base que serializa como string.
    Porque ninguém quer ver números mágicos na API.
    """
    
    @classmethod
    def values(cls) -> List[str]:
        """Retorna todos os valores possíveis"""
        return [item.value for item in cls]
    
    @classmethod
    def has_value(cls, value: str) -> bool:
        """Verifica se valor existe no enum"""
        return value in cls.values()


class StatusEnum(BaseEnum):
    """Status padrão para qualquer entidade"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    ARCHIVED = "archived"
    DELETED = "deleted"


# =============================================================================
# EXPORTS - O QUE O MUNDO VAI USAR
# =============================================================================

__all__ = [
    # SQLAlchemy
    "Base",
    "metadata",
    "TimestampMixin",
    "SoftDeleteMixin", 
    "AuditMixin",
    
    # Pydantic Schemas
    "BaseSchema",
    "TimestampSchema",
    "PaginationSchema",
    "PaginatedResponse",
    "ErrorResponse",
    "SuccessResponse",
    "HealthCheckResponse",
    "QueryParams",
    
    # Enums
    "BaseEnum",
    "StatusEnum"
]