'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Share2,
  GitBranch,
  MoreHorizontal,
  ExternalLink,
  Repeat2,
} from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useToggleFavorite, useIsFavorited } from '@/hooks/useFavorites';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import type { IPAssetListItem, IPAsset } from '@/types/api';
import ShareModal from '@/components/share/ShareModal';
import RemixModal from '@/components/mint/RemixModal';
import FeedComments from './FeedComments';

interface FeedCardProps {
  asset: IPAssetListItem;
  onMediaClick?: (asset: IPAssetListItem) => void;
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Format wallet address
function formatAddress(address: string): string {
  if (!address) return 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format count for display
function formatCount(count: number): string {
  if (count === 0) return '';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export default function FeedCard({ asset, onMediaClick }: FeedCardProps) {
  const { isAuthenticated } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRemixModal, setShowRemixModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);

  // Hooks
  const toggleFavorite = useToggleFavorite();
  const { data: favoriteData } = useIsFavorited(asset.id);
  const { data: comments } = useComments(asset.id);

  const isLiked = favoriteData?.favorited ?? false;
  const commentCount = comments?.length ?? 0;
  const derivativeCount = asset.derivative_count ?? 0;

  // Handle like toggle
  const handleLikeToggle = useCallback(() => {
    if (!isAuthenticated) return;
    setIsLikeAnimating(true);
    toggleFavorite.mutate(asset.id);
    setTimeout(() => setIsLikeAnimating(false), 300);
  }, [isAuthenticated, toggleFavorite, asset.id]);

  // Handle double tap to like (mobile)
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapTime < 300) {
      if (!isLiked) {
        handleLikeToggle();
      }
    }
    setLastTapTime(now);
  }, [lastTapTime, isLiked, handleLikeToggle]);

  // Creator display name and handle
  const creatorName = asset.creator?.display_name || formatAddress(asset.creator?.wallet_address || '');
  const creatorHandle = `@${formatAddress(asset.creator?.wallet_address || '')}`;

  return (
    <>
      <article className="border-b border-slate-800 sm:border sm:border-slate-800/50 sm:rounded-xl sm:mb-4 bg-transparent sm:bg-slate-900/50 hover:bg-slate-900/30 sm:hover:bg-slate-800/30 transition-colors">
        {/* Card Header */}
        <div className="px-3 sm:px-4 pt-3 sm:pt-4 flex items-start gap-3">
          {/* Avatar */}
          <Link
            href={`/profile/${asset.creator?.wallet_address}`}
            className="flex-shrink-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-[2px]">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                {asset.creator?.avatar_url ? (
                  <img
                    src={asset.creator.avatar_url}
                    alt={creatorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-amber-400">
                    {creatorName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Creator info row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <Link
                  href={`/profile/${asset.creator?.wallet_address}`}
                  className="font-semibold text-white text-[15px] hover:underline truncate"
                >
                  {creatorName}
                </Link>
                <span className="text-slate-500 text-sm hidden sm:inline">·</span>
                <span className="text-slate-500 text-sm truncate hidden sm:inline">
                  {creatorHandle}
                </span>
                <span className="text-slate-500 text-sm">·</span>
                <span className="text-slate-500 text-sm flex-shrink-0">
                  {formatRelativeTime(asset.created_at)}
                </span>
              </div>

              {/* More options */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 -m-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-full transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {showMoreMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMoreMenu(false)}
                    />
                    <div className="absolute right-0 top-8 z-20 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[180px]">
                      <Link
                        href={`/explore/${asset.id}`}
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Details
                      </Link>
                      <Link
                        href={`/profile/${asset.creator?.wallet_address}`}
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Creator
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <Link href={`/explore/${asset.id}`}>
              <h3 className="text-[15px] font-medium text-white leading-snug mt-1 hover:underline">
                {asset.title}
              </h3>
            </Link>

            {/* Description */}
            {asset.description && (
              <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                {asset.description}
              </p>
            )}
          </div>
        </div>

        {/* Media */}
        <div
          className="mt-3 mx-0 sm:mx-3 cursor-pointer relative"
          onClick={() => {
            handleDoubleTap();
            if (onMediaClick) onMediaClick(asset);
          }}
        >
          <div className="relative aspect-[16/9] sm:rounded-xl overflow-hidden bg-slate-800">
            {asset.media_url && asset.media_url !== 'https://placeholder.example.com/media' ? (
              <OptimizedImage
                src={asset.media_url}
                alt={asset.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg
                      className="w-6 h-6 text-slate-500"
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
                  <p className="text-slate-500 text-xs">No Preview</p>
                </div>
              </div>
            )}

            {/* Double-tap heart animation */}
            {isLikeAnimating && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="w-20 h-20 text-red-500 fill-red-500 drop-shadow-lg" />
              </motion.div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-2">
              {asset.is_derivative && (
                <span className="px-2 py-1 bg-purple-500/90 text-white text-xs font-medium rounded-full flex items-center gap-1">
                  <Repeat2 className="w-3 h-3" />
                  Remix
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar - Twitter Style */}
        <div className="flex items-center justify-around px-2 py-1 sm:px-4 sm:py-2">
          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1 p-2 rounded-full transition-colors group ${
              showComments
                ? 'text-blue-400'
                : 'text-slate-500 hover:text-blue-400 hover:bg-blue-500/10'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            {commentCount > 0 && (
              <span className="text-xs">{formatCount(commentCount)}</span>
            )}
          </button>

          {/* Remix Button */}
          <button
            onClick={() => asset.allow_derivatives && isAuthenticated && setShowRemixModal(true)}
            disabled={!asset.allow_derivatives || !isAuthenticated}
            className={`flex items-center gap-1 p-2 rounded-full transition-colors group ${
              asset.allow_derivatives
                ? 'text-slate-500 hover:text-green-400 hover:bg-green-500/10'
                : 'text-slate-700 cursor-not-allowed'
            }`}
            title={!asset.allow_derivatives ? 'Remixing not allowed' : 'Create a remix'}
          >
            <GitBranch className="w-5 h-5" />
            {derivativeCount > 0 && (
              <span className="text-xs">{formatCount(derivativeCount)}</span>
            )}
          </button>

          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            disabled={!isAuthenticated || toggleFavorite.isPending}
            className={`flex items-center gap-1 p-2 rounded-full transition-colors group ${
              isLiked
                ? 'text-red-500'
                : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <motion.div
              animate={isLikeAnimating ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.div>
            <span className="text-xs">{formatCount(isLiked ? 1 : 0)}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1 p-2 rounded-full text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors group"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Section (Expandable) */}
        {showComments && (
          <FeedComments assetId={asset.id} />
        )}
      </article>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={asset.title}
        url={`/explore/${asset.id}`}
        description={asset.description}
      />

      {/* Remix Modal */}
      {showRemixModal && (
        <RemixModal
          isOpen={showRemixModal}
          onClose={() => setShowRemixModal(false)}
          onSuccess={() => setShowRemixModal(false)}
          parentAsset={asset as unknown as IPAsset}
        />
      )}
    </>
  );
}
