import { useState, useEffect, useCallback } from 'react';

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
}

interface UseChatConnectionOptions {
  apiKey: string;
  agentId: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useChatConnection({
  apiKey,
  agentId,
  onConnect,
  onDisconnect,
  onError
}: UseChatConnectionOptions) {
  const [state, setState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null
  });

  const connect = useCallback(() => {
    setState({ isConnected: false, isConnecting: true, error: null });
    
    // Simular conexão
    setTimeout(() => {
      setState({ isConnected: true, isConnecting: false, error: null });
      onConnect?.();
    }, 1000);
  }, [onConnect]);

  const disconnect = useCallback(() => {
    setState({ isConnected: false, isConnecting: false, error: null });
    onDisconnect?.();
  }, [onDisconnect]);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect
  };
}
