"""
=============================================================================
KNOWLEDGE ROUTER - CÉREBRO IA QUE SABE TUDO SOBRE SEU NEGÓCIO
RAG enterprise que outros pagam R$50k para ter
=============================================================================
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.knowledge import (
    KnowledgeBaseResponse, KnowledgeBaseCreate, 
    DocumentResponse, DocumentUpload, QueryRequest
)
from app.services.knowledge_service import KnowledgeService

router = APIRouter(prefix="/api/v1/knowledge", tags=["Knowledge"])

@router.post("/bases", response_model=KnowledgeBaseResponse)
async def create_knowledge_base(
    kb_data: KnowledgeBaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cria base de conhecimento - cérebro do seu agente"""
    service = KnowledgeService(db)
    kb = await service.create_knowledge_base(kb_data, current_user.id)
    return kb

@router.get("/bases", response_model=List[KnowledgeBaseResponse])
async def list_knowledge_bases(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista bases de conhecimento - seu arsenal de informação"""
    service = KnowledgeService(db)
    bases = await service.get_user_knowledge_bases(current_user.id, skip, limit)
    return bases

@router.get("/bases/{kb_id}", response_model=KnowledgeBaseResponse)
async def get_knowledge_base(
    kb_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Busca base específica com stats completas"""
    service = KnowledgeService(db)
    kb = await service.get_knowledge_base(kb_id, current_user.id)
    if not kb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Base de conhecimento não encontrada"
        )
    return kb

@router.post("/bases/{kb_id}/upload")
async def upload_documents(
    kb_id: UUID,
    files: List[UploadFile] = File(...),
    auto_process: bool = Form(True),
    chunk_size: int = Form(1000),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload de documentos - alimenta o cérebro IA"""
    service = KnowledgeService(db)
    results = await service.upload_documents(
        kb_id, files, current_user.id, auto_process, chunk_size
    )
    return {
        "uploaded_count": len(results),
        "processing_status": "completed" if auto_process else "queued",
        "documents": results
    }

@router.post("/bases/{kb_id}/url")
async def add_url_content(
    kb_id: UUID,
    url: str,
    title: Optional[str] = None,
    auto_process: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Adiciona conteúdo de URL - web scraping automático"""
    service = KnowledgeService(db)
    result = await service.add_url_content(
        kb_id, url, current_user.id, title, auto_process
    )
    return result

@router.post("/bases/{kb_id}/query")
async def query_knowledge_base(
    kb_id: UUID,
    query_data: QueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Consulta a base - pergunta e o IA responde"""
    service = KnowledgeService(db)
    result = await service.query_knowledge_base(
        kb_id, query_data.query, current_user.id, query_data.limit or 5
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Base não encontrada ou sem conteúdo"
        )
    return {
        "answer": result.answer,
        "sources": result.sources,
        "confidence_score": result.confidence,
        "processing_time": result.processing_time
    }

@router.get("/bases/{kb_id}/documents", response_model=List[DocumentResponse])
async def list_documents(
    kb_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista documentos da base"""
    service = KnowledgeService(db)
    docs = await service.get_knowledge_base_documents(
        kb_id, current_user.id, skip, limit
    )
    return docs

@router.delete("/bases/{kb_id}/documents/{doc_id}")
async def delete_document(
    kb_id: UUID,
    doc_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove documento da base"""
    service = KnowledgeService(db)
    success = await service.delete_document(kb_id, doc_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento não encontrado"
        )
    return {"message": "Documento removido com sucesso"}

@router.post("/bases/{kb_id}/reindex")
async def reindex_knowledge_base(
    kb_id: UUID,
    force: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reprocessa toda a base - otimização de embeddings"""
    service = KnowledgeService(db)
    result = await service.reindex_knowledge_base(kb_id, current_user.id, force)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Base não encontrada"
        )
    return result

@router.get("/bases/{kb_id}/analytics")
async def get_knowledge_analytics(
    kb_id: UUID,
    period: str = "30d",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analytics da base - quais conteúdos são mais úteis"""
    service = KnowledgeService(db)
    analytics = await service.get_knowledge_analytics(
        kb_id, current_user.id, period
    )
    return analytics

@router.post("/bases/{kb_id}/train")
async def train_knowledge_base(
    kb_id: UUID,
    model_type: str = "semantic",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Treina modelo específico para a base - fine-tuning"""
    service = KnowledgeService(db)
    result = await service.train_custom_model(
        kb_id, current_user.id, model_type
    )
    return result

@router.delete("/bases/{kb_id}")
async def delete_knowledge_base(
    kb_id: UUID,
    confirm: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deleta base completa - CUIDADO, sem volta"""
    if not confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirme a deleção com confirm=true"
        )
    
    service = KnowledgeService(db)
    success = await service.delete_knowledge_base(kb_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Base não encontrada"
        )
    return {"message": "Base de conhecimento deletada permanentemente"}