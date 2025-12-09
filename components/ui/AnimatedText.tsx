'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedTextProps {
  children: string;
  className?: string;
  variant?: 'fade' | 'slide' | 'scale';
  delay?: number;
  stagger?: number;
}

export default function AnimatedText({ 
  children, 
  className = '', 
  variant = 'fade',
  delay = 0,
  stagger = 0.03
}: AnimatedTextProps) {
  const words = children.split(' ');

  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    slide: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    }
  };

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          className="inline-block"
          variants={variants[variant]}
          transition={{ duration: 0.5 }}
        >
          {word}
          {idx < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function AnimatedHeading({ 
  children, 
  className = '',
  as: Component = 'h2' 
}: { 
  children: string; 
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}) {
  return (
    <Component className={className}>
      <AnimatedText variant="slide" stagger={0.05}>
        {children}
      </AnimatedText>
    </Component>
  );
}
