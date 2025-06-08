import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { ChatMessage, ModelTier } from '@agentes/types';

interface ChatInterfaceProps {
  conversationId: string;
  agentName: string;
  enableStreaming?: boolean;
}

export function ChatInterface({ 
  conversationId, 
  agentName,
  enableStreaming = true 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<ModelTier | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (enableStreaming) {
        await sendStreamingMessage(userMessage);
      } else {
        await sendRegularMessage(userMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendRegularMessage = async (userMessage: ChatMessage) => {
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        content: userMessage.content
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const data = await response.json();
    
    // Update model info from response
    if (data.metadata?.model) {
      setCurrentModel(data.metadata.model);
    }
    if (data.metadata?.routing?.selected_tier) {
      setCurrentTier(data.metadata.routing.selected_tier);
    }

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: data.content
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  const sendStreamingMessage = async (userMessage: ChatMessage) => {
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    const response = await fetch(`/api/conversations/${conversationId}/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        content: userMessage.content
      }),
      signal: abortControllerRef.current.signal
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    let assistantMessage: ChatMessage = {
      role: 'assistant',
      content: ''
    };
    
    // Add empty assistant message to show streaming
    setMessages(prev => [...prev, assistantMessage]);
    const messageIndex = messages.length + 1;

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            
            if (parsed.type === 'content') {
              assistantMessage.content += parsed.content;
              
              // Update message in state
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[messageIndex] = { ...assistantMessage };
                return newMessages;
              });
            } else if (parsed.type === 'metadata') {
              if (parsed.model) setCurrentModel(parsed.model);
              if (parsed.tier) setCurrentTier(parsed.tier);
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  };

  const cancelStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const getTierColor = (tier: ModelTier | null) => {
    if (!tier) return 'text-gray-500';
    
    switch (tier) {
      case ModelTier.TIER_1:
        return 'text-green-500';
      case ModelTier.TIER_2:
        return 'text-blue-500';
      case ModelTier.TIER_3:
        return 'text-purple-500';
      case ModelTier.TIER_4:
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Model Info Bar */}
      {currentModel && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-sm flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">
            Modelo: <span className="font-medium">{currentModel}</span>
          </span>
          {currentTier && (
            <span className={`font-medium ${getTierColor(currentTier)}`}>
              {currentTier.toUpperCase()}
            </span>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Olá! Sou {agentName}. Como posso ajudar você hoje?</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
            )}
            
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-700" />
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t dark:border-gray-800 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
            disabled={isLoading}
          />
          
          {isLoading && enableStreaming ? (
            <button
              type="button"
              onClick={cancelStream}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Cancelar
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          )}
        </form>

        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {enableStreaming ? 'Streaming habilitado' : 'Streaming desabilitado'} • 
          Powered by LiteLLM Gateway
        </div>
      </div>
    </div>
  );
}
