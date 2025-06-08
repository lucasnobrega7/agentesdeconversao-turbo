"""
AI Service usando LiteLLM Gateway
"""

import os
import json
from typing import Dict, Any, List, Optional, AsyncIterator
import httpx
from datetime import datetime
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """Serviço para interação com LiteLLM Gateway"""
    
    def __init__(self):
        self.base_url = settings.LITELLM_URL or "http://litellm:4000"
        self.timeout = httpx.Timeout(180.0, connect=10.0)
        
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        metadata: Optional[Dict[str, Any]] = None,
        stream: bool = False,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Envia requisição de chat completion para o LiteLLM Gateway"""
        
        # Preparar payload
        payload = {
            "messages": messages,
            "metadata": metadata or {},
            "stream": stream,
            **kwargs
        }
        
        if temperature is not None:
            payload["temperature"] = temperature
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
            
        # Headers com autenticação
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.LITELLM_API_KEY}"
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/ai/chat/completions",
                    json=payload,
                    headers=headers
                )
                response.raise_for_status()
                
                if stream:
                    return response.iter_lines()
                else:
                    return response.json()
                    
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error from LiteLLM: {e}")
            raise
        except Exception as e:
            logger.error(f"Error calling LiteLLM: {e}")
            raise
    
    async def process_message(
        self,
        message: str,
        conversation_history: List[Dict[str, str]],
        agent_config: Dict[str, Any],
        user_context: Dict[str, Any],
        knowledge_context: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Processa mensagem com contexto completo"""
        
        # Construir mensagens com contexto
        messages = self._build_messages(
            message=message,
            conversation_history=conversation_history,
            agent_config=agent_config,
            knowledge_context=knowledge_context
        )
        
        # Preparar metadata para roteamento inteligente
        metadata = {
            "organization_id": user_context.get("organization_id"),
            "user_id": user_context.get("user_id"),
            "conversation_id": user_context.get("conversation_id"),
            "agent_id": agent_config.get("id"),
            "user_value": user_context.get("lifetime_value", 0),
            "user_tier": user_context.get("tier", "standard"),
            "intent": self._detect_intent(message)
        }
        
        # Determinar se deve usar streaming
        use_stream = agent_config.get("enable_streaming", False)
        
        # Chamar LiteLLM
        response = await self.chat_completion(
            messages=messages,
            metadata=metadata,
            stream=use_stream,
            temperature=agent_config.get("temperature", 0.7),
            max_tokens=agent_config.get("max_tokens", 2048)
        )
        
        # Processar resposta
        if use_stream:
            return {
                "type": "stream",
                "stream": self._process_stream(response),
                "metadata": metadata
            }
        else:
            return {
                "type": "message",
                "content": response["choices"][0]["message"]["content"],
                "usage": response.get("usage", {}),
                "model": response.get("model"),
                "metadata": metadata
            }
    
    def _build_messages(
        self,
        message: str,
        conversation_history: List[Dict[str, str]],
        agent_config: Dict[str, Any],
        knowledge_context: Optional[List[str]] = None
    ) -> List[Dict[str, str]]:
        """Constrói array de mensagens com contexto"""
        
        messages = []
        
        # System message com configuração do agente
        system_content = agent_config.get("prompt", "Você é um assistente útil.")
        
        # Adicionar contexto de conhecimento se disponível
        if knowledge_context:
            system_content += "\n\nContexto relevante da base de conhecimento:\n"
            for i, context in enumerate(knowledge_context[:5]):  # Limitar a 5 contextos
                system_content += f"\n{i+1}. {context}"
        
        messages.append({
            "role": "system",
            "content": system_content
        })
        
        # Adicionar histórico de conversa (últimas N mensagens)
        history_limit = agent_config.get("history_limit", 10)
        for msg in conversation_history[-history_limit:]:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Adicionar mensagem atual
        messages.append({
            "role": "user",
            "content": message
        })
        
        return messages
    
    def _detect_intent(self, message: str) -> str:
        """Detecta intent básico da mensagem"""
        message_lower = message.lower()
        
        # Detecção simples de intent
        # Em produção, usar um classificador ML
        if any(greeting in message_lower for greeting in ["oi", "olá", "bom dia", "boa tarde", "boa noite"]):
            return "greeting"
        elif any(word in message_lower for word in ["preço", "custo", "valor", "quanto"]):
            return "pricing_query"
        elif any(word in message_lower for word in ["comprar", "adquirir", "pedido"]):
            return "purchase_intent"
        elif any(word in message_lower for word in ["problema", "erro", "não funciona", "ajuda"]):
            return "support_request"
        elif any(word in message_lower for word in ["cancelar", "desistir", "parar"]):
            return "cancellation"
        else:
            return "general_query"
    
    async def _process_stream(self, stream: AsyncIterator[str]) -> AsyncIterator[str]:
        """Processa stream de resposta"""
        async for line in stream:
            if line.startswith("data: "):
                data = line[6:]
                if data == "[DONE]":
                    break
                    
                try:
                    chunk = json.loads(data)
                    if "choices" in chunk and chunk["choices"]:
                        content = chunk["choices"][0].get("delta", {}).get("content", "")
                        if content:
                            yield content
                except json.JSONDecodeError:
                    continue
    
    async def analyze_conversation(
        self,
        conversation_id: str,
        organization_id: str
    ) -> Dict[str, Any]:
        """Analisa conversa para insights"""
        
        # Preparar prompt de análise
        messages = [
            {
                "role": "system",
                "content": """Você é um analista de conversas especializado. 
                Analise a conversa e forneça:
                1. Resumo da interação
                2. Sentimento do cliente (positivo/neutro/negativo)
                3. Intenção principal identificada
                4. Produtos ou serviços mencionados
                5. Próximos passos recomendados
                6. Score de satisfação estimado (0-10)
                """
            },
            {
                "role": "user",
                "content": f"Analise a conversa {conversation_id}"
            }
        ]
        
        metadata = {
            "organization_id": organization_id,
            "task": "conversation_analysis",
            "conversation_id": conversation_id
        }
        
        response = await self.chat_completion(
            messages=messages,
            metadata=metadata,
            temperature=0.3,
            max_tokens=1000
        )
        
        return {
            "conversation_id": conversation_id,
            "analysis": response["choices"][0]["message"]["content"],
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def get_available_models(self, organization_id: str) -> List[Dict[str, Any]]:
        """Lista modelos disponíveis para a organização"""
        
        headers = {
            "Authorization": f"Bearer {settings.LITELLM_API_KEY}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/ai/models",
                headers=headers
            )
            response.raise_for_status()
            
            return response.json()["data"]
    
    async def get_usage_stats(
        self,
        organization_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Obtém estatísticas de uso de IA"""
        
        params = {}
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
            
        headers = {
            "Authorization": f"Bearer {settings.LITELLM_API_KEY}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/ai/usage",
                headers=headers,
                params=params
            )
            response.raise_for_status()
            
            return response.json()
