'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAsset, useRoyaltyBalance, useClaimRoyalties, useRetryCreation } from '@/hooks/useAssets';
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
  Coins,
  Heart,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  FileText,
  Link2,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import RemixModal from '@/components/mint/RemixModal';
import EditAssetModal from '@/components/mint/EditAssetModal';
import ShareModal from '@/components/share/ShareModal';
import { useToast } from '@/components/ui/Toast';
import { useClipboard } from '@/hooks/useClipboard';
import { useToggleFavorite, useIsFavorited } from '@/hooks/useFavorites';
import OptimizedImage from '@/components/ui/OptimizedImage';
import CommentsSection from '@/components/comments/CommentsSection';
import CreationStatusCard from '@/components/assets/CreationStatusCard';

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const assetId = params?.id ? (params.id as string) : null;
  
  const { asset, loading, error, refetch } = useAsset(assetId);
  const { user, isAuthenticated } = useAuth();
  const [showRemixModal, setShowRemixModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedIpId, setCopiedIpId] = useState(false);
  const { showToast } = useToast();
  const { copy } = useClipboard();
  
  // Favorites
  const { data: favoriteData } = useIsFavorited(assetId);
  const toggleFavorite = useToggleFavorite();
  const isFavorited = favoriteData?.favorited || false;

  // Royalty claiming
  const { balance, loading: balanceLoading, refetch: refetchBalance } = useRoyaltyBalance(assetId);
  const { claimRoyalties, loading: claiming, error: claimError } = useClaimRoyalties();
  
  // Retry creation
  const { retryCreation, loading: retrying, error: retryError } = useRetryCreation();

  // Format wallet address for display
  const formatAddress = (address: string | null | undefined) => {
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

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  // Handle copy
  const handleCopy = async (text: string, type: 'id' | 'ipId') => {
    try {
      await copy(text, type === 'id' ? 'Asset ID' : 'IP ID');
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else {
        setCopiedIpId(true);
        setTimeout(() => setCopiedIpId(false), 2000);
      }
    } catch (err) {
      // Error handling is done in the copy function
    }
  };

  // Handle royalty claiming
  const handleClaimRoyalties = async () => {
    if (!assetId) return;

    const result = await claimRoyalties(assetId);
    if (result) {
      refetchBalance();
      showToast(`Successfully claimed ${result.amount} ETH in royalties!`, 'success');
    }
  };

  // Handle retry creation
  const handleRetryCreation = async () => {
    if (!assetId) return;

    const result = await retryCreation(assetId);
    if (result) {
      showToast('Asset creation retry started!', 'success');
      setTimeout(() => {
        refetch();
      }, 1000);
    } else {
      showToast(retryError || 'Failed to retry asset creation', 'error');
    }
  };

  // Auto-refresh if asset is retrying
  useEffect(() => {
    if (asset?.registration_status === 'retrying') {
      const interval = setInterval(() => {
        refetch();
      }, 3000); // Check every 3 seconds
      return () => clearInterval(interval);
    }
  }, [asset?.registration_status, refetch]);

  // Enhanced loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="relative mb-6">
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-50 mb-2">Loading Asset</h3>
          <p className="text-slate-400">Fetching asset details...</p>
        </motion.div>
      </div>
    );
  }

  // Enhanced error state
  if (error || !asset) {
    const errorMessage = error || 'Asset not found';
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="p-8 bg-slate-900/50 backdrop-blur-sm border border-red-500/20 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-400">Error Loading Asset</h3>
                <p className="text-red-300 text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="primary"
                onClick={() => refetch()}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/explore')}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Explore
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === asset.creator.id;

  // Get registration status badge
  const getStatusBadge = () => {
    if (asset.registration_status === 'registered') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Registered
        </span>
      );
    }
    if (asset.registration_status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
          <XCircle className="w-3.5 h-3.5" />
          Failed
        </span>
      );
    }
    if (asset.registration_status === 'retrying') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Retrying
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        <Clock className="w-3.5 h-3.5" />
        Pending
      </span>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Backdrop */}
      <div className="relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-slate-400 hover:text-slate-50 mb-6 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            {/* Left Column - Media */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Main Media Card */}
              <div className="group relative bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-hidden shadow-2xl hover:border-amber-500/50 transition-all duration-300">
                {/* Media Container */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                  {asset.media_url && asset.media_url !== 'https://placeholder.example.com/media' ? (
                    <>
                      <OptimizedImage
                        src={asset.media_url}
                        alt={asset.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-orange-600/20 to-amber-600/20 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="text-center"
                      >
                        <div className="w-24 h-24 bg-amber-600/30 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                          <Sparkles className="w-12 h-12 text-amber-400" />
                        </div>
                        <p className="text-slate-400 font-medium">No media preview</p>
                      </motion.div>
                    </div>
                  )}

                  {/* Overlay Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
                    <div className="flex items-center gap-2 flex-wrap">
                      {asset.is_derivative && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm"
                        >
                          <TrendingUp className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-semibold">Derivative</span>
                        </motion.div>
                      )}
                      {getStatusBadge()}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="p-2.5 bg-slate-900/80 backdrop-blur-sm hover:bg-slate-900 rounded-lg border border-slate-700 hover:border-amber-500/50 transition-all duration-200 group"
                        title="Share"
                      >
                        <Share2 className="w-5 h-5 text-slate-300 group-hover:text-amber-400 transition-colors" />
                      </button>
                      {isAuthenticated && (
                        <button
                          onClick={() => assetId && toggleFavorite.mutate(assetId)}
                          disabled={toggleFavorite.isPending}
                          className={`p-2.5 rounded-lg transition-all duration-200 ${
                            isFavorited
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                              : 'bg-slate-900/80 backdrop-blur-sm text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50'
                          }`}
                          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart
                            className={`w-5 h-5 transition-all ${isFavorited ? 'fill-current scale-110' : ''}`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Story Protocol Info */}
                <div className="p-5 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Story Protocol IP ID</p>
                      </div>
                      {asset.story_ip_id ? (
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono text-amber-400 font-semibold truncate">
                            {formatAddress(asset.story_ip_id)}
                          </p>
                          <button
                            onClick={() => handleCopy(asset.story_ip_id!, 'ipId')}
                            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors group"
                            title="Copy IP ID"
                          >
                            {copiedIpId ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">Not registered on-chain</p>
                      )}
                    </div>
                    {asset.story_ip_id && (
                      <a
                        href={`https://explorer.story.foundation/ipa/${asset.story_ip_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors group"
                        title="View on Story Protocol Explorer"
                      >
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Parent Asset Card (if derivative) */}
              {asset.is_derivative && asset.parent_asset && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-5 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <GitBranch className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Remixed From</h3>
                  </div>
                  <Link
                    href={`/explore/${asset.parent_asset.id}`}
                    className="group flex items-center gap-4 p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all duration-200"
                  >
                    <div className="relative w-16 h-16 bg-slate-700 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                      {asset.parent_asset.media_url && asset.parent_asset.media_url !== 'https://placeholder.example.com/media' ? (
                        <OptimizedImage
                          src={asset.parent_asset.media_url}
                          alt={asset.parent_asset.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                          <Sparkles className="w-8 h-8 text-purple-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-50 mb-1 line-clamp-1 group-hover:text-purple-400 transition-colors">
                        {asset.parent_asset.title}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        by {asset.parent_asset.creator.display_name || formatAddress(asset.parent_asset.creator.wallet_address)}
                      </p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-slate-400 rotate-180 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
              )}
            </motion.div>

            {/* Right Column - Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-6"
            >
              {/* Title Section */}
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl sm:text-5xl font-bold text-slate-50 mb-3 leading-tight"
                >
                  {asset.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-slate-300 leading-relaxed text-lg"
                >
                  {asset.description}
                </motion.p>
              </div>

              {/* Creation Status Card (Owner Only) */}
              <AnimatePresence>
                {isOwner && asset && (
                  (asset.registration_status === 'failed' || 
                   asset.registration_status === 'pending' || 
                   asset.registration_status === 'retrying' ||
                   (asset.creation_step && asset.creation_step !== 'completed')) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CreationStatusCard
                        asset={asset}
                        onRetry={handleRetryCreation}
                        isRetrying={retrying}
                      />
                    </motion.div>
                  )
                )}
              </AnimatePresence>

              {/* Creator Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-5 hover:border-amber-500/50 transition-all duration-300"
              >
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Creator</p>
                <Link
                  href={`/profile/${asset.creator.wallet_address}`}
                  className="flex items-center gap-4 group"
                >
                  <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-slate-800 group-hover:ring-amber-500/50 transition-all">
                    {asset.creator.avatar_url ? (
                      <OptimizedImage
                        src={asset.creator.avatar_url}
                        alt={asset.creator.display_name || 'Creator'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-7 h-7 text-white/80" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-50 group-hover:text-amber-400 transition-colors line-clamp-1">
                      {asset.creator.display_name || 'Anonymous Creator'}
                    </p>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      {formatAddress(asset.creator.wallet_address)}
                    </p>
                  </div>
                  {isOwner && (
                    <span className="px-3 py-1 bg-amber-600/20 text-amber-400 text-xs rounded-full font-semibold border border-amber-500/30">
                      You
                    </span>
                  )}
                </Link>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-5 hover:border-amber-500/50 transition-all duration-300 group">
                  <div className="flex items-center gap-2 text-slate-400 mb-3">
                    <GitBranch className="w-4 h-4 group-hover:text-amber-400 transition-colors" />
                    <span className="text-xs font-medium uppercase tracking-wide">Derivatives</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-50 group-hover:text-amber-400 transition-colors">
                    {asset.derivative_count || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Remixes created</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-5 hover:border-amber-500/50 transition-all duration-300 group">
                  <div className="flex items-center gap-2 text-slate-400 mb-3">
                    <Calendar className="w-4 h-4 group-hover:text-amber-400 transition-colors" />
                    <span className="text-xs font-medium uppercase tracking-wide">Created</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-50 group-hover:text-amber-400 transition-colors">
                    {formatDate(asset.created_at).split(',')[0]}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{formatRelativeTime(asset.created_at)}</p>
                </div>
              </motion.div>

              {/* Royalty Section (Owner Only) */}
              {isOwner && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-amber-900/30 via-orange-900/20 to-amber-900/30 rounded-xl border border-amber-800/50 p-6 backdrop-blur-sm shadow-xl shadow-amber-900/20"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <Coins className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-50">Royalty Earnings</h3>
                      <p className="text-xs text-slate-400">From derivative sales</p>
                    </div>
                  </div>

                  {balanceLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="mb-5">
                        <p className="text-sm text-slate-400 mb-2">Available to Claim</p>
                        <p className="text-4xl font-bold text-amber-400 mb-1">
                          {balance ? parseFloat(balance.balance).toFixed(6) : '0.000000'} <span className="text-2xl text-amber-500/80">ETH</span>
                        </p>
                        <p className="text-xs text-slate-500">
                          From {asset.derivative_count || 0} derivative{asset.derivative_count !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {claimError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4 flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <p className="text-red-400 text-sm">{claimError}</p>
                        </motion.div>
                      )}

                      <Button
                        variant="primary"
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-600/20"
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
                        <p className="text-xs text-slate-500 text-center mt-3">
                          No royalties available to claim yet
                        </p>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {/* License Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-50">License Terms</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    {asset.allow_derivatives ? (
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <XCircle className="w-5 h-5 text-red-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-slate-50 font-semibold mb-1">Derivatives / Remixes</p>
                      <p className="text-sm text-slate-400">
                        {asset.allow_derivatives
                          ? 'Allowed - You can create derivatives of this work'
                          : 'Not allowed - Derivatives are restricted'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    {asset.commercial_rights ? (
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <XCircle className="w-5 h-5 text-red-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-slate-50 font-semibold mb-1">Commercial Use</p>
                      <p className="text-sm text-slate-400">
                        {asset.commercial_rights
                          ? 'Allowed - Commercial use is permitted'
                          : 'Not allowed - Personal use only'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-50 font-semibold mb-1">Royalty Rate</p>
                      <p className="text-sm text-slate-400">
                        {asset.royalty_percentage}% of derivative revenue goes to the creator
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                {asset.allow_derivatives && !isOwner && (
                  <Button
                    variant="primary"
                    className="flex-1 py-3.5 text-base font-semibold shadow-lg shadow-amber-600/20"
                    onClick={() => {
                      if (isAuthenticated) {
                        setShowRemixModal(true);
                      } else {
                        showToast('Please connect your wallet to create a remix', 'warning');
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
                    className="flex-1 py-3.5 text-base font-semibold"
                    onClick={() => setShowEditModal(true)}
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Edit Asset
                  </Button>
                )}

                {asset.story_ip_id && (
                  <a
                    href={`https://explorer.story.foundation/ipa/${asset.story_ip_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-slate-700 hover:border-amber-500/50 hover:text-amber-400"
                  >
                    View on Story
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Derivatives Section */}
          {asset.derivatives && asset.derivatives.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 mb-8"
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-50">Derivatives</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      {asset.derivatives.length} creative work{asset.derivatives.length !== 1 ? 's' : ''} inspired by this IP asset
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {asset.derivatives.map((derivative, index) => (
                  <motion.div
                    key={derivative.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <Link
                      href={`/explore/${derivative.id}`}
                      className="group block bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20 hover:-translate-y-1"
                    >
                      <div className="relative h-48 bg-slate-800 overflow-hidden">
                        {derivative.media_url && derivative.media_url !== 'https://placeholder.example.com/media' ? (
                          <OptimizedImage
                            src={derivative.media_url}
                            alt={derivative.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-purple-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-slate-50 mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                          {derivative.title}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                          {derivative.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {derivative.creator.avatar_url ? (
                              <OptimizedImage
                                src={derivative.creator.avatar_url}
                                alt={derivative.creator.display_name || 'Creator'}
                                width={28}
                                height={28}
                                className="rounded-full"
                              />
                            ) : (
                              <User className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate">
                            {derivative.creator.display_name || formatAddress(derivative.creator.wallet_address)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <CommentsSection assetId={asset.id} />
          </motion.div>

          {/* Metadata Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-50">Asset Metadata</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Asset ID</p>
                <div className="flex items-center gap-2">
                  <p className="text-slate-300 font-mono text-sm truncate">{asset.id}</p>
                  <button
                    onClick={() => handleCopy(asset.id, 'id')}
                    className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors group"
                    title="Copy Asset ID"
                  >
                    {copiedId ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Created</p>
                <p className="text-slate-300">{formatDate(asset.created_at)}</p>
              </div>
              {asset.updated_at && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Last Updated</p>
                  <p className="text-slate-300">{formatDate(asset.updated_at)}</p>
                </div>
              )}
              {asset.metadata_hash && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Metadata Hash</p>
                  <div className="flex items-center gap-2">
                    <p className="text-slate-300 font-mono text-xs break-all">{asset.metadata_hash}</p>
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${asset.metadata_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors group"
                      title="View on IPFS"
                    >
                      <Link2 className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <RemixModal
        isOpen={showRemixModal}
        onClose={() => setShowRemixModal(false)}
        onSuccess={() => {
          setShowRemixModal(false);
          refetch();
        }}
        parentAsset={asset}
      />

      <EditAssetModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          setShowEditModal(false);
          refetch();
        }}
        asset={asset}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={asset.title}
      />
    </div>
  );
}
