'use client';

import React from 'react';
import { motion } from 'motion/react';

interface ChatBubbleProps {
  message: string;
  isUser?: boolean;
  timestamp?: string;
}

export function ChatBubble({ message, isUser = false, timestamp }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{message}</p>
        {timestamp && (
          <p className="text-xs mt-1 opacity-70">{timestamp}</p>
        )}
      </div>
    </motion.div>
  );
}
