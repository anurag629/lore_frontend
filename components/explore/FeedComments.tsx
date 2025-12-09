'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  Reply,
  X,
  Check,
} from 'lucide-react';
import {
  useComments,
  useCreateComment,
  useLikeComment,
  useUpdateComment,
  useDeleteComment,
  useCommentReplies,
} from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import type { Comment } from '@/lib/types';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface FeedCommentsProps {
  assetId: string;
  initialShowCount?: number;
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
  return `${diffDays}d`;
}

// Format wallet address
function formatAddress(address: string): string {
  if (!address) return 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Reply Input Component
function ReplyInput({
  assetId,
  parentId,
  onCancel,
  onSuccess,
}: {
  assetId: string;
  parentId: string;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const createComment = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createComment.mutateAsync({
        asset: assetId,
        parent: parentId,
        content: content.trim(),
      });
      setContent('');
      onSuccess();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2 ml-11">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-[1px] flex-shrink-0">
        <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="You" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-amber-400">
              {(user?.username || 'Y').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-3 focus-within:border-amber-500/50 transition-colors">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a reply..."
          className="flex-1 bg-transparent py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          autoFocus
        />
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <button
          type="submit"
          disabled={!content.trim() || createComment.isPending}
          className="text-amber-500 hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {createComment.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </form>
  );
}

// Edit Input Component
function EditInput({
  comment,
  onCancel,
  onSuccess,
}: {
  comment: Comment;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [content, setContent] = useState(comment.content);
  const updateComment = useUpdateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.trim() === comment.content) {
      onCancel();
      return;
    }

    try {
      await updateComment.mutateAsync({
        id: comment.id,
        data: { content: content.trim() },
      });
      onSuccess();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1">
      <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 focus-within:border-amber-500/50 transition-colors">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          autoFocus
        />
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          type="submit"
          disabled={!content.trim() || updateComment.isPending}
          className="text-green-500 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {updateComment.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
}

// Replies List Component
function RepliesList({
  parentId,
  assetId,
}: {
  parentId: string;
  assetId: string;
}) {
  const { data: replies, isLoading } = useCommentReplies(parentId);

  if (isLoading) {
    return (
      <div className="ml-11 mt-2 flex items-center gap-2 text-xs text-slate-500">
        <Loader2 className="w-3 h-3 animate-spin" />
        Loading replies...
      </div>
    );
  }

  if (!replies || replies.length === 0) return null;

  return (
    <div className="ml-11 mt-1 space-y-1 border-l-2 border-slate-800 pl-3">
      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          assetId={assetId}
          isReply
        />
      ))}
    </div>
  );
}

