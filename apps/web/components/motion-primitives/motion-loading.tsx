'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface MotionLoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ripple';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  text?: string;
}

export function MotionLoading({
  variant = 'spinner',
  size = 'md',
  color = 'currentColor',
  className,
  text
}: MotionLoadingProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const containerClasses = cn(
    'flex flex-col items-center justify-center gap-3',
    className
  );

  return (
    <div className={containerClasses}>
      {variant === 'spinner' && (
        <motion.div
          className={cn('border-2 border-current border-t-transparent rounded-full', sizes[size])}
          style={{ borderTopColor: 'transparent', borderColor: color }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {variant === 'dots' && (
        <div className="flex gap-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={cn('rounded-full bg-current', size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : size === 'lg' ? 'h-3 w-3' : 'h-4 w-4')}
              style={{ backgroundColor: color }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
      )}

      {variant === 'pulse' && (
        <motion.div
          className={cn('rounded-full bg-current', sizes[size])}
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {variant === 'bars' && (
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={index}
              className={cn('bg-current', size === 'sm' ? 'h-4 w-1' : size === 'md' ? 'h-8 w-1.5' : size === 'lg' ? 'h-12 w-2' : 'h-16 w-2.5')}
              style={{ backgroundColor: color }}
              animate={{
                scaleY: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.15,
              }}
            />
          ))}
        </div>
      )}

      {variant === 'ripple' && (
        <div className={cn('relative', sizes[size])}>
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: color }}
              animate={{
                scale: [1, 2.5],
                opacity: [1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.6,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground mt-2"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// Loading overlay component
export function MotionLoadingOverlay({
  visible,
  children,
  variant = 'spinner',
  text,
}: {
  visible: boolean;
  children?: React.ReactNode;
  variant?: MotionLoadingProps['variant'];
  text?: string;
}) {
  return (
    <>
      {children}
      <motion.div
        initial={false}
        animate={{
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
        }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <MotionLoading variant={variant} size="lg" text={text} />
      </motion.div>
    </>
  );
}

// Page loading component
export function MotionPageLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <MotionLoading variant="ripple" size="xl" />
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-lg font-semibold"
        >
          Carregando...
        </motion.h2>
      </motion.div>
    </motion.div>
  );
}
