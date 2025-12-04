'use client';

import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-800",
        className
      )}
    />
  );
}

export function AssetCardSkeleton() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-800 rounded w-2/3" />
        <div className="flex items-center gap-2 mt-4">
          <div className="w-8 h-8 bg-slate-800 rounded-full" />
          <div className="h-3 bg-slate-800 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-900 p-6 rounded-xl border border-slate-800 animate-pulse">
            <div className="h-12 w-12 bg-slate-800 rounded-lg mb-4" />
            <div className="h-8 bg-slate-800 rounded w-1/2 mb-2" />
            <div className="h-4 bg-slate-800 rounded w-3/4" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-slate-900 p-6 rounded-xl border border-slate-800 animate-pulse">
            <div className="h-6 bg-slate-800 rounded w-1/3 mb-4" />
            <div className="h-64 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AssetDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Media Skeleton */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden animate-pulse">
          <div className="aspect-video bg-slate-800" />
        </div>
        
        {/* Details Skeleton */}
        <div className="space-y-6">
          <div>
            <div className="h-10 bg-slate-800 rounded w-3/4 mb-4" />
            <div className="h-4 bg-slate-800 rounded w-full mb-2" />
            <div className="h-4 bg-slate-800 rounded w-5/6" />
          </div>
          
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-800 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-slate-800 rounded w-1/3 mb-2" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-4 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-1/2 mb-2" />
                <div className="h-6 bg-slate-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Profile Header */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-slate-800 rounded-full" />
          <div className="flex-1">
            <div className="h-8 bg-slate-800 rounded w-1/3 mb-2" />
            <div className="h-4 bg-slate-800 rounded w-1/2 mb-4" />
            <div className="flex gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-slate-800 rounded w-16 mb-1" />
                  <div className="h-6 bg-slate-800 rounded w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Assets Grid */}
      <div>
        <div className="h-6 bg-slate-800 rounded w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <AssetCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

