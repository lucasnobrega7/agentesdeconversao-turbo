import { useState, useCallback } from 'react';
import { ChatMessageType } from '../components/ChatMessage';

interface UseChatMessagesOptions {
  initialMessages?: ChatMessageType[];
  maxMessages?: number;
}

export function useChatMessages({
  initialMessages = [],
  maxMessages = 100
}: UseChatMessagesOptions = {}) {
  const [messages, setMessages] = useState<ChatMessageType[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((message: Omit<ChatMessageType, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessageType = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      // Limitar número de mensagens
      if (updated.length > maxMessages) {
        return updated.slice(-maxMessages);
      }
      return updated;
    });

    return newMessage;
  }, [maxMessages]);

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessageType>) => {
    setMessages(prev => 
      prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg)
    );
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    setIsLoading(true);
    
    // Adicionar mensagem do usuário
    const userMessage = addMessage({
      text,
      sender: 'user'
    });

    try {
      // Simular resposta do agente
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addMessage({
        text: 'Esta é uma resposta simulada do agente.',
        sender: 'agent'
      });
    } catch (error) {
      updateMessage(userMessage.id, { status: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, updateMessage]);

  return {
    messages,
    isLoading,
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    sendMessage
  };
}
