from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
import re

from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import relationship

from app.models.base import (
    Base, BaseSchema, TimestampSchema, TimestampMixin, 
    SoftDeleteMixin, AuditMixin, BaseEnum, StatusEnum
)

# Rest of the file stays the same...
# (copying the exact content but fixing the import)

# =============================================================================
# ENUMS - CONSTANTES QUE FAZEM SENTIDO
# =============================================================================

class UserRole(BaseEnum):
    """Roles de usuário - hierarquia clara"""
    SUPER_ADMIN = "super_admin"  # Deus do sistema
    ADMIN = "admin"              # Admin da organização
    MANAGER = "manager"          # Gerente com poderes
    OPERATOR = "operator"        # Operador normal
    VIEWER = "viewer"            # Só visualiza
    
    @property
    def hierarchy_level(self) -> int:
        """Nível hierárquico para comparações"""
        levels = {
            self.SUPER_ADMIN: 100,
            self.ADMIN: 80,
            self.MANAGER: 60,
            self.OPERATOR: 40,
            self.VIEWER: 20
        }
        return levels.get(self, 0)


class UserStatus(BaseEnum):
    """Status do usuário"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"
    DELETED = "deleted"


# =============================================================================
# SQLALCHEMY MODEL - A TABELA DE VERDADE
# =============================================================================

class User(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    """
    Modelo de usuário enterprise.
    Multi-tenant, com roles, audit completo.
    """
    
    __tablename__ = "users"
    
    # Primary Key
    id = Column(
        PostgresUUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()",
        comment="UUID único do usuário"
    )
    
    # Organization - Multi-tenancy
    organization_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
        comment="Organização do usuário"
    )
    
    # Basic Info
    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="Email único do usuário"
    )
    username = Column(
        String(50),
        unique=True,
        nullable=True,
        index=True,
        comment="Username único (opcional)"
    )
    full_name = Column(
        String(255),
        nullable=False,
        comment="Nome completo"
    )
    display_name = Column(
        String(100),
        nullable=True,
        comment="Nome de exibição"
    )
    
    # Auth
    password_hash = Column(
        String(255),
        nullable=False,
        comment="Hash da senha (bcrypt)"
    )
    is_email_verified = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Email verificado?"
    )
    email_verified_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Data de verificação do email"
    )
    
    # Profile
    avatar_url = Column(
        Text,
        nullable=True,
        comment="URL do avatar"
    )
    bio = Column(
        Text,
        nullable=True,
        comment="Biografia do usuário"
    )
    phone = Column(
        String(20),
        nullable=True,
        comment="Telefone com código do país"
    )
    
    # Roles & Permissions
    role = Column(
        String(50),
        nullable=False,
        default=UserRole.VIEWER.value,
        comment="Role principal do usuário"
    )
    permissions = Column(
        JSON,
        nullable=True,
        default=dict,
        comment="Permissões customizadas"
    )
    
    # Status
    status = Column(
        String(50),
        nullable=False,
        default=UserStatus.PENDING_VERIFICATION.value,
        comment="Status atual do usuário"
    )
    
    # Security
    last_login_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Último login"
    )
    last_login_ip = Column(
        String(45),
        nullable=True,
        comment="IP do último login"
    )
    failed_login_attempts = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Tentativas de login falhadas"
    )
    locked_until = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Bloqueado até (rate limit)"
    )
    
    # Preferences
    preferences = Column(
        JSON,
        nullable=True,
        default=dict,
        comment="Preferências do usuário"
    )
    timezone = Column(
        String(50),
        nullable=True,
        default="America/Sao_Paulo",
        comment="Timezone do usuário"
    )
    language = Column(
        String(10),
        nullable=True,
        default="pt-BR",
        comment="Idioma preferido"
    )
    
    # Metadata
    metadata_json = Column(
        JSON,
        nullable=True,
        default=dict,
        comment="Metadados extras"
    )
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    agents = relationship("Agent", back_populates="owner")
    conversations = relationship("Conversation", back_populates="assigned_user")
    api_keys = relationship("ApiKey", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.email}>"
    
    @property
    def is_admin(self) -> bool:
        """Verifica se é admin"""
        return self.role in [UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value]
    
    @property
    def can_manage_users(self) -> bool:
        """Pode gerenciar outros usuários"""
        return UserRole(self.role).hierarchy_level >= UserRole.MANAGER.hierarchy_level


# =============================================================================
# PYDANTIC SCHEMAS - VALIDAÇÃO QUE FUNCIONA
# =============================================================================

class UserBase(BaseSchema):
    """Base schema para usuário"""
    email: EmailStr = Field(
        ...,
        description="Email do usuário",
        example="user@example.com"
    )
    username: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=50,
        pattern="^[a-zA-Z0-9_-]+$",
        description="Username único",
        example="john_doe"
    )
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Nome completo",
        example="John Doe"
    )
    display_name: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Nome de exibição",
        example="John"
    )
    phone: Optional[str] = Field(
        default=None,
        pattern=r"^\+?[1-9]\d{1,14}$",
        description="Telefone E.164",
        example="+5511999999999"
    )
    
    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Valida e normaliza email"""
        return v.lower().strip()
    
    @field_validator("username")
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        """Valida username"""
        if v:
            if len(v) < 3:
                raise ValueError("Username deve ter pelo menos 3 caracteres")
            if not re.match(r"^[a-zA-Z0-9_-]+$", v):
                raise ValueError("Username pode conter apenas letras, números, _ e -")
        return v


