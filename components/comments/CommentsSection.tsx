'use client';

import { useState } from 'react';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import CommentCard from './CommentCard';
import Button from '@/components/ui/Button';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';

interface CommentsSectionProps {
  assetId: number;
}

export default function CommentsSection({ assetId }: CommentsSectionProps) {
  const { isAuthenticated } = useAuth();
  const { data: comments, isLoading } = useComments(assetId);
  const createComment = useCreateComment();
  const { showToast } = useToast();
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment.mutateAsync({
        asset: assetId,
        content: newComment.trim(),
      });
      setNewComment('');
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyingTo) return;

    try {
      await createComment.mutateAsync({
        asset: assetId,
        parent: replyingTo,
        content: replyContent.trim(),
      });
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleReply = (commentId: number) => {
    setReplyingTo(commentId);
  };

  return (
    <div className="mt-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-50 mb-2 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-amber-400" />
          Comments {comments && comments.length > 0 && `(${comments.length})`}
        </h2>
        <p className="text-slate-400">
          Share your thoughts and engage with the community
        </p>
      </div>

      {/* New Comment Form */}
      {isAuthenticated ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 mb-6">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
            />
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewComment('')}
                disabled={!newComment.trim() || createComment.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!newComment.trim() || createComment.isPending}
              >
                {createComment.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6 text-center">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">
            Please connect your wallet to join the discussion
          </p>
          <Button variant="primary" onClick={() => showToast('Please connect your wallet', 'info')}>
            Connect Wallet
          </Button>
        </div>
      )}

      {/* Reply Form (when replying to a comment) */}
      {replyingTo && isAuthenticated && (
        <div className="bg-slate-900 rounded-xl border border-amber-800/50 p-4 mb-6">
          <form onSubmit={handleSubmitReply} className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400">Replying to comment</span>
            </div>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
            />
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                disabled={createComment.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!replyContent.trim() || createComment.isPending}
              >
                {createComment.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post Reply
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              assetId={assetId}
              onReply={handleReply}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No comments yet"
          description="Be the first to share your thoughts!"
        />
      )}
    </div>
  );
}

