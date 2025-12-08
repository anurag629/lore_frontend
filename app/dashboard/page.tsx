'use client';

import { TrendingUp, FileText, GitBranch, Eye, Loader2, AlertCircle, BarChart3, Zap, Archive } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAssets } from '@/hooks/useAssets';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ArchiveActions from '@/components/assets/ArchiveActions';

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Initialize tab from URL query parameter or default to 'active'
  const initialTab = (searchParams?.get('tab') === 'archived' ? 'archived' : 'active') as 'active' | 'archived';
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>(initialTab);
  
  // Get user ID safely
  const userId = user?.id;
  
  // Update tab when URL changes
  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab === 'archived' || tab === 'active') {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  // Fetch assets with creator filter - only fetches when userId is defined
  // When userId is undefined, useAssets will still work but won't fetch (hasFetched will be false)
  // Filter by is_deleted based on active tab
  const { assets, loading: assetsLoading, error, refetch } = useAssets(
    userId !== undefined 
      ? { 
          creator: userId, 
          is_deleted: activeTab === 'archived' 
        } 
      : undefined
  );

  // Fetch counts for both tabs
  const { assets: activeAssets } = useAssets(
    userId !== undefined ? { creator: userId, is_deleted: false } : undefined
  );
  const { assets: archivedAssets } = useAssets(
    userId !== undefined ? { creator: userId, is_deleted: true } : undefined
  );

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch assets when page becomes visible (fixes stale data after deletion)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userId !== undefined) {
        refetch();
      }
    };

    const handleFocus = () => {
      if (userId !== undefined) {
        refetch();
      }
    };

    // Refetch on page visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Refetch on window focus
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [userId, refetch]);

  // Refetch when page loads with refresh query param (from deletion/archive redirect)
  useEffect(() => {
    if (typeof window !== 'undefined' && userId !== undefined) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('refresh')) {
        const archivedAssetId = urlParams.get('archived') || urlParams.get('deleted');
        const tabParam = urlParams.get('tab');
        
        // Switch to archived tab if specified
        if (tabParam === 'archived') {
          setActiveTab('archived');
        }
        
        // Remove the refresh params from URL immediately
        urlParams.delete('refresh');
        urlParams.delete('archived');
        urlParams.delete('deleted');
        urlParams.delete('tab');
        const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
        window.history.replaceState({}, '', newUrl);
        
        // Force refetch with a small delay to ensure URL is updated
        setTimeout(() => {
          refetch();
        }, 50);
        
        // Log for debugging
        if (archivedAssetId) {
          console.log(`Refetching assets after archiving of asset ${archivedAssetId}`);
        }
      }
    }
  }, [userId, refetch]);

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

  // Calculate total derivatives from all user's assets
  const totalDerivatives = assets.reduce((sum, asset) => sum + (asset.derivative_count || 0), 0);

  // Show loading state
  if (authLoading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Creator Dashboard</h1>
              <p className="text-sm sm:text-base text-slate-400">Track your earnings, assets, and performance</p>
              <p className="text-xs text-slate-500 mt-2 font-mono">
                {formatAddress(user.wallet_address)}
              </p>
            </div>
            <Link
              href="/dashboard/ai-analytics"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">AI Analytics</span>
            </Link>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Earnings */}
          <div className="bg-gradient-to-br from-amber-600 to-orange-700 p-5 sm:p-6 rounded-xl shadow-xl shadow-amber-600/20 border border-amber-500/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="flex items-center gap-1 text-xs sm:text-sm font-medium text-white/90 bg-white/20 px-2 py-1 rounded">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                ETH
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {parseFloat(user.total_earnings).toFixed(4)} ETH
            </div>
            <div className="text-white/80 text-xs sm:text-sm">Total Royalty Earnings</div>
          </div>

          {/* Assets Minted */}
          <div className="bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-all duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-600/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-50 mb-1">{user.assets_count}</div>
            <div className="text-slate-400 text-xs sm:text-sm">Assets Minted</div>
          </div>

          {/* Total Derivatives */}
          <div className="bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-all duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-600/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <GitBranch className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-50 mb-1">{totalDerivatives}</div>
            <div className="text-slate-400 text-xs sm:text-sm">Total Derivatives</div>
          </div>

          {/* Total Spinoffs (from user data) */}
          <div className="bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-all duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-600/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-50 mb-1">{user.total_spinoffs}</div>
            <div className="text-slate-400 text-xs sm:text-sm">Total Spin-offs</div>
          </div>
        </div>

        {/* Asset Ledger */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 border-b border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Asset Ledger</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage and track your IP assets</p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setActiveTab('active');
                  // Update URL without page reload
                  const url = new URL(window.location.href);
                  url.searchParams.delete('tab');
                  window.history.pushState({}, '', url.toString());
                }}
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
                onClick={() => {
                  setActiveTab('archived');
                  // Update URL without page reload
                  const url = new URL(window.location.href);
                  url.searchParams.set('tab', 'archived');
                  window.history.pushState({}, '', url.toString());
                }}
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
          </div>

          {/* Loading State */}
          {assetsLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
              <p className="text-slate-400">Loading your assets...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md mx-4">
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
          {!assetsLoading && !error && assets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                {activeTab === 'archived' ? (
                  <Archive className="w-10 h-10 text-slate-600" />
                ) : (
                  <FileText className="w-10 h-10 text-slate-600" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                {activeTab === 'archived' ? 'No archived assets' : 'No assets yet'}
              </h3>
              <p className="text-slate-500 text-center max-w-md mb-6">
                {activeTab === 'archived' 
                  ? 'You haven\'t archived any assets yet. Archived assets will appear here.'
                  : 'You haven\'t minted any IP assets yet. Get started by minting your first asset!'}
              </p>
              {activeTab === 'active' && (
                <Link
                  href="/"
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Mint Your First Asset
                </Link>
              )}
            </div>
          )}

          {/* Assets List */}
          {!assetsLoading && !error && assets.length > 0 && (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-slate-800">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-4 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {asset.media_url && asset.media_url !== 'https://placeholder.example.com/media' ? (
                          <img
                            src={asset.media_url}
                            alt={asset.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="w-6 h-6 text-amber-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-50 mb-1 line-clamp-1">{asset.title}</div>
                        <div className="text-sm text-slate-400 font-mono text-xs">
                          {asset.story_ip_id ? formatAddress(asset.story_ip_id) : 'Not registered'}
                        </div>
                      </div>
                      {asset.registration_status === 'failed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          Failed
                        </span>
                      ) : asset.registration_status === 'pending' || asset.registration_status === 'retrying' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                          {asset.registration_status === 'retrying' ? 'Retrying' : 'Pending'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          Live
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <div className="text-slate-500 text-xs mb-1">License</div>
                        <div className="text-slate-300 text-xs">
                          {asset.allow_derivatives && (
                            <span className="text-green-400">Remixable</span>
                          )}
                          {!asset.allow_derivatives && (
                            <span className="text-slate-500">No Remix</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs mb-1">Derivatives</div>
                        <div className="text-slate-300">{asset.derivative_count || 0}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-slate-500 text-xs mb-1">Created</div>
                        <div className="text-xs text-slate-300">{formatDate(asset.created_at)}</div>
                      </div>
                      <Link
                        href={`/explore/${asset.id}`}
                        className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                    {activeTab === 'archived' && (
                      <div className="mt-3 pt-3 border-t border-slate-800">
                        <ArchiveActions asset={asset} onSuccess={refetch} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-300">Asset</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-300">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-300">License Terms</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-300">Performance</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-300">Created</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-300">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {assets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                              {asset.media_url && asset.media_url !== 'https://placeholder.example.com/media' ? (
                                <img
                                  src={asset.media_url}
                                  alt={asset.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FileText className="w-6 h-6 text-amber-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-50">{asset.title}</div>
                              <div className="text-sm text-slate-400 font-mono">
                                {asset.story_ip_id ? formatAddress(asset.story_ip_id) : 'Not registered'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {asset.registration_status === 'failed' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              Failed
                            </span>
                          ) : asset.registration_status === 'pending' || asset.registration_status === 'retrying' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                              {asset.registration_status === 'retrying' ? 'Retrying' : 'Pending'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                              Live
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            {asset.allow_derivatives && (
                              <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded border border-green-500/20 inline-block w-fit">
                                Remix OK
                              </span>
                            )}
                            {asset.commercial_rights && (
                              <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 inline-block w-fit">
                                Commercial
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-300">{asset.derivative_count || 0} Derivatives</span>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-300 text-sm">{formatDate(asset.created_at)}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-2">
                            <Link
                              href={`/explore/${asset.id}`}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors inline-block text-center"
                            >
                              View Details
                            </Link>
                            {activeTab === 'archived' && (
                              <ArchiveActions asset={asset} onSuccess={refetch} />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Genealogy Graph Placeholder */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Most Viral Asset Lineage</h2>
          <div className="bg-slate-800/50 rounded-lg p-8 sm:p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <GitBranch className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
              </div>
              <p className="text-sm sm:text-base text-slate-400">Genealogy graph visualization coming soon</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">Track how your content inspires derivatives</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
