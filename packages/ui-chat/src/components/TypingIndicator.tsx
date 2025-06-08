'use client';

import React from 'react';
import { motion } from 'motion/react';

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 px-4 py-2">
      <div className="flex space-x-1 bg-gray-100 rounded-full px-3 py-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="h-2 w-2 bg-gray-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}
