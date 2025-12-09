'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FileText,
  Archive,
  ChevronUp,
  ChevronDown,
  Filter,
  Eye,
  Shield,
  MoreHorizontal,
  GitBranch,
  ExternalLink,
  Search,
} from 'lucide-react';
import type { IPAssetListItem } from '@/types/api';
import ArchiveActions from '@/components/assets/ArchiveActions';

type SortField = 'title' | 'status' | 'derivatives' | 'created_at';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'registered' | 'pending' | 'failed';

interface EnhancedAssetTableProps {
  activeAssets: IPAssetListItem[];
  archivedAssets: IPAssetListItem[];
  onRefetch: () => void;
}

// Status badge component
function StatusBadge({ status }: { status: string | undefined }) {
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Failed
      </span>
    );
  }
  if (status === 'pending' || status === 'retrying') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        {status === 'retrying' ? 'Retrying' : 'Pending'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      Live
    </span>
  );
}

// License badges component
function LicenseBadges({ allowDerivatives, commercialRights }: { allowDerivatives?: boolean; commercialRights?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1">
      {allowDerivatives && (
        <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/20">
          Remix
        </span>
      )}
      {commercialRights && (
        <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
          Commercial
        </span>
      )}
      {!allowDerivatives && !commercialRights && (
        <span className="text-xs text-slate-500">-</span>
      )}
    </div>
  );
}

export default function EnhancedAssetTable({
  activeAssets,
  archivedAssets,
  onRefetch,
}: EnhancedAssetTableProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get current assets based on tab
  const currentAssets = activeTab === 'active' ? activeAssets : archivedAssets;

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let result = [...currentAssets];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        asset =>
          asset.title.toLowerCase().includes(query) ||
          asset.story_ip_id?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(asset => {
        if (statusFilter === 'registered') return asset.registration_status === 'registered';
        if (statusFilter === 'pending') return asset.registration_status === 'pending' || asset.registration_status === 'retrying';
        if (statusFilter === 'failed') return asset.registration_status === 'failed';
        return true;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = (a.registration_status || '').localeCompare(b.registration_status || '');
          break;
        case 'derivatives':
          comparison = (a.derivative_count || 0) - (b.derivative_count || 0);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [currentAssets, searchQuery, statusFilter, sortField, sortDirection]);

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort indicator component
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  // Format helpers
  const formatAddress = (address: string) => {
    if (!address) return 'Not registered';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Asset Ledger</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Manage and track your IP assets
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs and Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Active
              {activeAssets.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'active' ? 'bg-white/20' : 'bg-slate-700'
                }`}>
                  {activeAssets.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'archived'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Archive className="w-4 h-4" />
              Archived
              {archivedAssets.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'archived' ? 'bg-white/20' : 'bg-slate-700'
                }`}>
                  {archivedAssets.length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showFilters || statusFilter !== 'all'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {statusFilter !== 'all' && (
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 flex flex-wrap gap-2">
                <span className="text-sm text-slate-400 mr-2">Status:</span>
                {(['all', 'registered', 'pending', 'failed'] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            {activeTab === 'archived' ? (
              <Archive className="w-10 h-10 text-slate-600" />
            ) : (
              <FileText className="w-10 h-10 text-slate-600" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-slate-300 mb-2">
            {searchQuery || statusFilter !== 'all'
              ? 'No matching assets'
              : activeTab === 'archived'
              ? 'No archived assets'
              : 'No assets yet'}
          </h3>
          <p className="text-slate-500 text-center max-w-md mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : activeTab === 'archived'
              ? "You haven't archived any assets yet."
              : "You haven't minted any IP assets yet. Get started!"}
          </p>
          {activeTab === 'active' && !searchQuery && statusFilter === 'all' && (
            <Link
              href="/"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
            >
              Mint Your First Asset
            </Link>
          )}
        </div>
      )}

      {/* Table */}
      {filteredAssets.length > 0 && (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-slate-800">
            {filteredAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="p-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {asset.media_url && asset.media_url !== 'https://placeholder.example.com/media' ? (
                      <img src={asset.media_url} alt={asset.title} className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-6 h-6 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white mb-1 line-clamp-1">{asset.title}</div>
                    <div className="text-xs text-slate-500 font-mono mb-2">
                      {formatAddress(asset.story_ip_id || '')}
                    </div>
                    <StatusBadge status={asset.registration_status} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-4 h-4" />
                      {asset.derivative_count || 0}
                    </span>
                    <span>{formatDate(asset.created_at)}</span>
                  </div>
                  <Link
                    href={`/explore/${asset.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                </div>

                {activeTab === 'archived' && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <ArchiveActions asset={asset} onSuccess={onRefetch} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/30">
                <tr>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-1 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                      Asset
                      <SortIndicator field="title" />
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                      Status
                      <SortIndicator field="status" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-300">License</th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('derivatives')}
                      className="flex items-center gap-1 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                      Derivatives
                      <SortIndicator field="derivatives" />
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-1 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                      Created
                      <SortIndicator field="created_at" />
                    </button>
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredAssets.map((asset, index) => (
                  <motion.tr
                    key={asset.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden group-hover:ring-2 ring-amber-500/30 transition-all">
                          {asset.media_url && asset.media_url !== 'https://placeholder.example.com/media' ? (
                            <img src={asset.media_url} alt={asset.title} className="w-full h-full object-cover" />
                          ) : (
                            <FileText className="w-6 h-6 text-amber-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white group-hover:text-amber-400 transition-colors">
                            {asset.title}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {formatAddress(asset.story_ip_id || '')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={asset.registration_status} />
                    </td>
                    <td className="p-4">
                      <LicenseBadges
                        allowDerivatives={asset.allow_derivatives}
                        commercialRights={asset.commercial_rights}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-slate-300">
                        <GitBranch className="w-4 h-4 text-slate-500" />
                        {asset.derivative_count || 0}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-400 text-sm">{formatDate(asset.created_at)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/explore/${asset.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                        {asset.registration_status === 'registered' && (
                          <Link
                            href={`/assets/${asset.id}/permissions`}
                            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Manage permissions"
                          >
                            <Shield className="w-4 h-4 text-slate-500 hover:text-blue-400" />
                          </Link>
                        )}
                        {activeTab === 'archived' && (
                          <ArchiveActions asset={asset} onSuccess={onRefetch} />
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Results count */}
          <div className="p-4 border-t border-slate-800/50 text-center">
            <span className="text-sm text-slate-500">
              Showing {filteredAssets.length} of {currentAssets.length} assets
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
}
