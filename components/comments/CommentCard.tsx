'use client';

import { useState } from 'react';
import { Comment } from '@/lib/types';
import { useCommentReplies, useDeleteComment, useLikeComment } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
// Simple date formatter
const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
};
import {
  MessageSquare,
  Trash2,
  MoreVertical,
  Heart,
  Reply,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface CommentCardProps {
  comment: Comment;
  assetId: string;  // UUID
  onReply?: (commentId: string) => void;  // UUID
  level?: number;
}

export default function CommentCard({ comment, assetId, onReply, level = 0 }: CommentCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [showReplies, setShowReplies] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { data: replies, isLoading: repliesLoading } = useCommentReplies(comment.id);
  const deleteComment = useDeleteComment();
  const likeComment = useLikeComment();

  const isOwner = isAuthenticated && user?.id === comment.user.id;
  const hasReplies = comment.reply_count > 0;

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDelete = async () => {
    await deleteComment.mutateAsync(comment.id);
    setShowDeleteConfirm(false);
    setShowActions(false);
  };

  const handleLike = async () => {
    if (!isAuthenticated) return;
    await likeComment.mutateAsync(comment.id);
  };

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-slate-800 pl-4' : ''}`}>
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 hover:border-slate-700 transition-colors">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center flex-shrink-0">
              {comment.user.avatar_url ? (
                <img
                  src={comment.user.avatar_url}
                  alt={comment.user.display_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {comment.user.display_name?.[0]?.toUpperCase() || formatAddress(comment.user.wallet_address)[0]}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-50">
                {comment.user.display_name || formatAddress(comment.user.wallet_address)}
              </p>
              <p className="text-xs text-slate-400">
                {formatDistanceToNow(new Date(comment.created_at))}
              </p>
            </div>
          </div>

          {/* Actions Menu */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 text-slate-400 hover:text-slate-50 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden min-w-[120px]">
                    <button
                      onClick={() => {
                        setShowActions(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="mb-3">
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        {/* Comment Actions */}
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={!isAuthenticated || likeComment.isPending}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm">Like</span>
          </button>

          {/* Reply Button */}
          {onReply && (
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <Reply className="w-4 h-4" />
              <span className="text-sm">Reply</span>
            </button>
          )}

          {/* Show Replies Toggle */}
          {hasReplies && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-50 transition-colors ml-auto"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">
                {showReplies ? 'Hide' : 'Show'} {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
              </span>
            </button>
          )}
        </div>

        {/* Replies Section */}
        {showReplies && (
          <div className="mt-4 space-y-3">
            {repliesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              </div>
            ) : replies && replies.length > 0 ? (
              replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  assetId={assetId}
                  onReply={onReply}
                  level={level + 1}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-2">No replies yet</p>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleteComment.isPending}
      />
    </div>
  );
}

