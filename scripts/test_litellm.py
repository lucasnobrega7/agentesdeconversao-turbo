#!/usr/bin/env python3
"""
Script de teste para verificar funcionamento do LiteLLM Gateway
"""

import asyncio
import httpx
import json
import os
from datetime import datetime

# Configurações
LITELLM_URL = os.getenv("LITELLM_URL", "http://localhost:4000")
LITELLM_API_KEY = os.getenv("LITELLM_MASTER_KEY", "sk-master-dev")

async def test_health():
    """Testa endpoint de health"""
    print("🔍 Testando health check...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{LITELLM_URL}/health")
            if response.status_code == 200:
                print("✅ Health check OK")
                print(f"   Response: {response.json()}")
            else:
                print(f"❌ Health check falhou: {response.status_code}")
        except Exception as e:
            print(f"❌ Erro ao conectar: {e}")
            return False
    
    return True

async def test_list_models():
    """Testa listagem de modelos"""
    print("\n🔍 Listando modelos disponíveis...")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{LITELLM_URL}/ai/models",
            headers={"Authorization": f"Bearer {LITELLM_API_KEY}"}
        )
        
        if response.status_code == 200:
            models = response.json()["data"]
            print(f"✅ {len(models)} modelos disponíveis:")
            for model in models:
                print(f"   - {model['id']} (Tier {model['tier']}): {model['description']}")
        else:
            print(f"❌ Erro ao listar modelos: {response.status_code}")

async def test_chat_completion(tier="tier1"):
    """Testa chat completion"""
    print(f"\n🔍 Testando chat completion com {tier}...")
    
    messages = [
        {"role": "system", "content": "Você é um assistente útil e conciso."},
        {"role": "user", "content": "Olá! Me diga em uma frase: qual é a capital do Brasil?"}
    ]
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{LITELLM_URL}/ai/chat/completions",
            headers={
                "Authorization": f"Bearer {LITELLM_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "messages": messages,
                "metadata": {
                    "organization_id": "test_org",
                    "user_id": "test_user",
                    "preferred_tier": tier
                },
                "temperature": 0.7,
                "max_tokens": 100
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Resposta recebida:")
            print(f"   Modelo usado: {data.get('model', 'unknown')}")
            print(f"   Resposta: {data['choices'][0]['message']['content']}")
            
            if "usage" in data:
                usage = data["usage"]
                print(f"   Tokens: {usage.get('total_tokens', 0)} total")
        else:
            print(f"❌ Erro na completion: {response.status_code}")
            print(f"   Response: {response.text}")

async def test_streaming():
    """Testa streaming de respostas"""
    print("\n🔍 Testando streaming...")
    
    messages = [
        {"role": "user", "content": "Conte uma piada curta sobre programação"}
    ]
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{LITELLM_URL}/ai/chat/completions",
            headers={
                "Authorization": f"Bearer {LITELLM_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "messages": messages,
                "stream": True,
                "metadata": {
                    "organization_id": "test_org"
                }
            }
        )
        
        if response.status_code == 200:
            print("✅ Streaming iniciado:")
            print("   Resposta: ", end="", flush=True)
            
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    data = line[6:]
                    if data == "[DONE]":
                        print("\n   ✅ Streaming concluído")
                        break
                    
                    try:
                        chunk = json.loads(data)
                        if "choices" in chunk and chunk["choices"]:
                            content = chunk["choices"][0].get("delta", {}).get("content", "")
                            print(content, end="", flush=True)
                    except json.JSONDecodeError:
                        pass
        else:
            print(f"❌ Erro no streaming: {response.status_code}")

async def test_routing():
    """Testa roteamento inteligente"""
    print("\n🔍 Testando roteamento inteligente...")
    
    test_cases = [
        {
            "name": "Saudação simples",
            "message": "Oi!",
            "expected_tier": "tier1"
        },
        {
            "name": "Suporte técnico",
            "message": "Estou com erro 500 na API quando faço POST no endpoint /users",
            "expected_tier": "tier2"
        },
        {
            "name": "Query complexa",
            "message": "Preciso de ajuda para implementar um sistema de autenticação OAuth2 com refresh tokens e suporte a múltiplos provedores",
            "expected_tier": "tier3"
        }
    ]
    
    for test in test_cases:
        print(f"\n   📝 Teste: {test['name']}")
        print(f"   Mensagem: {test['message']}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{LITELLM_URL}/ai/chat/completions",
                headers={
                    "Authorization": f"Bearer {LITELLM_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "messages": [
                        {"role": "user", "content": test['message']}
                    ],
                    "metadata": {
                        "organization_id": "test_org",
                        "test_routing": True
                    },
                    "max_tokens": 50
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                model = data.get("model", "unknown")
                tier = model.split("/")[0] if "/" in model else "unknown"
                
                print(f"   Modelo usado: {model}")
                print(f"   Tier detectado: {tier}")
                
                if tier == test["expected_tier"]:
                    print(f"   ✅ Roteamento correto!")
                else:
                    print(f"   ⚠️  Esperado {test['expected_tier']}, recebido {tier}")

async def test_usage_stats():
    """Testa estatísticas de uso"""
    print("\n🔍 Testando estatísticas de uso...")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{LITELLM_URL}/ai/usage",
            headers={"Authorization": f"Bearer {LITELLM_API_KEY}"},
            params={
                "organization_id": "test_org",
                "start_date": "2024-01-01",
                "end_date": datetime.now().isoformat()
            }
        )
        
        if response.status_code == 200:
            usage = response.json()
            print("✅ Estatísticas obtidas:")
            print(f"   Total de requisições: {usage['summary']['total_requests']}")
            print(f"   Total de tokens: {usage['summary']['total_tokens']}")
            print(f"   Custo total: ${usage['summary']['total_cost']:.4f}")
        else:
            print(f"❌ Erro ao obter estatísticas: {response.status_code}")

async def main():
    """Executa todos os testes"""
    print("🚀 Iniciando testes do LiteLLM Gateway")
    print(f"   URL: {LITELLM_URL}")
    print(f"   API Key: {LITELLM_API_KEY[:10]}...")
    
    # Testa health primeiro
    if not await test_health():
        print("\n❌ LiteLLM não está respondendo. Verifique se o serviço está rodando.")
        return
    
    # Executa outros testes
    await test_list_models()
    await test_chat_completion("tier1")
    await test_chat_completion("tier2")
    await test_streaming()
    await test_routing()
    await test_usage_stats()
    
    print("\n✅ Testes concluídos!")

if __name__ == "__main__":
    asyncio.run(main())
