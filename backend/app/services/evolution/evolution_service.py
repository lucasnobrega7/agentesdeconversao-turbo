"""
Evolution API Service
Documentação: https://doc.evolution-api.com/
Railway Template: https://railway.app/new/template/LK1WXD
"""

import httpx
from typing import Dict, Any, Optional
import os
from pydantic import BaseModel

class EvolutionConfig(BaseModel):
    """Configuração da Evolution API"""
    base_url: str = os.getenv("EVOLUTION_API_URL", "http://localhost:8080")
    api_key: str = os.getenv("EVOLUTION_API_KEY", "")
    instance_name: str = "agentes-conversao"

class WhatsAppMessage(BaseModel):
    """Modelo de mensagem do WhatsApp"""
    from_number: str
    to_number: str
    message: str
    media_url: Optional[str] = None

class EvolutionService:
    """Serviço para integração com Evolution API"""
    
    def __init__(self):
        self.config = EvolutionConfig()
        self.client = httpx.AsyncClient(
            base_url=self.config.base_url,
            headers={
                "apikey": self.config.api_key,
                "Content-Type": "application/json"
            }
        )
    
    async def create_instance(self) -> Dict[str, Any]:
        """Criar nova instância WhatsApp"""
        response = await self.client.post(
            "/instance/create",
            json={
                "instanceName": self.config.instance_name,
                "integration": "WHATSAPP-BAILEYS",
                "qrcode": True,
                "webhookUrl": f"{os.getenv('APP_URL')}/webhooks/whatsapp"
            }
        )
        return response.json()
    
    async def get_qr_code(self) -> Dict[str, Any]:
        """Obter QR Code para conexão"""
        response = await self.client.get(
            f"/instance/qrcode/{self.config.instance_name}"
        )
        return response.json()
    
    async def send_message(self, message: WhatsAppMessage) -> Dict[str, Any]:
        """Enviar mensagem via WhatsApp"""
        payload = {
            "number": message.to_number,
            "text": message.message
        }
        
        if message.media_url:
            payload["mediaUrl"] = message.media_url
            
        response = await self.client.post(
            f"/message/sendText/{self.config.instance_name}",
            json=payload
        )
        return response.json()
    
    async def webhook_handler(self, data: Dict[str, Any]) -> None:
        """Processar webhook da Evolution API"""
        event_type = data.get("event")
        
        if event_type == "messages.upsert":
            # Nova mensagem recebida
            message = data.get("data", {}).get("message", {})
            from_number = message.get("from")
            text = message.get("conversation") or message.get("extendedTextMessage", {}).get("text", "")
            
            # Processar mensagem com IA
            await self.process_incoming_message(from_number, text)
    
    async def process_incoming_message(self, from_number: str, text: str):
        """Processar mensagem recebida e responder com IA"""
        # Aqui integra com o AgentService para processar
        pass

# Instância global
evolution_service = EvolutionService()
