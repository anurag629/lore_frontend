/**
 * React Query hooks for Favorites
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import type { IPAssetListItem } from '@/types/api';

export interface Favorite {
  id: string;  // UUID
  user: {
    id: number;
    wallet_address: string;
    display_name: string;
    avatar_url: string;
  };
  asset: IPAssetListItem;
  created_at: string;
}

/**
 * Hook to fetch user's favorites
 */
export function useFavorites(userId?: number) {
  return useQuery<Favorite[]>({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      const response = await favoritesAPI.getFavorites(userId);
      return Array.isArray(response) ? response : response.results || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to check if an asset is favorited
 */
export function useIsFavorited(assetId: string | null) {
  return useQuery<{ favorited: boolean }>({
    queryKey: ['favorite-check', assetId],
    queryFn: () => favoritesAPI.checkFavorite(assetId!),
    enabled: !!assetId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to toggle favorite status
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (assetId: string) => favoritesAPI.toggleFavorite(assetId),
    onSuccess: (data, assetId) => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      // Invalidate favorite check for this asset
      queryClient.invalidateQueries({ queryKey: ['favorite-check', assetId] });
      // Invalidate asset detail (might show favorite count)
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] });
      
      showToast(
        data.favorited ? 'Added to favorites!' : 'Removed from favorites',
        'success'
      );
    },
    onError: (error: any) => {
      showToast(
        error?.response?.data?.error || 'Failed to update favorite',
        'error'
      );
    },
  });
}

/**
 * Hook to remove a favorite
 */
export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (favoriteId: string) => favoritesAPI.removeFavorite(favoriteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      showToast('Removed from favorites', 'success');
    },
    onError: (error: any) => {
      showToast(
        error?.response?.data?.error || 'Failed to remove favorite',
        'error'
      );
    },
  });
}
