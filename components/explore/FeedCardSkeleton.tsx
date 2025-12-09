'use client';

import { motion } from 'framer-motion';

export default function FeedCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-slate-800 sm:border sm:border-slate-800/50 sm:rounded-xl sm:mb-4 bg-transparent sm:bg-slate-900/50"
    >
      {/* Header Skeleton */}
      <div className="px-3 sm:px-4 pt-3 sm:pt-4 flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 skeleton" />

        {/* Creator info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-24 bg-slate-800 rounded skeleton" />
            <div className="h-3 w-3 bg-slate-800 rounded-full skeleton hidden sm:block" />
            <div className="h-3 w-20 bg-slate-800 rounded skeleton hidden sm:block" />
            <div className="h-3 w-3 bg-slate-800 rounded-full skeleton" />
            <div className="h-3 w-8 bg-slate-800 rounded skeleton" />
          </div>
          {/* Title */}
          <div className="h-4 w-3/4 bg-slate-800 rounded skeleton" />
        </div>
      </div>

      {/* Media Skeleton */}
      <div className="mt-3 mx-0 sm:mx-3">
        <div className="aspect-[16/9] sm:rounded-xl bg-slate-800 skeleton" />
      </div>

      {/* Action Bar Skeleton - Twitter style */}
      <div className="flex items-center justify-around px-2 py-3 sm:px-4">
        <div className="h-5 w-10 bg-slate-800 rounded skeleton" />
        <div className="h-5 w-10 bg-slate-800 rounded skeleton" />
        <div className="h-5 w-10 bg-slate-800 rounded skeleton" />
        <div className="h-5 w-5 bg-slate-800 rounded skeleton" />
      </div>
    </motion.div>
  );
}

export function FeedCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="sm:space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <FeedCardSkeleton key={i} />
      ))}
    </div>
  );
}
