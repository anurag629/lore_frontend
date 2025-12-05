'use client';

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { MouseEvent } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  className?: string;
}

export default function Button({ children, variant = 'primary', className, ...props }: ButtonProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const baseStyles = "relative group px-8 py-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden";
  
  const variants = {
    primary: "bg-amber-500 text-white hover:shadow-lg hover:shadow-amber-500/25",
    secondary: "bg-slate-900 text-white border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800",
    outline: "border border-slate-700 text-slate-300 hover:text-white hover:border-amber-500",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(245, 158, 11, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
