'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
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
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
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

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          id="search-input"
          placeholder="Search by title, description, or creator... (⌘K)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-50 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
        />
      </div>

      {/* Filter Toggle & Sort */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:border-amber-500/50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-amber-600 text-white text-xs rounded-full">
              {Object.values(filters).filter(v => v !== undefined && v !== '').length}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-50 focus:outline-none focus:border-amber-500"
        >
          <option value="-created_at">Most Recent</option>
          <option value="created_at">Oldest First</option>
          <option value="-royalty_percentage">Highest Royalty</option>
          <option value="royalty_percentage">Lowest Royalty</option>
          <option value="title">Title A-Z</option>
          <option value="-title">Title Z-A</option>
        </select>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-4">
              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Derivative Filter */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Type</label>
                  <select
                    value={filters.isDerivative === undefined ? '' : filters.isDerivative ? 'true' : 'false'}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange('isDerivative', value === '' ? undefined : value === 'true');
                    }}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-50 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">All Types</option>
                    <option value="false">Original</option>
                    <option value="true">Derivative</option>
                  </select>
                </div>

                {/* Allow Derivatives Filter */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Remixable</label>
                  <select
                    value={filters.allowDerivatives === undefined ? '' : filters.allowDerivatives ? 'true' : 'false'}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange('allowDerivatives', value === '' ? undefined : value === 'true');
                    }}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-50 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">All</option>
                    <option value="true">Remixable</option>
                    <option value="false">Not Remixable</option>
                  </select>
                </div>

                {/* Commercial Rights Filter */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Commercial Use</label>
                  <select
                    value={filters.commercialRights === undefined ? '' : filters.commercialRights ? 'true' : 'false'}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange('commercialRights', value === '' ? undefined : value === 'true');
                    }}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-50 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">All</option>
                    <option value="true">Commercial Allowed</option>
                    <option value="false">Personal Only</option>
                  </select>
                </div>

                {/* Royalty Range */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Min Royalty %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.royaltyMin || ''}
                    onChange={(e) => handleFilterChange('royaltyMin', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="0"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-50 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Max Royalty %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.royaltyMax || ''}
                    onChange={(e) => handleFilterChange('royaltyMax', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="100"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-50 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

