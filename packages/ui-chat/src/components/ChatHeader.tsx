'use client';

import React from 'react';
import { motion } from 'motion/react';
import { X, Minimize2, Maximize2 } from 'lucide-react';

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
}

export function ChatHeader({ 
  title = "Assistente Virtual", 
  subtitle = "Online agora",
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm opacity-90">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {onMinimize && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMinimize}
            className="rounded-full p-1 hover:bg-white/20 transition-colors"
            aria-label="Minimizar chat"
          >
            <Minimize2 className="h-4 w-4" />
          </motion.button>
        )}
        {onMaximize && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMaximize}
            className="rounded-full p-1 hover:bg-white/20 transition-colors"
            aria-label={isMaximized ? "Restaurar tamanho" : "Maximizar chat"}
          >
            <Maximize2 className="h-4 w-4" />
          </motion.button>
        )}
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/20 transition-colors"
            aria-label="Fechar chat"
          >
            <X className="h-5 w-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
