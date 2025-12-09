/**
 * React hook for infinite scroll pagination of IP Assets
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { assetsAPI } from '@/lib/api';
import type { IPAssetListItem, PaginatedResponse } from '@/types/api';

export interface AssetFilters {
  search?: string;
  is_derivative?: boolean;
  allow_derivatives?: boolean;
  commercial_rights?: boolean;
  royalty_percentage_min?: number;
  royalty_percentage_max?: number;
  ordering?: string;
}

interface UseInfiniteAssetsReturn {
  assets: IPAssetListItem[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  fetchMore: () => void;
  refetch: () => void;
  totalCount: number;
}

export function useInfiniteAssets(filters: AssetFilters = {}): UseInfiniteAssetsReturn {
  const [assets, setAssets] = useState<IPAssetListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const isMountedRef = useRef(true);
  const filtersKey = JSON.stringify(filters);
  const prevFiltersKey = useRef(filtersKey);

  // Reset when filters change
  useEffect(() => {
    if (prevFiltersKey.current !== filtersKey) {
      prevFiltersKey.current = filtersKey;
      setAssets([]);
      setPage(1);
      setHasMore(true);
      setError(null);
    }
  }, [filtersKey]);

  // Fetch assets
  const fetchAssets = useCallback(async (pageNum: number, isLoadMore: boolean = false) => {
    if (!isMountedRef.current) return;

    try {
      if (isLoadMore) {
        setIsFetchingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const params: Record<string, any> = {
        page: pageNum,
        ...filters,
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response: PaginatedResponse<IPAssetListItem> = await assetsAPI.getAssets(params);

      if (!isMountedRef.current) return;

      const newAssets = (response.results || []).filter(
        (asset: IPAssetListItem) => !asset.is_deleted
      );

      if (isLoadMore) {
        setAssets(prev => [...prev, ...newAssets]);
      } else {
        setAssets(newAssets);
      }

      setTotalCount(response.count);
      setHasMore(response.next !== null);
    } catch (err: any) {
      if (!isMountedRef.current) return;

      let errorMessage = 'Failed to fetch assets';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    }
  }, [filters]);

  // Initial fetch and when filters change
  useEffect(() => {
    isMountedRef.current = true;
    fetchAssets(1, false);

    return () => {
      isMountedRef.current = false;
    };
  }, [filtersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch more (for infinite scroll)
  const fetchMore = useCallback(() => {
    if (isFetchingMore || !hasMore || isLoading) return;

    const nextPage = page + 1;
    setPage(nextPage);
    fetchAssets(nextPage, true);
  }, [isFetchingMore, hasMore, isLoading, page, fetchAssets]);

  // Manual refetch (reset to page 1)
  const refetch = useCallback(() => {
    setAssets([]);
    setPage(1);
    setHasMore(true);
    fetchAssets(1, false);
  }, [fetchAssets]);

  return {
    assets,
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    fetchMore,
    refetch,
    totalCount,
  };
}

export default useInfiniteAssets;
