/**
 * React Query hooks for Collections
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export interface Collection {
  id: string;  // UUID
  title: string;
  description: string;
  creator: {
    id: number;
    wallet_address: string;
    display_name: string;
    avatar_url: string;
  };
  cover_image_url: string | null;
  is_public: boolean;
  asset_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionDetail extends Collection {
  assets: any[]; // IPAsset[]
}

/**
 * Hook to fetch collections
 */
export function useCollections(params?: { creator?: number; is_public?: boolean }) {
  return useQuery<Collection[]>({
    queryKey: ['collections', params],
    queryFn: async () => {
      const response = await collectionsAPI.getCollections(params);
      return Array.isArray(response) ? response : response.results || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single collection
 */
export function useCollection(id: string) {
  return useQuery<CollectionDetail>({
    queryKey: ['collection', id],
    queryFn: () => collectionsAPI.getCollection(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a collection
 */
export function useCreateCollection() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      cover_image_url?: string;
      cover_image?: File;  // File upload for cover image
      is_public?: boolean;
      asset_ids?: string[];  // UUIDs
    }) => collectionsAPI.createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      showToast('Collection created successfully!', 'success');
    },
    onError: (error: any) => {
      showToast(
        error?.response?.data?.error || 'Failed to create collection',
        'error'
      );
    },
  });
}

/**
 * Hook to update a collection
 */
export function useUpdateCollection() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      collectionsAPI.updateCollection(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection', variables.id] });
      showToast('Collection updated successfully!', 'success');
    },
    onError: (error: any) => {
      showToast(
        error?.response?.data?.error || 'Failed to update collection',
        'error'
      );
    },
  });
}

/**
 * Hook to delete a collection
 */
export function useDeleteCollection() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => collectionsAPI.deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      showToast('Collection deleted successfully!', 'success');
    },
    onError: (error: any) => {
      showToast(
        error?.response?.data?.error || 'Failed to delete collection',
        'error'
      );
    },
  });
}

/**
 * Hook to add asset to collection
 */
export function useAddAssetToCollection() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ collectionId, assetId }: { collectionId: string; assetId: string }) =>
      collectionsAPI.addAssetToCollection(collectionId, assetId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collection', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      showToast('Asset added to collection!', 'success');
    },
    onError: (error: any) => {
      showToast(
        error?.response?.data?.error || 'Failed to add asset to collection',
        'error'
      );
    },
  });
}

/**
 * Hook to remove asset from collection
 */
export function useRemoveAssetFromCollection() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ collectionId, assetId }: { collectionId: string; assetId: string }) =>
      collectionsAPI.removeAssetFromCollection(collectionId, assetId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collection', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      showToast('Asset removed from collection!', 'success');
    },
    onError: (error: any) => {
      showToast(
        error?.response?.data?.error || 'Failed to remove asset from collection',
        'error'
      );
    },
  });
}
