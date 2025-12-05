/**
 * React Query hooks for comments
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Comment, CommentCreate, CommentUpdate, PaginatedResponse } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

/**
 * Fetch comments for an asset
 */
export function useComments(assetId: string | null, parentId?: string | null) {
  return useQuery({
    queryKey: ['comments', assetId, parentId],
    queryFn: async () => {
      if (!assetId) return [];
      
      const params = new URLSearchParams({ asset: assetId });
      if (parentId) {
        params.append('parent', parentId);
      }
      // If no parentId, backend defaults to top-level comments (parent__isnull=True)
      
      const response = await api.get<PaginatedResponse<Comment>>(`/api/social/comments/?${params.toString()}`);
      return response.data.results;
    },
    enabled: !!assetId,
  });
}

/**
 * Fetch replies to a specific comment
 */
export function useCommentReplies(commentId: string) {
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
      // Invalidate all comment queries for the asset (this will match any query starting with ['comments', assetId])
      queryClient.invalidateQueries({ 
        queryKey: ['comments', data.asset],
        exact: false  // Match all queries that start with this key
      });
      // Also invalidate parent comment's replies if it's a reply
      if (data.parent) {
        queryClient.invalidateQueries({ queryKey: ['comments', 'replies', data.parent] });
      }
      // Invalidate all comment queries to ensure reply counts update
      queryClient.invalidateQueries({ queryKey: ['comments'] });
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
    mutationFn: async ({ id, data }: { id: string; data: CommentUpdate }) => {
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
    mutationFn: async (id: string) => {
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
    mutationFn: async (id: string) => {
      const response = await api.post<{ liked: boolean }>(`/api/social/comments/${id}/like/`);
      return response.data;
    },
    onSuccess: (_, commentId) => {
      // Invalidate all comment queries to refresh like status
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      // Also invalidate replies for this comment
      queryClient.invalidateQueries({ queryKey: ['comments', 'replies', commentId] });
    },
  });
}
