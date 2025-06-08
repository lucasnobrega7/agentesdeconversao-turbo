"""
AI Router - Roteamento inteligente de modelos
"""

from typing import Dict, Any, List, Optional, Tuple
from enum import Enum
import re
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ModelTier(Enum):
    """Tiers de modelos por complexidade e custo"""
    TIER_1 = "tier1"  # Fast: Llama 3.2, Gemini Flash
    TIER_2 = "tier2"  # Balanced: Claude Haiku, GPT-3.5
    TIER_3 = "tier3"  # Advanced: Claude Sonnet, GPT-4
    TIER_4 = "tier4"  # Premium: Claude Opus, GPT-4-turbo


class ComplexityAnalyzer:
    """Analisa complexidade de mensagens e conversas"""
    
    # Palavras-chave por categoria
    TECHNICAL_TERMS = {
        "api", "integração", "erro", "bug", "debug", "código", "programação",
        "database", "servidor", "configuração", "instalação", "atualização",
        "ssl", "certificado", "autenticação", "token", "webhook"
    }
    
    BUSINESS_TERMS = {
        "roi", "investimento", "orçamento", "proposta", "contrato", "negociação",
        "desconto", "enterprise", "corporativo", "personalizado", "consultoria"
    }
    
    SIMPLE_QUERIES = {
        "horário", "telefone", "endereço", "email", "contato", "localização",
        "preço", "valor", "custo", "plano", "funciona", "aberto", "fechado"
    }
    
    @staticmethod
    def analyze_message(message: str) -> Dict[str, Any]:
        """Analisa complexidade de uma mensagem"""
        
        message_lower = message.lower()
        
        # Métricas básicas
        word_count = len(message.split())
        char_count = len(message)
        question_count = message.count("?")
        
        # Análise de conteúdo
        has_technical = any(term in message_lower for term in ComplexityAnalyzer.TECHNICAL_TERMS)
        has_business = any(term in message_lower for term in ComplexityAnalyzer.BUSINESS_TERMS)
        is_simple = any(term in message_lower for term in ComplexityAnalyzer.SIMPLE_QUERIES)
        
        # Detectar código ou logs
        has_code = bool(re.search(r'```|def |class |function|{|}|\[\]|error:|exception:', message_lower))
        
        # Calcular score de complexidade (0-1)
        complexity_score = 0.0
        
        # Fatores de complexidade
        if word_count > 100:
            complexity_score += 0.2
        if has_technical:
            complexity_score += 0.3
        if has_business:
            complexity_score += 0.2
        if has_code:
            complexity_score += 0.3
        if question_count > 2:
            complexity_score += 0.1
        
        # Reduzir para queries simples
        if is_simple and word_count < 20:
            complexity_score *= 0.3
        
        complexity_score = min(complexity_score, 1.0)
        
        return {
            "score": complexity_score,
            "word_count": word_count,
            "has_technical": has_technical,
            "has_business": has_business,
            "has_code": has_code,
            "is_simple": is_simple
        }
    
    @staticmethod
    def analyze_conversation(messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """Analisa complexidade de uma conversa completa"""
        
        if not messages:
            return {"score": 0.0, "message_count": 0}
        
        # Analisar cada mensagem
        complexities = []
        total_words = 0
        
        for msg in messages:
            if msg.get("role") == "user":
                analysis = ComplexityAnalyzer.analyze_message(msg["content"])
                complexities.append(analysis["score"])
                total_words += analysis["word_count"]
        
        # Score médio ponderado
        avg_complexity = sum(complexities) / len(complexities) if complexities else 0
        
        # Ajustar baseado no tamanho da conversa
        if len(messages) > 10:
            avg_complexity += 0.1
        if total_words > 500:
            avg_complexity += 0.1
            
        return {
            "score": min(avg_complexity, 1.0),
            "message_count": len(messages),
            "total_words": total_words,
            "avg_message_complexity": avg_complexity
        }


class AIRouter:
    """Router inteligente para seleção de modelos"""
    
    def __init__(self):
        self.complexity_analyzer = ComplexityAnalyzer()
        
        # Configuração de roteamento
        self.routing_rules = {
            "greeting": ModelTier.TIER_1,
            "faq": ModelTier.TIER_1,
            "simple_info": ModelTier.TIER_1,
            "product_query": ModelTier.TIER_2,
            "pricing_query": ModelTier.TIER_2,
            "support_basic": ModelTier.TIER_2,
            "technical_support": ModelTier.TIER_3,
            "complex_query": ModelTier.TIER_3,
            "purchase_intent": ModelTier.TIER_3,
            "sales_negotiation": ModelTier.TIER_4,
            "high_value_lead": ModelTier.TIER_4,
            "enterprise_query": ModelTier.TIER_4
        }
        
    async def route_request(
        self,
        message: str,
        conversation_history: List[Dict[str, str]],
        user_context: Dict[str, Any],
        agent_config: Dict[str, Any]
    ) -> Tuple[ModelTier, Dict[str, Any]]:
        """Determina o melhor modelo para a requisição"""
        
        # 1. Analisar complexidade
        message_analysis = self.complexity_analyzer.analyze_message(message)
        conversation_analysis = self.complexity_analyzer.analyze_conversation(
            conversation_history + [{"role": "user", "content": message}]
        )
        
        # 2. Detectar intent
        intent = self._detect_intent(message, conversation_history)
        
        # 3. Considerar contexto do usuário
        user_tier = user_context.get("tier", "standard")
        user_value = user_context.get("lifetime_value", 0)
        is_vip = user_tier == "vip" or user_value > agent_config.get("vip_threshold", 10000)
        
        # 4. Aplicar regras de roteamento
        
        # Regra 1: Intent específico
        if intent in self.routing_rules:
            base_tier = self.routing_rules[intent]
        else:
            # Regra 2: Baseado em complexidade
            if conversation_analysis["score"] < 0.3:
                base_tier = ModelTier.TIER_1
            elif conversation_analysis["score"] < 0.6:
                base_tier = ModelTier.TIER_2
            elif conversation_analysis["score"] < 0.8:
                base_tier = ModelTier.TIER_3
            else:
                base_tier = ModelTier.TIER_4
        
        # 5. Ajustes baseados no usuário
        if is_vip and base_tier == ModelTier.TIER_1:
            # VIPs nunca recebem tier 1
            base_tier = ModelTier.TIER_2
        
        # 6. Considerar limites do plano
        max_tier = self._get_max_tier_for_plan(user_context.get("plan", "free"))
        if base_tier.value > max_tier.value:
            base_tier = max_tier
        
        # 7. Preparar metadados
        routing_metadata = {
            "selected_tier": base_tier.value,
            "intent": intent,
            "complexity_score": conversation_analysis["score"],
            "message_complexity": message_analysis,
            "is_vip": is_vip,
            "routing_reason": self._get_routing_reason(
                base_tier, intent, conversation_analysis["score"], is_vip
            )
        }
        
        logger.info(f"Routed to {base_tier.value}: {routing_metadata}")
        
        return base_tier, routing_metadata
    
    def _detect_intent(self, message: str, history: List[Dict[str, str]]) -> str:
        """Detecta intent considerando contexto"""
        
        message_lower = message.lower()
        
        # Verificar saudações
        if any(greeting in message_lower for greeting in ["oi", "olá", "bom dia", "boa tarde", "boa noite", "tudo bem"]):
            return "greeting"
        
        # FAQ simples
        if len(message.split()) < 10 and "?" in message:
            if any(word in message_lower for word in ["horário", "endereço", "telefone", "email"]):
                return "faq"
        
        # Queries de produto/preço
        if any(word in message_lower for word in ["preço", "custo", "valor", "plano", "pacote"]):
            if any(word in message_lower for word in ["enterprise", "corporativo", "personalizado"]):
                return "enterprise_query"
            return "pricing_query"
        
        # Suporte técnico
        if any(word in message_lower for word in ["erro", "problema", "bug", "não funciona", "travou"]):
            if self.complexity_analyzer.analyze_message(message)["has_code"]:
                return "technical_support"
            return "support_basic"
        
        # Intenção de compra
        if any(word in message_lower for word in ["comprar", "adquirir", "contratar", "assinar"]):
            # Verificar se é high-value pelo contexto
            if any(word in message_lower for word in ["empresa", "equipe", "usuários", "licenças"]):
                return "high_value_lead"
            return "purchase_intent"
        
        # Negociação
        if any(word in message_lower for word in ["desconto", "negociar", "proposta", "orçamento"]):
            return "sales_negotiation"
        
        # Análise do histórico
        if history:
            recent_intents = []
            for msg in history[-3:]:  # Últimas 3 mensagens
                if msg.get("metadata", {}).get("intent"):
                    recent_intents.append(msg["metadata"]["intent"])
            
            # Se estava em negociação, continuar
            if "sales_negotiation" in recent_intents:
                return "sales_negotiation"
        
        # Default baseado em complexidade
        complexity = self.complexity_analyzer.analyze_message(message)["score"]
        if complexity > 0.7:
            return "complex_query"
        
        return "general_query"
    
    def _get_max_tier_for_plan(self, plan: str) -> ModelTier:
        """Retorna tier máximo permitido para o plano"""
        
        plan_limits = {
            "free": ModelTier.TIER_1,
            "starter": ModelTier.TIER_2,
            "professional": ModelTier.TIER_3,
            "enterprise": ModelTier.TIER_4
        }
        
        return plan_limits.get(plan, ModelTier.TIER_2)
    
    def _get_routing_reason(
        self,
        tier: ModelTier,
        intent: str,
        complexity: float,
        is_vip: bool
    ) -> str:
        """Gera explicação do roteamento"""
        
        reasons = []
        
        if intent in self.routing_rules:
            reasons.append(f"Intent '{intent}' maps to {tier.value}")
        
        if complexity > 0.7:
            reasons.append(f"High complexity score: {complexity:.2f}")
        elif complexity < 0.3:
            reasons.append(f"Low complexity score: {complexity:.2f}")
        
        if is_vip:
            reasons.append("VIP customer upgrade applied")
        
        return " | ".join(reasons) if reasons else "Default routing"
