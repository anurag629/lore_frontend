/**
 * React Query hooks for comments
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Comment, CommentCreate, CommentUpdate } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

/**
 * Fetch comments for an asset
 */
export function useComments(assetId: number | null, parentId?: number | null) {
  return useQuery({
    queryKey: ['comments', assetId, parentId],
    queryFn: async () => {
      if (!assetId) return [];
      
      const params = new URLSearchParams({ asset: assetId.toString() });
      if (parentId) {
        params.append('parent', parentId.toString());
      } else {
        // Only top-level comments
        params.append('parent', '');
      }
      
      const response = await api.get<Comment[]>(`/api/social/comments/?${params.toString()}`);
      return response.data;
    },
    enabled: !!assetId,
  });
}

/**
 * Fetch replies to a specific comment
 */
export function useCommentReplies(commentId: number) {
  return useQuery({
    queryKey: ['comments', 'replies', commentId],
    queryFn: async () => {
      const response = await api.get<Comment[]>(`/api/social/comments/${commentId}/replies/`);
      return response.data;
    },
    enabled: !!commentId,
  });
}

/**
 * Create a new comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: CommentCreate) => {
      const response = await api.post<Comment>('/api/social/comments/', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate comments queries for the asset
      queryClient.invalidateQueries({ queryKey: ['comments', data.asset] });
      // Also invalidate parent comment's replies if it's a reply
      if (data.parent) {
        queryClient.invalidateQueries({ queryKey: ['comments', 'replies', data.parent] });
      }
      showToast('Comment posted successfully!', 'success');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || error.response?.data?.content?.[0] || 'Failed to post comment';
      showToast(message, 'error');
    },
  });
}

/**
 * Update a comment
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CommentUpdate }) => {
      const response = await api.patch<Comment>(`/api/social/comments/${id}/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate comments queries
      queryClient.invalidateQueries({ queryKey: ['comments', data.asset] });
      if (data.parent) {
        queryClient.invalidateQueries({ queryKey: ['comments', 'replies', data.parent] });
      }
      showToast('Comment updated successfully!', 'success');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || error.response?.data?.content?.[0] || 'Failed to update comment';
      showToast(message, 'error');
    },
  });
}

/**
 * Delete a comment (soft delete)
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/social/comments/${id}/`);
    },
    onSuccess: (_, id) => {
      // Invalidate all comment queries - we'll refetch to get updated data
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      showToast('Comment deleted successfully!', 'success');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to delete comment';
      showToast(message, 'error');
    },
  });
}

/**
 * Like/unlike a comment
 */
export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post<{ liked: boolean }>(`/api/social/comments/${id}/like/`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate comments to refresh like status
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

