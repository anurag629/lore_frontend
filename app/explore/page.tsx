'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, AlertCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  FeedCard,
  FeedCardSkeletonList,
  InfiniteScroll,
  MediaLightbox,
  TrendingSidebar,
  SearchFilters,
  SearchBar,
  FilterControls,
} from '@/components/explore';
import { EmptyState } from '@/components/ui/EmptyState';
import MintModal from '@/components/mint/MintModal';
import { useInfiniteAssets } from '@/hooks/useInfiniteAssets';
import type { IPAssetListItem } from '@/types/api';

export default function Explore() {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    isDerivative: undefined as boolean | undefined,
    allowDerivatives: undefined as boolean | undefined,
    commercialRights: undefined as boolean | undefined,
    royaltyMin: undefined as number | undefined,
    royaltyMax: undefined as number | undefined,
  });
  const [sortBy, setSortBy] = useState('-created_at');

  // UI state
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [lightboxAsset, setLightboxAsset] = useState<IPAssetListItem | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build API filters
  const apiFilters: Record<string, any> = {
    search: debouncedSearch || undefined,
    ordering: sortBy,
  };

  if (filters.isDerivative !== undefined) {
    apiFilters.is_derivative = filters.isDerivative;
  }
  if (filters.allowDerivatives !== undefined) {
    apiFilters.allow_derivatives = filters.allowDerivatives;
  }
  if (filters.commercialRights !== undefined) {
    apiFilters.commercial_rights = filters.commercialRights;
  }
  if (filters.royaltyMin !== undefined) {
    apiFilters.royalty_percentage_min = filters.royaltyMin;
  }
  if (filters.royaltyMax !== undefined) {
    apiFilters.royalty_percentage_max = filters.royaltyMax;
  }

  // Fetch assets with infinite scroll
  const {
    assets,
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    fetchMore,
    refetch,
    totalCount,
  } = useInfiniteAssets(apiFilters);

  // Handle search change with debounce
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    // Debounce the actual search
    const timer = setTimeout(() => {
      setDebouncedSearch(query);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
  }, []);

  // Handle lightbox navigation
  const handleLightboxNavigate = useCallback((asset: IPAssetListItem) => {
    setLightboxAsset(asset);
  }, []);

  return (
    <>
      <MintModal isOpen={isMintModalOpen} onClose={() => setIsMintModalOpen(false)} />
      <MediaLightbox
        isOpen={!!lightboxAsset}
        onClose={() => setLightboxAsset(null)}
        asset={lightboxAsset}
        assets={assets}
        onNavigate={handleLightboxNavigate}
      />

      <div className="min-h-screen">
        {/* Compact Header - Search & Filters - Aligned with content */}
        <div className="sticky top-0 z-40">
          {/* Mobile: Combined search + filters */}
          <div className="lg:hidden">
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              filters={filters}
              onFiltersChange={setFilters}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              resultCount={!isLoading ? totalCount : undefined}
            />
          </div>

          {/* Desktop: Split layout - Search aligned with feed, Filters aligned with sidebar */}
          <div className="hidden lg:flex gap-6 py-3">
            {/* Search bar - same width as feed */}
            <div className="flex-1 pl-4">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
              />
            </div>
            {/* Filter controls - same width as sidebar */}
            <div className="w-72 flex-shrink-0 pr-4">
              <FilterControls
                filters={filters}
                onFiltersChange={setFilters}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                resultCount={!isLoading ? totalCount : undefined}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Feed Column */}
          <main className="flex-1 w-full lg:pl-4">
              {/* Error State */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="m-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <h3 className="font-semibold text-red-400">Error Loading Feed</h3>
                  </div>
                  <p className="text-red-300 text-sm mb-3">{error}</p>
                  <button
                    onClick={refetch}
                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}

              {/* Loading State */}
              {isLoading && !error && (
                <FeedCardSkeletonList count={3} />
              )}

              {/* Empty State */}
              {!isLoading && !error && assets.length === 0 && (
                <div className="p-4">
                  <EmptyState
                    icon={searchQuery ? Search : FileText}
                    title={searchQuery ? 'No assets found' : 'No assets yet'}
                    description={
                      searchQuery
                        ? `No assets match your search "${searchQuery}". Try different keywords.`
                        : 'No assets have been created yet. Be the first to mint an IP asset!'
                    }
                    action={
                      !searchQuery
                        ? {
                            label: 'Mint Your First Asset',
                            onClick: () => setIsMintModalOpen(true),
                          }
                        : undefined
                    }
                  />
                </div>
              )}

              {/* Feed - No spacing between cards on mobile */}
              {!isLoading && !error && assets.length > 0 && (
                <InfiniteScroll
                  onLoadMore={fetchMore}
                  hasMore={hasMore}
                  isLoading={isFetchingMore}
                >
                  <div className="sm:space-y-4">
                    {assets.map((asset, index) => (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.05, 0.3) }}
                      >
                        <FeedCard
                          asset={asset}
                          onMediaClick={() => setLightboxAsset(asset)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </InfiniteScroll>
              )}
            </main>

          {/* Sidebar - Desktop only */}
          <aside className="hidden lg:block w-72 flex-shrink-0 pr-4 pt-4">
            <TrendingSidebar totalAssets={totalCount} />
          </aside>
        </div>
      </div>
    </>
  );
}
