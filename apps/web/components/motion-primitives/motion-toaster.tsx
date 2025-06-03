'use client';

import React from 'react';
import { Toaster as Sonner } from 'sonner';
import { motion } from 'motion/react';

export function MotionToaster() {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-zinc-950 group-[.toaster]:border-zinc-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-zinc-950 dark:group-[.toaster]:text-zinc-50 dark:group-[.toaster]:border-zinc-800',
          description: 'group-[.toast]:text-zinc-500 dark:group-[.toast]:text-zinc-400',
          actionButton:
            'group-[.toast]:bg-zinc-900 group-[.toast]:text-zinc-50 dark:group-[.toast]:bg-zinc-50 dark:group-[.toast]:text-zinc-900',
          cancelButton:
            'group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-500 dark:group-[.toast]:bg-zinc-800 dark:group-[.toast]:text-zinc-400',
        },
      }}
      expand={false}
      richColors
      closeButton
    />
  );
}

// Toast helper functions com animações Motion
export const toast = {
  success: (message: string, description?: string) => {
    return Sonner.success(
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="font-semibold">{message}</div>
        {description && <div className="text-sm mt-1">{description}</div>}
      </motion.div>
    );
  },
  error: (message: string, description?: string) => {
    return Sonner.error(
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="font-semibold">{message}</div>
        {description && <div className="text-sm mt-1">{description}</div>}
      </motion.div>
    );
  },
  info: (message: string, description?: string) => {
    return Sonner.info(
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="font-semibold">{message}</div>
        {description && <div className="text-sm mt-1">{description}</div>}
      </motion.div>
    );
  },
  loading: (message: string) => {
    return Sonner.loading(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-4 w-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full"
        />
        <span>{message}</span>
      </motion.div>
    );
  },
};
