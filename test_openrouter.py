#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test OpenRouter API connection with real key
"""
import asyncio
import httpx
import json
import os
import sys
from datetime import datetime

# Fix encoding issues
if sys.version_info[0] >= 3:
    os.environ['PYTHONIOENCODING'] = 'utf-8'

OPENROUTER_API_KEY = "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"
OPENROUTER_API_URL = "https://openrouter.ai/api/v1"

async def test_openrouter():
    print("🔍 Testando conexão com OpenRouter...")
    print("=" * 50)
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://agentesdeconversao.ai",
        "X-Title": "Agentes de Conversão"
    }
    
    # 1. Testar listagem de modelos
    print("\n📋 Verificando modelos disponíveis...")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{OPENROUTER_API_URL}/models",
                headers=headers
            )
            if response.status_code == 200:
                models = response.json()
                print(f"✅ API conectada! {len(models.get('data', []))} modelos disponíveis")
                
                # Mostrar alguns modelos top
                top_models = [
                    "openai/gpt-4-turbo",
                    "anthropic/claude-3-opus",
                    "google/gemini-pro",
                    "mistralai/mixtral-8x7b-instruct"
                ]
                
                print("\n🤖 Modelos recomendados para Agentes:")
                for model_id in top_models:
                    model = next((m for m in models['data'] if m['id'] == model_id), None)
                    if model:
                        price_per_1k = model.get('pricing', {})
                        print(f"  • {model_id}: ${price_per_1k.get('prompt', 0)*1000:.2f}/1k tokens")
            else:
                print(f"❌ Erro na API: {response.status_code}")
                print(f"   Resposta: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Erro de conexão: {str(e)}")
            return False
    
    # 2. Testar uma completação simples
    print("\n🧪 Testando geração de texto...")
    async with httpx.AsyncClient() as client:
        try:
            payload = {
                "model": "openai/gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": "Você é um agente de conversão especializado em vendas."
                    },
                    {
                        "role": "user",
                        "content": "Me dê uma frase de abertura matadora para vender um curso de marketing digital"
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 150
            }
            
            response = await client.post(
                f"{OPENROUTER_API_URL}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                print(f"✅ Resposta do modelo:")
                print(f"   '{content[:100]}...'")
                
                # Mostrar custo
                usage = result.get('usage', {})
                print(f"\n💰 Custo do teste:")
                print(f"   • Tokens usados: {usage.get('total_tokens', 0)}")
                print(f"   • Custo estimado: ~${usage.get('total_tokens', 0) * 0.0000015:.6f}")
                
                return True
            else:
                print(f"❌ Erro na geração: {response.status_code}")
                print(f"   Resposta: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Erro ao gerar texto: {str(e)}")
            return False
    
    print("\n" + "=" * 50)
    print("✅ OPENROUTER PRONTO PARA USO!")
    print("=" * 50)
    return True

if __name__ == "__main__":
    success = asyncio.run(test_openrouter())
    exit(0 if success else 1)
