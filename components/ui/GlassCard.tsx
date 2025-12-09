'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  enhanced?: boolean;
}

export default function GlassCard({ 
  children, 
  className, 
  hover = false,
  enhanced = false 
}: GlassCardProps) {
  const baseClass = enhanced ? 'glass-enhanced' : 'glass';
  const hoverClass = hover ? 'glass-enhanced-hover' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        'rounded-xl p-6',
        baseClass,
        hoverClass,
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function GlassCardGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid gap-6', className)}>
      {children}
    </div>
  );
}
