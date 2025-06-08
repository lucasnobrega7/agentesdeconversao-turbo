"""
Tasks Celery para processamento de base de conhecimento
"""

from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
import asyncio
import mimetypes
import os
from pathlib import Path

from celery import shared_task
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import (
    TextLoader,
    PDFLoader,
    UnstructuredWordDocumentLoader,
    UnstructuredMarkdownLoader,
    CSVLoader
)

from app.services.knowledge_service import KnowledgeService
from app.services.cache_service import cache_service
from app.core.config import settings
from app.database import get_db
from app.models.knowledge import KnowledgeBase, Document

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_document(
    self,
    file_path: str,
    knowledge_base_id: str,
    organization_id: str,
    document_metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Processa documento e adiciona à base de conhecimento"""
    
    try:
        # Detectar tipo de arquivo
        mime_type, _ = mimetypes.guess_type(file_path)
        file_extension = Path(file_path).suffix.lower()
        
        # Selecionar loader apropriado
        if file_extension == '.txt':
            loader = TextLoader(file_path)
        elif file_extension == '.pdf':
            loader = PDFLoader(file_path)
        elif file_extension in ['.doc', '.docx']:
            loader = UnstructuredWordDocumentLoader(file_path)
        elif file_extension == '.md':
            loader = UnstructuredMarkdownLoader(file_path)
        elif file_extension == '.csv':
            loader = CSVLoader(file_path)
        else:
            return {
                "error": f"Unsupported file type: {file_extension}",
                "supported_types": [".txt", ".pdf", ".doc", ".docx", ".md", ".csv"]
            }
        
        # Carregar documento
        documents = loader.load()
        
        if not documents:
            return {"error": "No content extracted from document"}
        
        # Configurar text splitter
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.KNOWLEDGE_CHUNK_SIZE,
            chunk_overlap=settings.KNOWLEDGE_CHUNK_OVERLAP,
            length_function=len,
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
        )
        
        # Dividir em chunks
        chunks = text_splitter.split_documents(documents)
        
        # Preparar documentos para indexação
        knowledge_service = KnowledgeService()
        
        processed_chunks = []
        for i, chunk in enumerate(chunks):
            chunk_metadata = {
                "source": file_path,
                "chunk_index": i,
                "total_chunks": len(chunks),
                **(document_metadata or {}),
                **(chunk.metadata or {})
            }
            
            processed_chunks.append({
                "id": f"{knowledge_base_id}_{Path(file_path).stem}_{i}",
                "content": chunk.page_content,
                "title": document_metadata.get("title", Path(file_path).stem),
                "metadata": chunk_metadata
            })
        
        # Adicionar à base de conhecimento
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        result = loop.run_until_complete(
            knowledge_service.add_documents(
                documents=processed_chunks,
                knowledge_base_id=knowledge_base_id,
                organization_id=organization_id
            )
        )
        
        loop.close()
        
        # Salvar no banco de dados
        if result["success"]:
            db = next(get_db())
            
            doc = Document(
                knowledge_base_id=knowledge_base_id,
                title=document_metadata.get("title", Path(file_path).name),
                file_name=Path(file_path).name,
                file_type=file_extension,
                chunk_count=len(processed_chunks),
                metadata={
                    "mime_type": mime_type,
                    "file_size": os.path.getsize(file_path),
                    "processed_at": datetime.utcnow().isoformat(),
                    **document_metadata
                }
            )
            
            db.add(doc)
            db.commit()
            
            # Limpar cache de busca
            await cache_service.get_redis()
            pattern = f"kb_search:{knowledge_base_id}:*"
            async for key in cache_service._redis.scan_iter(match=pattern):
                await cache_service._redis.delete(key)
        
        # Limpar arquivo temporário
        if os.path.exists(file_path) and file_path.startswith("/tmp/"):
            os.remove(file_path)
        
        return {
            "success": result["success"],
            "document_id": doc.id if result["success"] else None,
            "chunks_processed": len(processed_chunks),
            "errors": result.get("errors", [])
        }
        
    except Exception as e:
        logger.error(f"Error processing document: {e}")
        raise self.retry(exc=e, countdown=60)


@shared_task(bind=True)
def update_knowledge_base_embeddings(
    self,
    knowledge_base_id: str,
    organization_id: str
) -> Dict[str, Any]:
    """Atualiza todos os embeddings de uma base de conhecimento"""
    
    try:
        knowledge_service = KnowledgeService()
        
        # Obter estatísticas atuais
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        stats_before = loop.run_until_complete(
            knowledge_service.get_collection_stats(
                knowledge_base_id=knowledge_base_id,
                organization_id=organization_id
            )
        )
        
        # TODO: Implementar re-indexação completa
        # Por enquanto, apenas retornar stats
        
        stats_after = loop.run_until_complete(
            knowledge_service.get_collection_stats(
                knowledge_base_id=knowledge_base_id,
                organization_id=organization_id
            )
        )
        
        loop.close()
        
        return {
            "knowledge_base_id": knowledge_base_id,
            "stats_before": stats_before,
            "stats_after": stats_after,
            "updated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating embeddings: {e}")
        return {"error": str(e)}


@shared_task(bind=True)
def clean_orphaned_documents(
    self,
    organization_id: str
) -> Dict[str, Any]:
    """Remove documentos órfãos do Qdrant"""
    
    try:
        db = next(get_db())
        knowledge_service = KnowledgeService()
        
        # Buscar todas as bases de conhecimento da organização
        knowledge_bases = db.query(KnowledgeBase).filter(
            KnowledgeBase.organization_id == organization_id
        ).all()
        
        results = {
            "knowledge_bases_checked": len(knowledge_bases),
            "orphaned_documents": 0,
            "errors": []
        }
        
        for kb in knowledge_bases:
            try:
                # Obter IDs de documentos do banco
                db_documents = db.query(Document).filter(
                    Document.knowledge_base_id == kb.id
                ).all()
                
                db_doc_ids = set(doc.id for doc in db_documents)
                
                # TODO: Comparar com Qdrant e remover órfãos
                # Por enquanto, apenas log
                logger.info(f"Checked {kb.name}: {len(db_doc_ids)} documents in DB")
                
            except Exception as e:
                logger.error(f"Error checking KB {kb.id}: {e}")
                results["errors"].append({
                    "knowledge_base_id": kb.id,
                    "error": str(e)
                })
        
        return results
        
    except Exception as e:
        logger.error(f"Error cleaning orphaned documents: {e}")
        return {"error": str(e)}


@shared_task(bind=True, max_retries=5)
def extract_qa_pairs(
    self,
    document_id: str,
    knowledge_base_id: str,
    organization_id: str
) -> Dict[str, Any]:
    """Extrai pares de pergunta-resposta de documentos usando IA"""
    
    try:
        db = next(get_db())
        
        # Buscar documento
        document = db.query(Document).filter(
            Document.id == document_id
        ).first()
        
        if not document:
            return {"error": "Document not found"}
        
        # Buscar chunks do documento no Qdrant
        knowledge_service = KnowledgeService()
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Buscar usando metadata
        search_results = loop.run_until_complete(
            knowledge_service.search_knowledge(
                query=document.title,
                knowledge_base_id=knowledge_base_id,
                organization_id=organization_id,
                limit=20
            )
        )
        
        # Filtrar chunks deste documento
        document_chunks = [
            r for r in search_results 
            if r.get("metadata", {}).get("source", "").endswith(document.file_name)
        ]
        
        if not document_chunks:
            return {"error": "No chunks found for document"}
        
        # Usar IA para extrair Q&A
        from app.services.ai_service import AIService
        ai_service = AIService()
        
        qa_pairs = []
        
        for chunk in document_chunks[:5]:  # Limitar para não gastar muito
            extraction_prompt = f"""
            Extraia 3-5 perguntas e respostas do texto abaixo.
            Formato: 
            Q: [pergunta]
            A: [resposta]
            
            Texto:
            {chunk['content'][:1000]}
            """
            
            response = loop.run_until_complete(
                ai_service.chat_completion(
                    messages=[
                        {
                            "role": "system",
                            "content": "Você é um especialista em criar perguntas e respostas educativas a partir de textos."
                        },
                        {"role": "user", "content": extraction_prompt}
                    ],
                    metadata={
                        "organization_id": organization_id,
                        "task": "qa_extraction",
                        "document_id": document_id
                    },
                    temperature=0.3,
                    max_tokens=500
                )
            )
            
            # Parsear resposta
            qa_text = response["choices"][0]["message"]["content"]
            
            # Extrair Q&A (simplificado)
            lines = qa_text.split("\n")
            current_q = None
            
            for line in lines:
                if line.startswith("Q:"):
                    current_q = line[2:].strip()
                elif line.startswith("A:") and current_q:
                    qa_pairs.append({
                        "question": current_q,
                        "answer": line[2:].strip(),
                        "source_chunk": chunk['id']
                    })
                    current_q = None
        
        loop.close()
        
        # Salvar Q&A pairs
        if qa_pairs:
            document.metadata["qa_pairs"] = qa_pairs
            document.metadata["qa_extracted_at"] = datetime.utcnow().isoformat()
            db.commit()
        
        return {
            "document_id": document_id,
            "qa_pairs_extracted": len(qa_pairs),
            "qa_pairs": qa_pairs[:10]  # Retornar amostra
        }
        
    except Exception as e:
        logger.error(f"Error extracting Q&A pairs: {e}")
        raise self.retry(exc=e, countdown=120)
