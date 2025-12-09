'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height 
}: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%'),
  };

  return (
    <div
      className={cn('skeleton', variantStyles[variant], className)}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <Skeleton variant="rectangular" height={200} />
      <div className="space-y-2">
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="30%" />
        </div>
      </div>
    </div>
  );
}

export function AssetCardSkeleton() {  return (    <div className="glass rounded-xl overflow-hidden">      <Skeleton variant="rectangular" height={250} className="w-full" />      <div className="p-4 space-y-3">        <Skeleton variant="text" width="80%" height={24} />        <Skeleton variant="text" width="60%" />        <div className="flex items-center justify-between mt-4">          <div className="flex items-center gap-2">            <Skeleton variant="circular" width={32} height={32} />            <Skeleton variant="text" width={80} />          </div>          <Skeleton variant="text" width={60} />        </div>      </div>    </div>  );}
export function SkeletonAssetGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Banner Skeleton */}
      <Skeleton variant="rectangular" height={200} className="w-full rounded-xl mb-4" />
      
      {/* Avatar and Info */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <Skeleton variant="circular" width={120} height={120} />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="80%" />
          <div className="flex gap-4 mt-4">
            <Skeleton variant="rectangular" width={100} height={40} />
            <Skeleton variant="rectangular" width={100} height={40} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="80%" height={24} className="mt-2" />
          </div>
        ))}
      </div>

      {/* Assets Grid */}
      <SkeletonAssetGrid />
    </div>
  );
}
