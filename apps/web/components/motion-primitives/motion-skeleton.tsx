'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface MotionSkeletonProps {
  className?: string;
  variant?: 'pulse' | 'shimmer' | 'wave';
  duration?: number;
  children?: React.ReactNode;
}

export function MotionSkeleton({
  className,
  variant = 'shimmer',
  duration = 1.5,
  children
}: MotionSkeletonProps) {
  const baseClasses = 'relative overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800';

  const variants = {
    pulse: {
      initial: { opacity: 0.7 },
      animate: {
        opacity: [0.7, 1, 0.7],
        transition: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
    shimmer: {
      initial: {},
      animate: {},
    },
    wave: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.02, 1],
        opacity: [0.7, 1, 0.7],
        transition: {
          duration: duration * 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
  };

  return (
    <motion.div
      className={cn(baseClasses, className)}
      initial={variants[variant].initial}
      animate={variants[variant].animate}
    >
      {variant === 'shimmer' && (
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            translateX: ['100%', '-100%'],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
      {children}
    </motion.div>
  );
}

// Variantes pré-definidas para casos comuns
export const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <MotionSkeleton
        key={i}
        className={cn('h-4', i === lines - 1 && 'w-3/4')}
        variant="shimmer"
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className }: { className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={cn('space-y-3', className)}
  >
    <MotionSkeleton className="h-32 w-full" variant="shimmer" />
    <SkeletonText lines={2} />
  </motion.div>
);

export const SkeletonAvatar = ({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <MotionSkeleton
      className={cn('rounded-full', sizes[size], className)}
      variant="pulse"
    />
  );
};

export const SkeletonButton = ({ className }: { className?: string }) => (
  <MotionSkeleton
    className={cn('h-10 w-24 rounded-md', className)}
    variant="wave"
  />
);
