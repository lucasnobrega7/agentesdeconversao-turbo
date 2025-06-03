'use client';

import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

interface MotionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover-lift' | 'hover-glow' | 'hover-tilt' | 'clickable';
  children: React.ReactNode;
  onClick?: () => void;
}

export function MotionCard({
  variant = 'default',
  className,
  children,
  onClick,
  ...props
}: MotionCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7.5deg', '-7.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7.5deg', '7.5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (variant !== 'hover-tilt') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const variants = {
    default: {
      whileHover: { scale: 1.02 },
      whileTap: onClick ? { scale: 0.98 } : {},
    },
    'hover-lift': {
      whileHover: { y: -8, transition: { duration: 0.3 } },
      whileTap: onClick ? { scale: 0.98 } : {},
    },
    'hover-glow': {
      whileHover: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(59, 130, 246, 0.5)',
        transition: { duration: 0.3 },
      },
      whileTap: onClick ? { scale: 0.98 } : {},
    },
    'hover-tilt': {
      style: { rotateX, rotateY, transformStyle: 'preserve-3d' as any },
      whileHover: { z: 20 },
      whileTap: onClick ? { scale: 0.98 } : {},
    },
    clickable: {
      whileHover: { scale: 1.02, boxShadow: '0 10px 30px -15px rgba(0, 0, 0, 0.2)' },
      whileTap: { scale: 0.95, boxShadow: '0 5px 15px -10px rgba(0, 0, 0, 0.2)' },
    },
  };

  return (
    <motion.div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      {...(variants[variant] as any)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionCardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionCardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <motion.h3
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </motion.h3>
  );
}

export function MotionCardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </motion.p>
  );
}

export function MotionCardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className={cn('p-6 pt-0', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionCardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
