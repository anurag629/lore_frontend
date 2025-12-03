'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAsset, useRoyaltyBalance, useClaimRoyalties } from '@/hooks/useAssets';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Share2,
  TrendingUp,
  GitBranch,
  Shield,
  DollarSign,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  XCircle,
  Coins
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import RemixModal from '@/components/mint/RemixModal';

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params?.id ? parseInt(params.id as string) : null;
  const { asset, loading, error, refetch } = useAsset(assetId);
  const { user, isAuthenticated } = useAuth();
  const [showRemixModal, setShowRemixModal] = useState(false);

  // Royalty claiming
  const { balance, loading: balanceLoading, refetch: refetchBalance } = useRoyaltyBalance(assetId);
  const { claimRoyalties, loading: claiming, error: claimError } = useClaimRoyalties();

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Handle royalty claiming
  const handleClaimRoyalties = async () => {
    if (!assetId) return;

    const result = await claimRoyalties(assetId);
    if (result) {
      // Refresh balance after successful claim
      refetchBalance();
      alert(`Successfully claimed ${result.amount} ETH in royalties!`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading asset details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !asset) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-semibold text-red-400">Error Loading Asset</h3>
            </div>
            <p className="text-red-300 text-sm mb-4">
              {error || 'Asset not found'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={refetch}
                className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/explore')}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
              >
                Back to Explore
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === asset.creator.id;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-50 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Media */}
          <div className="space-y-6">
            {/* Main Media */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="aspect-video bg-slate-800 relative">
                {asset.media_url && asset.media_url !== 'https://placeholder.example.com/media' ? (
                  <img
                    src={asset.media_url}
                    alt={asset.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-amber-600/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-10 h-10 text-amber-400" />
                      </div>
                      <p className="text-slate-400">No media preview</p>
                    </div>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                  {asset.is_derivative && (
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <TrendingUp className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-semibold">Derivative</span>
                    </div>
                  )}

                  <button
                    onClick={() => copyToClipboard(window.location.href)}
                    className="ml-auto bg-slate-900/80 backdrop-blur-sm hover:bg-slate-900 p-2 rounded-lg border border-slate-700 transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-slate-300" />
                  </button>
                </div>
              </div>

              {/* Story Protocol Badge */}
              <div className="p-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Story Protocol IP ID</p>
                    <p className="text-sm font-mono text-amber-400 font-semibold">
                      {formatAddress(asset.story_ip_id)}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(asset.story_ip_id)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Parent Asset (if derivative) */}
            {asset.is_derivative && asset.parent_asset && (
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Remixed From
                </h3>
                <Link
                  href={`/explore/${asset.parent_asset.id}`}
                  className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                    {asset.parent_asset.media_url && asset.parent_asset.media_url !== 'https://placeholder.example.com/media' ? (
                      <img
                        src={asset.parent_asset.media_url}
                        alt={asset.parent_asset.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-amber-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-50 mb-1 line-clamp-1">
                      {asset.parent_asset.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      by {asset.parent_asset.creator.display_name || formatAddress(asset.parent_asset.creator.wallet_address)}
                    </p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-slate-400 rotate-180" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title and Description */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-4">
                {asset.title}
              </h1>
              <p className="text-slate-300 leading-relaxed">
                {asset.description}
              </p>
            </div>

            {/* Creator Info */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-1">Creator</p>
                  <Link
                    href={`/profile/${asset.creator.wallet_address}`}
                    className="font-semibold text-slate-50 hover:text-amber-400 transition-colors"
                  >
                    {asset.creator.display_name || formatAddress(asset.creator.wallet_address)}
                  </Link>
                  <p className="text-xs font-mono text-slate-400">
                    {formatAddress(asset.creator.wallet_address)}
                  </p>
                </div>
                {isOwner && (
                  <span className="px-2 py-1 bg-amber-600/20 text-amber-400 text-xs rounded-full font-medium">
                    You
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <GitBranch className="w-4 h-4" />
                  <span className="text-xs">Derivatives</span>
                </div>
                <p className="text-2xl font-bold text-slate-50">{asset.derivative_count || 0}</p>
              </div>

              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Created</span>
                </div>
                <p className="text-sm font-semibold text-slate-50">{formatDate(asset.created_at).split(',')[0]}</p>
              </div>
            </div>

            {/* Royalty Section (Owner Only) */}
            {isOwner && (
              <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-xl border border-amber-800/50 p-5">
                <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  Royalty Earnings
                </h3>

                {balanceLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-slate-400 mb-2">Available to Claim</p>
                      <p className="text-3xl font-bold text-amber-400">
                        {balance ? parseFloat(balance.balance).toFixed(6) : '0.000000'} ETH
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        From {asset.derivative_count || 0} derivative{asset.derivative_count !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {claimError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{claimError}</p>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      onClick={handleClaimRoyalties}
                      disabled={claiming || !balance || parseFloat(balance.balance) === 0}
                    >
                      {claiming ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Claim Royalties
                        </>
                      )}
                    </Button>

                    {balance && parseFloat(balance.balance) === 0 && (
                      <p className="text-xs text-slate-500 text-center mt-2">
                        No royalties available to claim yet
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* License Information */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                License Terms
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  {asset.allow_derivatives ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-slate-50 font-medium mb-1">Derivatives / Remixes</p>
                    <p className="text-sm text-slate-400">
                      {asset.allow_derivatives
                        ? 'Allowed - You can create derivatives of this work'
                        : 'Not allowed - Derivatives are restricted'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {asset.commercial_rights ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-slate-50 font-medium mb-1">Commercial Use</p>
                    <p className="text-sm text-slate-400">
                      {asset.commercial_rights
                        ? 'Allowed - Commercial use is permitted'
                        : 'Not allowed - Personal use only'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-50 font-medium mb-1">Royalty Rate</p>
                    <p className="text-sm text-slate-400">
                      {asset.royalty_percentage}% of derivative revenue goes to the creator
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {asset.allow_derivatives && !isOwner && (
                <Button
                  variant="primary"
                  className="flex-1 py-3"
                  onClick={() => {
                    if (isAuthenticated) {
                      setShowRemixModal(true);
                    } else {
                      alert('Please connect your wallet to create a remix');
                    }
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Remix
                </Button>
              )}

              {isOwner && (
                <Button
                  variant="outline"
                  className="flex-1 py-3"
                  onClick={() => {
                    // TODO: Implement manage asset functionality
                    alert('Manage functionality coming soon!');
                  }}
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Manage Asset
                </Button>
              )}

              <button
                onClick={() => window.open(`https://explorer.story.foundation/ipa/${asset.story_ip_id}`, '_blank')}
                className="flex-1 sm:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                View on Story
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        </div>

        {/* Derivatives Section */}
        {asset.derivatives && asset.derivatives.length > 0 && (
          <div className="mt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-50 mb-2 flex items-center gap-2">
                <GitBranch className="w-6 h-6 text-amber-400" />
                Derivatives ({asset.derivatives.length})
              </h2>
              <p className="text-slate-400">
                Creative works inspired by this IP asset
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {asset.derivatives.map((derivative) => (
                <Link
                  key={derivative.id}
                  href={`/explore/${derivative.id}`}
                  className="group bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-amber-500 transition-all duration-300 hover:shadow-xl hover:shadow-amber-600/20 hover:-translate-y-1"
                >
                  <div className="relative h-48 bg-slate-800 overflow-hidden">
                    {derivative.media_url && derivative.media_url !== 'https://placeholder.example.com/media' ? (
                      <img
                        src={derivative.media_url}
                        alt={derivative.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-amber-400" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-slate-50 mb-2 group-hover:text-amber-400 transition-colors line-clamp-2">
                      {derivative.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                      {derivative.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full" />
                      <p className="text-xs text-slate-400">
                        {derivative.creator.display_name || formatAddress(derivative.creator.wallet_address)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Section */}
        <div className="mt-12 bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-xl font-bold text-slate-50 mb-4">Asset Metadata</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Asset ID</p>
              <p className="text-slate-300 font-mono">#{asset.id}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Created</p>
              <p className="text-slate-300">{formatDate(asset.created_at)}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Last Updated</p>
              <p className="text-slate-300">{formatDate(asset.updated_at)}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Metadata Hash</p>
              <p className="text-slate-300 font-mono text-xs break-all">
                {asset.metadata_hash}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Remix Modal */}
      <RemixModal
        isOpen={showRemixModal}
        onClose={() => setShowRemixModal(false)}
        onSuccess={() => {
          setShowRemixModal(false);
          refetch(); // Refresh asset data to show new derivative
        }}
        parentAsset={asset}
      />
    </div>
  );
}
