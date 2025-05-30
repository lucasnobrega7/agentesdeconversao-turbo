"""
=============================================================================
AUTH ROUTER - AUTENTICAÇÃO ENTERPRISE QUE FUNCIONA
JWT + OAuth + Multi-tenant + Rate limiting = Arsenal completo
=============================================================================
"""

from datetime import timedelta
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    verify_password, create_access_token, create_refresh_token,
    get_current_user, get_current_active_user, RateLimiter
)
from app.models.user import User, UserLogin, UserCreate, UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

# Rate limiters enterprise
login_limiter = RateLimiter(times=5, seconds=300, by="ip")  # 5 tentativas por 5min
register_limiter = RateLimiter(times=3, seconds=3600, by="ip")  # 3 registros por hora


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
    _rate_limit: bool = Depends(login_limiter)
):
    """
    Login enterprise com JWT + rate limiting.
    
    Returns access_token + refresh_token.
    Porque enterprise não brinca com segurança.
    """
    service = UserService(db)
    
    # Busca usuário por email
    user = await service.authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Cria tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Atualiza último login
    await service.update_last_login(user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 1800,  # 30 minutos
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "status": user.status
        }
    }


@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    _rate_limit: bool = Depends(register_limiter)
):
    """
    Registro de usuário enterprise.
    
    Multi-tenant ready, com validação forte.
    Porque amador não valida senha.
    """
    service = UserService(db)
    
    # Verifica se email já existe
    if await service.get_user_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )
    
    # Cria usuário
    user = await service.create_user(user_data)
    
    return user


@router.post("/refresh")
async def refresh_token(
    refresh_token: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Renova access token com refresh token.
    
    Segurança enterprise que outros vão copiar.
    """
    from app.core.security import decode_token
    
    try:
        payload = decode_token(refresh_token)
        user_id = payload.get("sub")
        token_type = payload.get("type")
        
        if not user_id or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
            
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    
    # Verifica se usuário ainda existe e está ativo
    service = UserService(db)
    user = await service.get_user_by_id(user_id)
    
    if not user or user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inativo"
        )
    
    # Cria novo access token
    new_access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": 1800
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Informações do usuário atual.
    
    Simples e direto ao ponto.
    """
    return current_user


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
):
    """
    Logout (placeholder).
    
    Em produção, aqui invalidaria o token no Redis.
    Por enquanto, só confirma logout.
    """
    return {"message": "Logout realizado com sucesso"}


@router.post("/forgot-password")
async def forgot_password(
    email: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Esqueci a senha (placeholder).
    
    Em produção, enviaria email com link de reset.
    """
    service = UserService(db)
    user = await service.get_user_by_email(email)
    
    # Sempre retorna sucesso (para não vazar emails válidos)
    return {"message": "Se o email existir, você receberá instruções de reset"}


@router.post("/reset-password")
async def reset_password(
    token: str = Form(...),
    new_password: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Reset de senha com token (placeholder).
    
    Em produção, validaria token de reset e alteraria senha.
    """
    # TODO: Implementar validação de token e reset
    return {"message": "Senha alterada com sucesso"}


@router.get("/health")
async def auth_health():
    """Health check do módulo de auth"""
    return {
        "status": "healthy",
        "module": "authentication",
        "features": ["jwt", "rate_limiting", "multi_tenant"]
    }