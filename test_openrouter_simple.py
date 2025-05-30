#!/usr/bin/env python3
import requests
import json

# Sua chave do OpenRouter
API_KEY = "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"

print("=== TESTE OPENROUTER ===")

# 1. Teste simples de conexao
try:
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Verificar modelos disponiveis
    response = requests.get(
        "https://openrouter.ai/api/v1/models",
        headers=headers
    )
    
    if response.status_code == 200:
        models = response.json()
        print(f"✅ API conectada! Total de modelos: {len(models.get('data', []))}")
        
        # Mostrar alguns modelos baratos
        print("\n💰 Modelos mais baratos para testar:")
        cheap_models = sorted(
            models['data'], 
            key=lambda x: x.get('pricing', {}).get('prompt', 999)
        )[:5]
        
        for model in cheap_models:
            price = model.get('pricing', {}).get('prompt', 0) * 1000000
            print(f"  • {model['id']}: ${price:.2f}/1M tokens")
    else:
        print(f"❌ Erro: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"❌ Erro: {str(e)}")

# 2. Teste de geracao rapida
print("\n🧪 Testando geracao de texto...")
try:
    data = {
        "model": "openai/gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": "Voce e um vendedor expert"},
            {"role": "user", "content": "Me de uma frase de venda matadora em 10 palavras"}
        ],
        "max_tokens": 50
    }
    
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=data
    )
    
    if response.status_code == 200:
        result = response.json()
        content = result['choices'][0]['message']['content']
        print(f"✅ Resposta: {content}")
        
        usage = result.get('usage', {})
        tokens = usage.get('total_tokens', 0)
        print(f"   Tokens usados: {tokens}")
    else:
        print(f"❌ Erro: {response.status_code}")
        
except Exception as e:
    print(f"❌ Erro: {str(e)}")

print("\n✅ Teste concluido!")
