'use client';

import React from 'react';
import { motion } from 'motion/react';

export interface ChatMessageType {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp?: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isUser ? 20 : -20 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          } ${message.status === 'error' ? 'ring-2 ring-red-500' : ''}`}
        >
          <p className="text-sm">{message.text}</p>
        </div>
        {message.timestamp && (
          <p className="text-xs text-gray-500 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        )}
        {message.status === 'error' && (
          <p className="text-xs text-red-500 mt-1">Erro ao enviar mensagem</p>
        )}
      </div>
    </motion.div>
  );
}
