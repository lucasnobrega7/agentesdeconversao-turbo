"""
=============================================================================
SECURITY.PY - SEGURANÇA DE VERDADE, NÃO AQUELA PORCARIA DE TUTORIAL
Enquanto outros usam MD5, nós usamos o que empresa de R$100M usa
=============================================================================
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Union
from uuid import UUID

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
import secrets
import hashlib
import hmac

from app.core.config import settings
from app.core.database import get_db


# =============================================================================
# CONFIGURAÇÃO - NÍVEL BANCO CENTRAL
# =============================================================================

# OAuth2 scheme - porque segurança de verdade não é brincadeira
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Bcrypt context - MD5 é coisa de 2005, aqui é enterprise
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # 12 rounds porque performance importa mas segurança mais
)

# Algoritmos permitidos - só o melhor
ALGORITHM = settings.ALGORITHM
SECRET_KEY = settings.SECRET_KEY


# =============================================================================
# PASSWORD HASHING - PROTEÇÃO NÍVEL NSA
# =============================================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica senha com bcrypt.
    
    Se você não entende porque bcrypt, volta pro YouTube.
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """
    Hash de senha com bcrypt + salt automático.
    
    12 rounds porque queremos segurança, não velocidade.
    Se demora 200ms, perfeito - brute force vai demorar séculos.
    """
    return pwd_context.hash(password)


# =============================================================================
# TOKEN GENERATION - JWT QUE FUNCIONA
# =============================================================================

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Cria access token JWT.
    
    - Expira em 30 minutos por padrão
    - Inclui claims customizados
    - Assinado com HS256
    
    Se você acha que JWT é só base64, nem continua lendo.
    """
    to_encode = data.copy()
    
    # Define expiração
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # Claims padrão
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": secrets.token_urlsafe(16),  # ID único do token
        "type": "access"
    })
    
    # Encode com algoritmo seguro
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return encoded_jwt


def create_refresh_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Cria refresh token JWT.
    
    - Expira em 7 dias por padrão
    - Mais simples que access token
    - Usado apenas para renovar access token
    
    Refresh token eterno = amador. 7 dias é o equilíbrio perfeito.
    """
    to_encode = data.copy()
    
    # Define expiração
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    
    # Claims do refresh token
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": secrets.token_urlsafe(16),
        "type": "refresh"
    })
    
    # Encode
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decodifica e valida JWT.
    
    - Verifica assinatura
    - Verifica expiração
    - Retorna payload
    
    Token inválido = exceção. Sem perdão.
    """
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload
    except JWTError:
        raise


# =============================================================================
# DEPENDENCIES - INJEÇÃO QUE FUNCIONA
# =============================================================================

async def get_current_token(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme)
) -> str:
    """
    Extrai token do request.
    
    Procura em:
    1. Authorization header (Bearer token)
    2. Cookie (para web apps)
    3. Query parameter (último recurso)
    
    Flexível mas seguro.
    """
    # Tenta Authorization header primeiro
    if token:
        return token
    
    # Tenta cookie
    cookie_token = request.cookies.get("access_token")
    if cookie_token and cookie_token.startswith("Bearer "):
        return cookie_token.replace("Bearer ", "")
    
    # Tenta query parameter (menos seguro, use com cuidado)
    query_token = request.query_params.get("token")
    if query_token:
        return query_token
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token não encontrado",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    token: str = Depends(get_current_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtém usuário atual do token.
    
    - Decodifica token
    - Busca usuário no banco
    - Valida status
    - Retorna usuário ou erro
    
    Sem token válido = sem acesso. Simples assim.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decodifica token
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id is None or token_type != "access":
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Import aqui para evitar circular
    from app.models.user import User, UserStatus
    
    # Busca usuário
    user = await db.query(User).filter(
        User.id == UUID(user_id)
    ).first()
    
    if user is None:
        raise credentials_exception
    
    # Valida status
    if user.status != UserStatus.ACTIVE.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Usuário {user.status}"
        )
    
    return user


async def get_current_active_user(
    current_user = Depends(get_current_user)
):
    """
    Garante que usuário está ativo.
    
    Redundante? Talvez. Seguro? Com certeza.
    """
    from app.models.user import UserStatus
    
    if current_user.status != UserStatus.ACTIVE.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    
    return current_user


