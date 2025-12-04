'use client';

import { TrendingUp, FileText, GitBranch, Eye, Loader2, AlertCircle, BarChart3, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAssets } from '@/hooks/useAssets';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { assets, loading: assetsLoading, error, refetch } = useAssets(
    user ? { creator: user.id } : undefined
  );

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

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
            <h2 className="text-xl sm:text-2xl font-bold">Asset Ledger</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage and track your IP assets</p>
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
                <FileText className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No assets yet</h3>
              <p className="text-slate-500 text-center max-w-md mb-6">
                You haven't minted any IP assets yet. Get started by minting your first asset!
              </p>
              <Link
                href="/"
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
              >
                Mint Your First Asset
              </Link>
            </div>
          )}

          {/* Assets List */}
          {!assetsLoading && !error && assets.length > 0 && (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-slate-800">
                {assets.map((asset) => (
                  <Link
                    key={asset.id}
                    href={`/explore/${asset.id}`}
                    className="block p-4 hover:bg-slate-800/30 transition-colors"
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
                          {formatAddress(asset.story_ip_id)}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Live
                      </span>
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
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-500 text-xs mb-1">Created</div>
                        <div className="text-xs text-slate-300">{formatDate(asset.created_at)}</div>
                      </div>
                      <div className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm">
                        View
                      </div>
                    </div>
                  </Link>
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
                                {formatAddress(asset.story_ip_id)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            Live
                          </span>
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
                          <Link
                            href={`/explore/${asset.id}`}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors inline-block"
                          >
                            View Details
                          </Link>
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
