'use client';

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { MouseEvent, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'glow' | 'magnetic';
  className?: string;
}

export default function Button({ children, variant = 'primary', className, ...props }: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const buttonX = useMotionValue(0);
  const buttonY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    
    mouseX.set(x);
    mouseY.set(y);

    // Magnetic effect for magnetic variant
    if (variant === 'magnetic') {
      const centerX = width / 2;
      const centerY = height / 2;
      const distX = x - centerX;
      const distY = y - centerY;
      
      buttonX.set(distX * 0.2);
      buttonY.set(distY * 0.2);
    }
  }

  function handleMouseLeave() {
    if (variant === 'magnetic') {
      buttonX.set(0);
      buttonY.set(0);
    }
  }

  const baseStyles = "relative group px-8 py-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden";
  
  const variants = {
    primary: "bg-amber-500 text-white hover:shadow-lg hover:shadow-amber-500/25",
    secondary: "bg-slate-900 text-white border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800",
    outline: "border border-slate-700 text-slate-300 hover:text-white hover:border-amber-500",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50",
    glow: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-[1.02]",
    magnetic: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-xl"
  };

  if (variant === 'magnetic') {
    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ x: buttonX, y: buttonY }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        {...(props as any)}
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
      </motion.button>
    );
  }

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
