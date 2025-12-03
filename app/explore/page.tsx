'use client';

import { Search, Filter, TrendingUp, Clock, Flame, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAssets } from '@/hooks/useAssets';
import Link from 'next/link';

const categories = ['All', 'Original', 'Derivative'];
const sortOptions = ['Most Recent', 'Most Derivatives'];

export default function Explore() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Most Recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Determine API params based on filters
  const apiParams = {
    search: debouncedSearch || undefined,
    is_derivative: selectedCategory === 'Derivative' ? true : selectedCategory === 'Original' ? false : undefined,
    page,
  };

  const { assets, loading, error, pagination, refetch } = useAssets(apiParams);

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Explore IP Assets</h1>
          <p className="text-sm sm:text-base text-slate-400">
            Discover and remix amazing content from creators worldwide
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for IP assets by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-900 border border-slate-800 rounded-lg text-sm sm:text-base text-slate-50 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          {/* Category and Sort Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center lg:justify-between">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setPage(1);
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/50'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-50 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Results Count */}
            {pagination && (
              <div className="text-sm text-slate-400">
                {pagination.count} asset{pagination.count !== 1 ? 's' : ''} found
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
            <p className="text-slate-400">Loading assets...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold text-red-400">Error Loading Assets</h3>
              </div>
              <p className="text-red-300 text-sm mb-4">{error}</p>
              <button
                onClick={refetch}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && assets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No assets found</h3>
            <p className="text-slate-500 text-center max-w-md">
              {searchQuery
                ? `No assets match your search "${searchQuery}". Try different keywords.`
                : 'No assets have been created yet. Be the first to mint an IP asset!'}
            </p>
          </div>
        )}

        {/* Asset Grid */}
        {!loading && !error && assets.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {assets.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/explore/${asset.id}`}
                  className="group bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-amber-500 transition-all duration-300 hover:shadow-xl hover:shadow-amber-600/20 hover:-translate-y-1 cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 sm:h-48 bg-slate-800 overflow-hidden">
                    {asset.media_url && asset.media_url !== 'https://placeholder.example.com/media' ? (
                      <img
                        src={asset.media_url}
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-600/30 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg
                              className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <p className="text-slate-400 text-xs sm:text-sm">No Preview</p>
                        </div>
                      </div>
                    )}

                    {/* Derivative Badge */}
                    {asset.is_derivative && (
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-purple-500 to-pink-500 px-2 sm:px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        <span className="text-white text-xs font-semibold">Derivative</span>
                      </div>
                    )}

                    {/* Story IP ID Badge */}
                    {asset.story_ip_id && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-slate-900/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full border border-slate-700">
                        <span className="text-amber-400 text-xs font-semibold font-mono">
                          {formatAddress(asset.story_ip_id)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4">
                    <div className="mb-3">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-50 mb-1 group-hover:text-amber-400 transition-colors line-clamp-2">
                        {asset.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 line-clamp-2">
                        {asset.description}
                      </p>
                    </div>

                    {/* Creator */}
                    <div className="flex items-center gap-2 mb-4 pb-3 sm:pb-4 border-b border-slate-800">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">Creator</p>
                        <p className="text-xs sm:text-sm text-slate-300 font-mono truncate">
                          {asset.creator?.display_name || formatAddress(asset.creator?.wallet_address || '')}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div>
                        <div className="flex items-center gap-1 text-slate-400 mb-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs">Created</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-50 font-semibold">
                          {formatDate(asset.created_at)}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-slate-400 mb-1">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs">Derivatives</span>
                        </div>
                        <p className="text-sm sm:text-base text-slate-50 font-semibold">
                          {asset.derivative_count || 0}
                        </p>
                      </div>
                    </div>

                    {/* License Info */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <p className="text-xs text-slate-500 mb-1">License</p>
                        <div className="flex gap-2">
                          {asset.allow_derivatives && (
                            <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded border border-green-500/20">
                              Remix OK
                            </span>
                          )}
                          {asset.commercial_rights && (
                            <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                              Commercial
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="px-3 sm:px-4 py-2 bg-amber-600 group-hover:bg-amber-700 text-white text-sm rounded-lg font-semibold transition-all duration-200">
                        View
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.count > assets.length && (
              <div className="mt-8 sm:mt-12 flex justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.previous || loading}
                  className="px-6 py-3 bg-slate-900 border border-slate-800 hover:border-amber-500 hover:bg-slate-800 text-slate-300 hover:text-slate-50 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-800"
                >
                  Previous
                </button>
                <div className="flex items-center px-4 text-slate-400">
                  Page {page}
                </div>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.next || loading}
                  className="px-6 py-3 bg-slate-900 border border-slate-800 hover:border-amber-500 hover:bg-slate-800 text-slate-300 hover:text-slate-50 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-800"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
