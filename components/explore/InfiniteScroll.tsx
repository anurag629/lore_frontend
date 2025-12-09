'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  children: React.ReactNode;
  threshold?: number;
}

export default function InfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  children,
  threshold = 200,
}: InfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading && !loadingRef.current) {
          loadingRef.current = true;
          onLoadMore();
          // Reset loading ref after a short delay to prevent multiple calls
          setTimeout(() => {
            loadingRef.current = false;
          }, 500);
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0,
      }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onLoadMore, hasMore, isLoading, threshold]);

  return (
    <div className="relative">
      {children}

      {/* Observer trigger element */}
      <div ref={observerRef} className="h-1 w-full" />

      {/* Loading indicator */}
      {isLoading && hasMore && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
          <span className="ml-2 text-slate-400 text-sm">Loading more...</span>
        </div>
      )}

      {/* End of feed message */}
      {!hasMore && !isLoading && (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">You've reached the end</p>
        </div>
      )}
    </div>
  );
}
