'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MouseEvent, ReactNode, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  glare?: boolean;
}

export default function TiltCard({ 
  children, 
  className,
  tiltAmount = 15,
  glare = true 
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [tiltAmount, -tiltAmount]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-tiltAmount, tiltAmount]);

  const glareOpacity = useTransform(
    [mouseXSpring, mouseYSpring],
    ([latestX, latestY]) => {
      const distance = Math.sqrt((latestX as number) ** 2 + (latestY as number) ** 2);
      return Math.min(distance * 0.3, 0.3);
    }
  );

  const glarePosition = useTransform(
    [mouseXSpring, mouseYSpring],
    ([latestX, latestY]) => {
      return {
        x: (latestX as number + 0.5) * 100,
        y: (latestY as number + 0.5) * 100,
      };
    }
  );

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={cn('relative', className)}
    >
      {children}
      {glare && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-inherit"
          style={{
            background: useTransform(
              glarePosition,
              (pos: any) =>
                `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)`
            ),
            opacity: glareOpacity,
          }}
        />
      )}
    </motion.div>
  );
}