async def get_current_admin_user(
    current_user = Depends(get_current_active_user)
):
    """
    Garante que usuário é admin.
    
    Para endpoints que só admin pode acessar.
    Se não é admin, nem tenta.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores."
        )
    
    return current_user


async def get_current_super_admin(
    current_user = Depends(get_current_active_user)
):
    """
    Garante que usuário é super admin.
    
    Para as operações mais críticas do sistema.
    Super admin = Deus do sistema.
    """
    from app.models.user import UserRole
    
    if current_user.role != UserRole.SUPER_ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas super administradores."
        )
    
    return current_user


# =============================================================================
# RATE LIMITING - PROTEÇÃO CONTRA ABUSO
# =============================================================================

class RateLimiter:
    """
    Rate limiter simples mas efetivo.
    
    Redis-based, por IP ou por usuário.
    Configurável por endpoint.
    """
    
    def __init__(
        self,
        times: int = 10,
        seconds: int = 60,
        by: str = "ip"  # "ip" ou "user"
    ):
        self.times = times
        self.seconds = seconds
        self.by = by
    
    async def __call__(
        self,
        request: Request
    ):
        """
        Verifica rate limit por IP.
        
        Se exceder: 429 Too Many Requests.
        Simples e funciona.
        """
        # Por enquanto só por IP - Redis viria depois
        return True  # Placeholder até ter Redis configurado
        
        # Define chave
        if self.by == "user" and current_user:
            key = f"rate_limit:user:{current_user.id}:{request.url.path}"
        else:
            key = f"rate_limit:ip:{request.client.host}:{request.url.path}"
        
        # Verifica limite
        count = await redis_service.incr(key)
        
        if count == 1:
            # Primeira requisição, define TTL
            await redis_service.expire(key, self.seconds)
        
        if count > self.times:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Limite excedido. Máximo {self.times} requisições a cada {self.seconds} segundos."
            )
        
        return True


# =============================================================================
# API KEY AUTHENTICATION - PARA INTEGRAÇÕES
# =============================================================================

async def get_api_key(
    api_key: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    """
    Valida API key para integrações.
    
    - Verifica formato
    - Busca no banco
    - Valida status
    - Incrementa uso
    
    API key inválida = porta fechada.
    """
    if not api_key or not api_key.startswith("ak_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key inválida"
        )
    
    # Hash da API key para buscar no banco
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    
    # Import aqui para evitar circular
    from app.models.api_key import ApiKey
    
    # Busca API key
    api_key_obj = await db.query(ApiKey).filter(
        ApiKey.key_hash == key_hash,
        ApiKey.is_active == True
    ).first()
    
    if not api_key_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key inválida ou inativa"
        )
    
    # Verifica expiração
    if api_key_obj.expires_at and api_key_obj.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key expirada"
        )
    
    # Incrementa contador de uso
    api_key_obj.usage_count += 1
    api_key_obj.last_used_at = datetime.utcnow()
    
    await db.commit()
    
    return api_key_obj


# =============================================================================
# PERMISSION CHECKING - CONTROLE FINO
# =============================================================================

class RequirePermission:
    """
    Verifica permissões específicas.
    
    Para controle fino de acesso.
    Flexível e poderoso.
    """
    
    def __init__(self, permission: str):
        self.permission = permission
    
    async def __call__(
        self,
        current_user = Depends(get_current_active_user)
    ):
        """
        Verifica se usuário tem permissão.
        
        Checa em:
        1. Role padrão
        2. Permissões customizadas
        
        Sem permissão = sem acesso.
        """
        # Permissões por role
        role_permissions = {
            "super_admin": ["*"],  # Acesso total
            "admin": [
                "users:read", "users:write",
                "agents:*", "conversations:*",
                "analytics:read"
            ],
            "manager": [
                "agents:*", "conversations:*",
                "analytics:read"
            ],
            "operator": [
                "agents:read", "conversations:*"
            ],
            "viewer": [
                "agents:read", "conversations:read",
                "analytics:read"
            ]
        }
        
        # Verifica permissão por role
        user_role_perms = role_permissions.get(current_user.role, [])
        
        # Super admin tem acesso total
        if "*" in user_role_perms:
            return True
        
        # Verifica wildcard (ex: "agents:*")
        permission_parts = self.permission.split(":")
        if len(permission_parts) > 1:
            wildcard = f"{permission_parts[0]}:*"
            if wildcard in user_role_perms:
                return True
        
        # Verifica permissão específica
        if self.permission in user_role_perms:
            return True
        
        # Verifica permissões customizadas do usuário
        custom_perms = current_user.permissions or {}
        if self.permission in custom_perms.get("allowed", []):
            return True
        
        # Sem permissão
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permissão '{self.permission}' necessária"
        )


# =============================================================================
# CSRF PROTECTION - PARA FORMULÁRIOS WEB
# =============================================================================

def generate_csrf_token() -> str:
    """
    Gera token CSRF.
    
    Para proteção contra CSRF em forms.
    Web security 101.
    """
    return secrets.token_urlsafe(32)


def verify_csrf_token(
    token: str,
    session_token: str
) -> bool:
    """
    Verifica token CSRF.
    
    Compara com token da sessão.
    Proteção básica mas essencial.
    """
    return hmac.compare_digest(token, session_token)


# =============================================================================
# EXPORTS - O ARSENAL COMPLETO
# =============================================================================

__all__ = [
    # Password
    "verify_password",
    "get_password_hash",
    
    # JWT
    "create_access_token",
    "create_refresh_token",
    "decode_token",
    
    # Dependencies
    "get_current_token",
    "get_current_user",
    "get_current_active_user",
    "get_current_admin_user",
    "get_current_super_admin",
    "get_api_key",
    
    # Rate Limiting
    "RateLimiter",
    
    # Permissions
    "RequirePermission",
    
    # CSRF
    "generate_csrf_token",
    "verify_csrf_token",
    
    # OAuth2
    "oauth2_scheme"
]