class UserCreate(UserBase):
    """Schema para criar usuário"""
    password: str = Field(
        ...,
        min_length=8,
        description="Senha forte",
        example="SuperSecret123!"
    )
    confirm_password: str = Field(
        ...,
        description="Confirmação da senha"
    )
    organization_id: Optional[UUID] = Field(
        default=None,
        description="ID da organização"
    )
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Valida força da senha"""
        if len(v) < 8:
            raise ValueError("Senha deve ter pelo menos 8 caracteres")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Senha deve ter pelo menos uma letra maiúscula")
        if not re.search(r"[a-z]", v):
            raise ValueError("Senha deve ter pelo menos uma letra minúscula")
        if not re.search(r"\d", v):
            raise ValueError("Senha deve ter pelo menos um número")
        return v
    
    @model_validator(mode="after")
    def validate_passwords_match(self) -> "UserCreate":
        """Valida se senhas conferem"""
        if self.password != self.confirm_password:
            raise ValueError("Senhas não conferem")
        return self


class UserUpdate(BaseSchema):
    """Schema para atualizar usuário"""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    display_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None


class UserResponse(UserBase, TimestampSchema):
    """Schema de resposta do usuário"""
    id: UUID
    organization_id: Optional[UUID]
    role: str
    status: str
    is_email_verified: bool
    avatar_url: Optional[str]
    bio: Optional[str]
    last_login_at: Optional[datetime]
    timezone: str
    language: str
    
    class Config:
        from_attributes = True


class UserDetail(UserResponse):
    """Schema detalhado do usuário"""
    permissions: Dict[str, Any]
    preferences: Dict[str, Any]
    metadata_json: Dict[str, Any]
    email_verified_at: Optional[datetime]
    failed_login_attempts: int
    
    # Computed fields
    is_admin: bool
    can_manage_users: bool


class UserLogin(BaseSchema):
    """Schema para login"""
    email: EmailStr = Field(
        ...,
        description="Email do usuário"
    )
    password: str = Field(
        ...,
        description="Senha"
    )
    remember_me: bool = Field(
        default=False,
        description="Manter conectado"
    )


class UserChangePassword(BaseSchema):
    """Schema para trocar senha"""
    current_password: str = Field(
        ...,
        description="Senha atual"
    )
    new_password: str = Field(
        ...,
        min_length=8,
        description="Nova senha"
    )
    confirm_password: str = Field(
        ...,
        description="Confirmação da nova senha"
    )
    
    @model_validator(mode="after")
    def validate_passwords(self) -> "UserChangePassword":
        """Valida senhas"""
        if self.new_password != self.confirm_password:
            raise ValueError("Senhas não conferem")
        if self.current_password == self.new_password:
            raise ValueError("Nova senha deve ser diferente da atual")
        return self


# =============================================================================
# EXPORTS - O QUE IMPORTA
# =============================================================================

__all__ = [
    # Enums
    "UserRole",
    "UserStatus",
    
    # SQLAlchemy
    "User",
    
    # Schemas
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserDetail",
    "UserLogin",
    "UserChangePassword"
]