// Single Comment Component
function CommentItem({
  comment,
  assetId,
  isReply = false,
}: {
  comment: Comment;
  assetId: string;
  isReply?: boolean;
}) {
  const { isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const likeComment = useLikeComment();
  const deleteComment = useDeleteComment();

  const displayName = comment.user?.display_name || formatAddress(comment.user?.wallet_address || '');

  const handleDelete = async () => {
    await deleteComment.mutateAsync(comment.id);
    setShowDeleteModal(false);
    setShowMenu(false);
  };

  // If comment is deleted, show placeholder
  if (comment.is_deleted) {
    return (
      <div className={`flex gap-3 ${isReply ? 'py-2' : 'py-3'}`}>
        <div className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-slate-800 flex-shrink-0`} />
        <div className="flex-1">
          <p className="text-slate-500 text-sm italic">This comment has been deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isReply ? 'py-2' : 'py-3'}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Link
          href={`/profile/${comment.user?.wallet_address}`}
          className="flex-shrink-0"
        >
          <div className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-[1px]`}>
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
              {comment.user?.avatar_url ? (
                <img
                  src={comment.user.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${isReply ? 'text-[10px]' : 'text-xs'} font-bold text-amber-400`}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <EditInput
              comment={comment}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
            />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-0.5">
                <Link
                  href={`/profile/${comment.user?.wallet_address}`}
                  className={`font-medium text-white ${isReply ? 'text-xs' : 'text-sm'} hover:text-amber-400 transition-colors`}
                >
                  {displayName}
                </Link>
                <span className={`text-slate-500 ${isReply ? 'text-[10px]' : 'text-xs'}`}>
                  {formatRelativeTime(comment.created_at)}
                </span>
                {comment.created_at !== comment.updated_at && (
                  <span className={`text-slate-600 ${isReply ? 'text-[10px]' : 'text-xs'}`}>(edited)</span>
                )}

                {/* More Menu - only for own comments */}
                {comment.is_own_comment && isAuthenticated && (
                  <div className="relative ml-auto">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-1 -m-1 text-slate-500 hover:text-slate-300 rounded transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute right-0 top-6 z-20 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden min-w-[120px]">
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowMenu(false);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteModal(true);
                              setShowMenu(false);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <p className={`text-slate-300 ${isReply ? 'text-xs' : 'text-sm'} leading-relaxed break-words`}>
                {comment.content}
              </p>
            </>
          )}

          {/* Comment Actions */}
          {!isEditing && (
            <div className="flex items-center gap-3 mt-1.5">
              {/* Like */}
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    likeComment.mutate(comment.id);
                  }
                }}
                disabled={!isAuthenticated || likeComment.isPending}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  comment.is_liked
                    ? 'text-red-400'
                    : 'text-slate-500 hover:text-red-400'
                } disabled:opacity-50`}
              >
                <Heart className={`w-3.5 h-3.5 ${comment.is_liked ? 'fill-current' : ''}`} />
                {comment.like_count > 0 && <span>{comment.like_count}</span>}
              </button>

              {/* Reply button - only for top-level comments */}
              {!isReply && isAuthenticated && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    isReplying ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'
                  }`}
                >
                  <Reply className="w-3.5 h-3.5" />
                  Reply
                </button>
              )}

              {/* Show replies toggle */}
              {!isReply && comment.reply_count > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {showReplies ? 'Hide' : 'View'} {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reply Input */}
      {isReplying && (
        <ReplyInput
          assetId={assetId}
          parentId={comment.id}
          onCancel={() => setIsReplying(false)}
          onSuccess={() => {
            setIsReplying(false);
            setShowReplies(true);
          }}
        />
      )}

      {/* Replies */}
      {showReplies && !isReply && (
        <RepliesList parentId={comment.id} assetId={assetId} />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteComment.isPending}
      />
    </div>
  );
}

export default function FeedComments({ assetId, initialShowCount = 2 }: FeedCommentsProps) {
  const { isAuthenticated, user } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [newComment, setNewComment] = useState('');

  const { data: comments, isLoading } = useComments(assetId);
  const createComment = useCreateComment();

  const commentsList = comments || [];
  const displayedComments = showAll ? commentsList : commentsList.slice(0, initialShowCount);
  const hasMore = commentsList.length > initialShowCount;

  // Handle comment submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      await createComment.mutateAsync({
        asset: assetId,
        content: newComment.trim(),
      });
      setNewComment('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="border-t border-slate-800/50 overflow-hidden"
    >
      <div className="p-4">
        {/* Comment Input */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
            {/* Current user avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-[1px] flex-shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-amber-400">
                    {(user?.username || 'Y').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="flex-1 flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 focus-within:border-amber-500/50 transition-colors">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || createComment.isPending}
                className="text-amber-500 hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createComment.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-3 mb-4 bg-slate-800/30 rounded-lg">
            <p className="text-slate-400 text-sm">
              Connect wallet to comment
            </p>
          </div>
        )}

        {/* Comments List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
          </div>
        ) : commentsList.length > 0 ? (
          <>
            <div className="divide-y divide-slate-800/50">
              <AnimatePresence>
                {displayedComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <CommentItem comment={comment} assetId={assetId} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Show more/less toggle */}
            {hasMore && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-1 mt-3 text-sm text-slate-400 hover:text-white transition-colors"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    View all {commentsList.length} comments
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <p className="text-center text-slate-500 text-sm py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </motion.div>
  );
}
