'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    isDerivative?: boolean;
    allowDerivatives?: boolean;
    commercialRights?: boolean;
    royaltyMin?: number;
    royaltyMax?: number;
  };
  onFiltersChange: (filters: any) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  resultCount?: number;
}

// Search bar component - for the feed column
export function SearchBar({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input
        type="text"
        id="search-input"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-full text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:border-slate-700 focus:bg-slate-900 transition-all"
      />
    </div>
  );
}

// Filter controls component - for the sidebar column
export function FilterControls({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  resultCount,
}: {
  filters: SearchFiltersProps['filters'];
  onFiltersChange: (filters: any) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  resultCount?: number;
}) {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);
  const activeFilterCount = Object.values(filters).filter(v => v !== undefined).length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-amber-600 text-white'
              : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none px-3 py-2 pr-8 bg-slate-900/80 border border-slate-800 rounded-full text-sm text-slate-300 focus:outline-none focus:border-slate-700 cursor-pointer"
          >
            <option value="-created_at">Recent</option>
            <option value="created_at">Oldest</option>
            <option value="-royalty_percentage">High Royalty</option>
            <option value="royalty_percentage">Low Royalty</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>

        {/* Results count */}
        {resultCount !== undefined && (
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </span>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {/* Type Filter */}
              <select
                value={filters.isDerivative === undefined ? '' : filters.isDerivative ? 'true' : 'false'}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('isDerivative', value === '' ? undefined : value === 'true');
                }}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="">All Types</option>
                <option value="false">Original</option>
                <option value="true">Remix</option>
              </select>

              {/* Remixable Filter */}
              <select
                value={filters.allowDerivatives === undefined ? '' : filters.allowDerivatives ? 'true' : 'false'}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('allowDerivatives', value === '' ? undefined : value === 'true');
                }}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="">Remixable</option>
                <option value="true">Can Remix</option>
                <option value="false">No Remix</option>
              </select>

              {/* Commercial Filter */}
              <select
                value={filters.commercialRights === undefined ? '' : filters.commercialRights ? 'true' : 'false'}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('commercialRights', value === '' ? undefined : value === 'true');
                }}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="">Commercial</option>
                <option value="true">Allowed</option>
                <option value="false">Personal Only</option>
              </select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Combined component for mobile - keeps everything together
export function SearchFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  resultCount,
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);
  const activeFilterCount = Object.values(filters).filter(v => v !== undefined).length;

  return (
    <div>
      {/* Compact Header Bar - Single Row */}
      <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            id="search-input-mobile"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-full text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:border-slate-700 focus:bg-slate-900 transition-all"
          />
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-amber-600 text-white'
              : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none px-3 py-2 pr-8 bg-slate-900/80 border border-slate-800 rounded-full text-sm text-slate-300 focus:outline-none focus:border-slate-700 cursor-pointer"
          >
            <option value="-created_at">Recent</option>
            <option value="created_at">Oldest</option>
            <option value="-royalty_percentage">High Royalty</option>
            <option value="royalty_percentage">Low Royalty</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-slate-800/50"
          >
            <div className="px-3 py-3 sm:px-4 sm:py-4">
              <div className="flex flex-wrap items-center gap-2">
                {/* Type Filter */}
                <select
                  value={filters.isDerivative === undefined ? '' : filters.isDerivative ? 'true' : 'false'}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('isDerivative', value === '' ? undefined : value === 'true');
                  }}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Types</option>
                  <option value="false">Original</option>
                  <option value="true">Remix</option>
                </select>

                {/* Remixable Filter */}
                <select
                  value={filters.allowDerivatives === undefined ? '' : filters.allowDerivatives ? 'true' : 'false'}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('allowDerivatives', value === '' ? undefined : value === 'true');
                  }}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Remixable</option>
                  <option value="true">Can Remix</option>
                  <option value="false">No Remix</option>
                </select>

                {/* Commercial Filter */}
                <select
                  value={filters.commercialRights === undefined ? '' : filters.commercialRights ? 'true' : 'false'}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('commercialRights', value === '' ? undefined : value === 'true');
                  }}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Commercial</option>
                  <option value="true">Allowed</option>
                  <option value="false">Personal Only</option>
                </select>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

