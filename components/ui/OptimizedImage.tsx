'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);

  // Handle placeholder or invalid URLs
  if (error || src === 'https://placeholder.example.com/media' || !src) {
    return (
      <div className={cn(
        "bg-gradient-to-br from-amber-600/20 to-orange-600/20 flex items-center justify-center",
        fill ? "absolute inset-0" : "",
        className
      )}>
        <Sparkles className="w-12 h-12 text-amber-400" />
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        onError={() => setError(true)}
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 300}
      className={className}
      onError={() => setError(true)}
      priority={priority}
    />
  );
}

