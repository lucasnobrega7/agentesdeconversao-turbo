"""
Knowledge Service integrado com LiteLLM
"""

import os
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
import json
import asyncio

from qdrant_client import QdrantClient
from qdrant_client.http import models
import numpy as np
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class KnowledgeService:
    """Serviço para gerenciamento de base de conhecimento com embeddings"""
    
    def __init__(self):
        self.qdrant = QdrantClient(
            host=settings.QDRANT_URL.split("://")[1].split(":")[0],
            port=int(settings.QDRANT_URL.split(":")[-1]) if ":" in settings.QDRANT_URL else 6333
        )
        self.litellm_url = settings.LITELLM_URL
        self.litellm_key = settings.LITELLM_API_KEY
        
    async def create_collection(
        self,
        organization_id: str,
        knowledge_base_id: str,
        vector_size: int = 1536  # OpenAI embedding size
    ):
        """Cria collection no Qdrant para uma base de conhecimento"""
        
        collection_name = f"org_{organization_id}_kb_{knowledge_base_id}"
        
        try:
            self.qdrant.create_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(
                    size=vector_size,
                    distance=models.Distance.COSINE
                )
            )
            logger.info(f"Collection {collection_name} created successfully")
            return True
        except Exception as e:
            logger.error(f"Error creating collection: {e}")
            return False
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Gera embedding usando LiteLLM com modelo de embedding"""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.litellm_url}/embeddings",
                headers={
                    "Authorization": f"Bearer {self.litellm_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "input": text,
                    "model": settings.KNOWLEDGE_EMBEDDING_MODEL
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["data"][0]["embedding"]
            else:
                # Fallback para embedding local se LiteLLM falhar
                logger.warning(f"LiteLLM embedding failed, using fallback")
                return self._generate_fallback_embedding(text)
    
    def _generate_fallback_embedding(self, text: str) -> List[float]:
        """Gera embedding simples como fallback"""
        # Implementação simplificada - em produção usar sentence-transformers
        import hashlib
        
        # Hash do texto para gerar valores determinísticos
        text_hash = hashlib.sha256(text.encode()).hexdigest()
        
        # Converter hash em vetor de floats
        embedding = []
        for i in range(0, len(text_hash), 4):
            chunk = text_hash[i:i+4]
            value = int(chunk, 16) / 65535.0  # Normalizar para [0, 1]
            embedding.append(value - 0.5)  # Centralizar em 0
        
        # Preencher até 1536 dimensões
        while len(embedding) < 1536:
            embedding.append(0.0)
        
        return embedding[:1536]
    
    async def add_documents(
        self,
        documents: List[Dict[str, Any]],
        knowledge_base_id: str,
        organization_id: str
    ) -> Dict[str, Any]:
        """Adiciona documentos à base de conhecimento"""
        
        collection_name = f"org_{organization_id}_kb_{knowledge_base_id}"
        
        # Verificar se collection existe
        try:
            self.qdrant.get_collection(collection_name)
        except:
            await self.create_collection(organization_id, knowledge_base_id)
        
        # Processar documentos em batch
        points = []
        errors = []
        
        for i, doc in enumerate(documents):
            try:
                # Gerar embedding
                embedding = await self.generate_embedding(doc["content"])
                
                # Criar ponto para Qdrant
                point = models.PointStruct(
                    id=doc.get("id", i),
                    vector=embedding,
                    payload={
                        "content": doc["content"],
                        "title": doc.get("title", ""),
                        "metadata": doc.get("metadata", {}),
                        "knowledge_base_id": knowledge_base_id,
                        "organization_id": organization_id,
                        "created_at": datetime.utcnow().isoformat()
                    }
                )
                points.append(point)
                
            except Exception as e:
                logger.error(f"Error processing document {i}: {e}")
                errors.append({
                    "index": i,
                    "error": str(e)
                })
        
        # Inserir no Qdrant
        if points:
            operation_info = self.qdrant.upsert(
                collection_name=collection_name,
                points=points
            )
            
            return {
                "success": True,
                "documents_processed": len(points),
                "errors": errors,
                "operation_id": operation_info.operation_id if hasattr(operation_info, 'operation_id') else None
            }
        else:
            return {
                "success": False,
                "documents_processed": 0,
                "errors": errors
            }
    
    async def search_knowledge(
        self,
        query: str,
        knowledge_base_id: str,
        organization_id: str,
        limit: int = 5,
        score_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Busca semântica na base de conhecimento"""
        
        collection_name = f"org_{organization_id}_kb_{knowledge_base_id}"
        
        try:
            # Gerar embedding da query
            query_embedding = await self.generate_embedding(query)
            
            # Buscar no Qdrant
            search_result = self.qdrant.search(
                collection_name=collection_name,
                query_vector=query_embedding,
                limit=limit,
                score_threshold=score_threshold
            )
            
            # Formatar resultados
            results = []
            for hit in search_result:
                results.append({
                    "id": hit.id,
                    "score": hit.score,
                    "content": hit.payload.get("content", ""),
                    "title": hit.payload.get("title", ""),
                    "metadata": hit.payload.get("metadata", {})
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching knowledge base: {e}")
            return []
    
    async def enhance_prompt_with_knowledge(
        self,
        prompt: str,
        knowledge_base_id: str,
        organization_id: str,
        max_context_length: int = 2000
    ) -> str:
        """Enriquece prompt com conhecimento relevante"""
        
        # Buscar conhecimento relevante
        search_results = await self.search_knowledge(
            query=prompt,
            knowledge_base_id=knowledge_base_id,
            organization_id=organization_id,
            limit=5
        )
        
        if not search_results:
            return prompt
        
        # Construir contexto
        context_parts = ["Contexto relevante da base de conhecimento:\n"]
        current_length = len(context_parts[0])
        
        for i, result in enumerate(search_results):
            content = result["content"]
            title = result["title"]
            
            # Adicionar título se disponível
            if title:
                part = f"\n{i+1}. {title}\n{content}\n"
            else:
                part = f"\n{i+1}. {content}\n"
            
            # Verificar se cabe no limite
            if current_length + len(part) <= max_context_length:
                context_parts.append(part)
                current_length += len(part)
            else:
                # Truncar e parar
                remaining = max_context_length - current_length
                if remaining > 50:  # Só adicionar se tiver espaço significativo
                    context_parts.append(part[:remaining] + "...")
                break
        
        # Combinar contexto com prompt original
        context = "".join(context_parts)
        enhanced_prompt = f"{context}\n\nPergunta do usuário: {prompt}"
        
        return enhanced_prompt
    
    async def update_document(
        self,
        document_id: str,
        content: str,
        knowledge_base_id: str,
        organization_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Atualiza documento existente"""
        
        collection_name = f"org_{organization_id}_kb_{knowledge_base_id}"
        
        try:
            # Gerar novo embedding
            embedding = await self.generate_embedding(content)
            
            # Atualizar no Qdrant
            self.qdrant.upsert(
                collection_name=collection_name,
                points=[
                    models.PointStruct(
                        id=document_id,
                        vector=embedding,
                        payload={
                            "content": content,
                            "metadata": metadata or {},
                            "knowledge_base_id": knowledge_base_id,
                            "organization_id": organization_id,
                            "updated_at": datetime.utcnow().isoformat()
                        }
                    )
                ]
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error updating document: {e}")
            return False
    
    async def delete_document(
        self,
        document_id: str,
        knowledge_base_id: str,
        organization_id: str
    ) -> bool:
        """Remove documento da base de conhecimento"""
        
        collection_name = f"org_{organization_id}_kb_{knowledge_base_id}"
        
        try:
            self.qdrant.delete(
                collection_name=collection_name,
                points_selector=models.PointIdsList(
                    points=[document_id]
                )
            )
            return True
            
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            return False
    
    async def get_collection_stats(
        self,
        knowledge_base_id: str,
        organization_id: str
    ) -> Dict[str, Any]:
        """Obtém estatísticas da collection"""
        
        collection_name = f"org_{organization_id}_kb_{knowledge_base_id}"
        
        try:
            collection_info = self.qdrant.get_collection(collection_name)
            
            return {
                "status": collection_info.status,
                "vectors_count": collection_info.vectors_count,
                "indexed_vectors_count": collection_info.indexed_vectors_count,
                "points_count": collection_info.points_count,
                "segments_count": collection_info.segments_count,
                "config": {
                    "vector_size": collection_info.config.params.vectors.size,
                    "distance": collection_info.config.params.vectors.distance
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting collection stats: {e}")
            return {
                "error": str(e),
                "status": "error"
            }
