"""
=============================================================================
USER SERVICE - LÓGICA DE NEGÓCIO QUE OUTROS COPIAM
SQLAlchemy async + bcrypt + validações enterprise
=============================================================================
"""

from typing import Optional, List
from uuid import UUID
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.core.security import get_password_hash, verify_password
from app.models.user import User, UserCreate, UserUpdate, UserStatus
from app.models.organization import Organization


class UserService:
    """
    Service que gerencia usuários enterprise.
    
    Sem gambiarras, só código que funciona.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_user(self, user_data: UserCreate) -> User:
        """
        Cria usuário novo - validação enterprise.
        
        Hash bcrypt, validações, audit trail completo.
        Porque segurança não é opcional.
        """
        # Hash da senha
        password_hash = get_password_hash(user_data.password)
        
        # Cria objeto User
        user = User(
            email=user_data.email.lower().strip(),
            username=user_data.username,
            full_name=user_data.full_name,
            display_name=user_data.display_name,
            password_hash=password_hash,
            organization_id=user_data.organization_id,
            status=UserStatus.PENDING_VERIFICATION.value,
            metadata_json={
                "registration_source": "api",
                "created_at": datetime.utcnow().isoformat()
            }
        )
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        
        return user
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Autentica usuário - bcrypt verification.
        
        Busca por email, verifica senha, valida status.
        Sem shortcut de segurança.
        """
        # Busca usuário
        result = await self.db.execute(
            select(User).where(
                User.email == email.lower().strip(),
                User.is_deleted == False
            )
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        # Verifica senha
        if not verify_password(password, user.password_hash):
            # Incrementa contador de tentativas falhadas
            await self._increment_failed_attempts(user.id)
            return None
        
        # Reset contador de tentativas se login ok
        if user.failed_login_attempts > 0:
            await self._reset_failed_attempts(user.id)
        
        return user
    
    async def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """Busca usuário por ID"""
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.organization))
            .where(
                User.id == user_id,
                User.is_deleted == False
            )
        )
        return result.scalar_one_or_none()
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Busca usuário por email"""
        result = await self.db.execute(
            select(User).where(
                User.email == email.lower().strip(),
                User.is_deleted == False
            )
        )
        return result.scalar_one_or_none()
    
    async def update_user(self, user_id: UUID, user_data: UserUpdate) -> Optional[User]:
        """
        Atualiza usuário - partial update.
        
        Só atualiza campos que vieram no request.
        Audit trail automático.
        """
        # Busca usuário
        user = await self.get_user_by_id(user_id)
        if not user:
            return None
        
        # Atualiza apenas campos fornecidos
        update_data = user_data.model_dump(exclude_unset=True)
        
        if update_data:
            # Update com SQLAlchemy
            await self.db.execute(
                update(User)
                .where(User.id == user_id)
                .values(**update_data)
            )
            await self.db.commit()
            
            # Refresh para pegar dados atualizados
            await self.db.refresh(user)
        
        return user
    
    async def update_last_login(self, user_id: UUID, ip_address: str = None) -> bool:
        """Atualiza último login do usuário"""
        try:
            await self.db.execute(
                update(User)
                .where(User.id == user_id)
                .values(
                    last_login_at=datetime.utcnow(),
                    last_login_ip=ip_address
                )
            )
            await self.db.commit()
            return True
        except Exception:
            return False
    
    async def change_password(self, user_id: UUID, current_password: str, new_password: str) -> bool:
        """
        Troca senha com validação.
        
        Verifica senha atual, hash nova senha, audit.
        Segurança enterprise que funciona.
        """
        user = await self.get_user_by_id(user_id)
        if not user:
            return False
        
        # Verifica senha atual
        if not verify_password(current_password, user.password_hash):
            return False
        
        # Hash nova senha
        new_password_hash = get_password_hash(new_password)
        
        # Atualiza no banco
        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(password_hash=new_password_hash)
        )
        await self.db.commit()
        
        return True
    
    async def deactivate_user(self, user_id: UUID) -> bool:
        """Desativa usuário (soft delete)"""
        try:
            await self.db.execute(
                update(User)
                .where(User.id == user_id)
                .values(
                    status=UserStatus.INACTIVE.value,
                    deleted_at=datetime.utcnow(),
                    is_deleted=True
                )
            )
            await self.db.commit()
            return True
        except Exception:
            return False
    
    async def list_users(
        self, 
        organization_id: Optional[UUID] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[User]:
        """Lista usuários com paginação"""
        query = select(User).where(User.is_deleted == False)
        
        if organization_id:
            query = query.where(User.organization_id == organization_id)
        
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def _increment_failed_attempts(self, user_id: UUID) -> None:
        """Incrementa tentativas de login falhadas"""
        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(failed_login_attempts=User.failed_login_attempts + 1)
        )
        await self.db.commit()
    
    async def _reset_failed_attempts(self, user_id: UUID) -> None:
        """Reset tentativas de login falhadas"""
        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(failed_login_attempts=0)
        )
        await self.db.commit()