/**
 * CLAUDE CODE - Serviço OpenRouter Avançado
 * Implementação enterprise com rate limiting, caching e fallback
 */

import { z } from 'zod';
import pLimit from 'p-limit';

// Schemas de validação
export const ModelSchema = z.enum([
  'openai/gpt-4-turbo',
  'openai/gpt-4',
  'anthropic/claude-3-sonnet',
  'anthropic/claude-3-opus',
  'meta-llama/llama-3-70b',
  'google/gemini-pro',
  'openai/gpt-3.5-turbo'
]);

export const MessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string()
});

export type Model = z.infer<typeof ModelSchema>;
export type Message = z.infer<typeof MessageSchema>;

interface ModelConfig {
  costPer1kTokens: number;
  maxTokens: number;
  strengths: string[];
  optimalFor: string[];
}

export class OpenRouterAdvanced {
  private apiKey: string;
  private baseUrl: string;
  private rateLimiter: any;
  private cache: Map<string, any> = new Map();
  
  // Configuração de modelos com custos e capacidades
  private modelConfigs: Record<Model, ModelConfig> = {
    'openai/gpt-4-turbo': {
      costPer1kTokens: 0.01,
      maxTokens: 128000,
      strengths: ['reasoning', 'coding', 'analysis'],
      optimalFor: ['complex-tasks', 'code-generation']
    },
    'anthropic/claude-3-sonnet': {
      costPer1kTokens: 0.003,
      maxTokens: 200000,
      strengths: ['writing', 'analysis', 'safety'],
      optimalFor: ['content-creation', 'summarization']
    },
    'openai/gpt-3.5-turbo': {
      costPer1kTokens: 0.0005,
      maxTokens: 16000,
      strengths: ['speed', 'cost-effective'],
      optimalFor: ['simple-queries', 'high-volume']
    },
    // ... outros modelos
  };

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY!;
    this.baseUrl = process.env.OPENROUTER_BASE_URL!;
    
    // Rate limiter baseado no ambiente
    const rateLimit = parseInt(process.env.RATE_LIMIT_PER_MINUTE || '60');
    this.rateLimiter = pLimit(rateLimit);
  }

  /**
   * Seleciona o modelo ideal baseado no contexto
   */
  selectOptimalModel(params: {
    task: string;
    budget?: number;
    quality?: 'low' | 'medium' | 'high';
    speed?: 'slow' | 'medium' | 'fast';
  }): Model {
    const { task, budget = Infinity, quality = 'medium', speed = 'medium' } = params;
    
    // Lógica de seleção inteligente
    if (task.includes('code') || task.includes('debug')) {
      return quality === 'high' ? 'openai/gpt-4-turbo' : 'openai/gpt-3.5-turbo';
    }
    
    if (task.includes('write') || task.includes('content')) {
      return 'anthropic/claude-3-sonnet';
    }
    
    if (budget < 0.01 || speed === 'fast') {
      return 'openai/gpt-3.5-turbo';
    }
    
    return 'openai/gpt-4-turbo'; // Default para alta qualidade
  }

  /**
   * Executa chat com rate limiting e caching
   */
  async chat(params: {
    messages: Message[];
    model?: Model;
    temperature?: number;
    maxTokens?: number;
    task?: string;
  }) {
    // Cache check
    const cacheKey = JSON.stringify(params);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Seleção automática de modelo se não especificado
    const model = params.model || this.selectOptimalModel({
      task: params.task || 'general'
    });
    
    // Rate limiting
    const response = await this.rateLimiter(async () => {
      return fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://agentesconversao.ai',
          'X-Title': 'Agentes de Conversão'
        },
        body: JSON.stringify({
          model,
          messages: params.messages,
          temperature: params.temperature || 0.7,
          max_tokens: params.maxTokens || this.modelConfigs[model].maxTokens,
          stream: false
        })
      });
    });

    if (!response.ok) {
      // Fallback para modelo mais barato em caso de erro
      if (model !== 'openai/gpt-3.5-turbo') {
        return this.chat({
          ...params,
          model: 'openai/gpt-3.5-turbo'
        });
      }
      throw new Error(`OpenRouter error: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Cache por 5 minutos
    this.cache.set(cacheKey, result);
    setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
    
    return result;
  }

  /**
   * Estima custo de uma operação
   */
  estimateCost(model: Model, estimatedTokens: number): number {
    const config = this.modelConfigs[model];
    return (estimatedTokens / 1000) * config.costPer1kTokens;
  }

  /**
   * Monitora uso e custos
   */
  async getUsageStats(): Promise<{
    tokensUsed: number;
    costUSD: number;
    requestCount: number;
  }> {
    // Implementar integração com API de billing quando disponível
    return {
      tokensUsed: 0,
      costUSD: 0,
      requestCount: 0
    };
  }
}

// Singleton para uso global
export const openRouter = new OpenRouterAdvanced();
