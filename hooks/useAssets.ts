/**
 * React hooks for IP Assets API
 */
import { useState, useEffect, useCallback } from 'react';
import { assetsAPI } from '@/lib/api';
import type {
  IPAsset,
  IPAssetListItem,
  PaginatedResponse,
  CreateIPAssetData,
  CreateDerivativeData,
  ClaimRoyaltiesResponse,
  RoyaltyBalance,
} from '@/types/api';

// Hook to fetch list of assets
export function useAssets(params?: {
  creator?: number;
  is_derivative?: boolean;
  search?: string;
  page?: number;
}) {
  const [assets, setAssets] = useState<IPAssetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    count: number;
    next: string | null;
    previous: string | null;
  } | null>(null);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedResponse<IPAssetListItem> = await assetsAPI.getAssets(params);
      setAssets(response.results);
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch assets');
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  }, [params?.creator, params?.is_derivative, params?.search, params?.page]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    loading,
    error,
    pagination,
    refetch: fetchAssets,
  };
}

// Hook to fetch single asset
export function useAsset(id: number | null) {
  const [asset, setAsset] = useState<IPAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAsset = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data: IPAsset = await assetsAPI.getAsset(id);
      setAsset(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch asset');
      console.error('Error fetching asset:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  return {
    asset,
    loading,
    error,
    refetch: fetchAsset,
  };
}

// Hook to create asset
export function useCreateAsset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAsset = async (data: CreateIPAssetData): Promise<IPAsset | null> => {
    try {
      setLoading(true);
      setError(null);

      // Create FormData
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('royalty_percentage', data.royalty_percentage.toString());
      formData.append('allow_derivatives', data.allow_derivatives.toString());
      formData.append('commercial_rights', data.commercial_rights.toString());

      if (data.media_file) {
        formData.append('media_file', data.media_file);
      } else if (data.media_url) {
        formData.append('media_url', data.media_url);
      }

      const result: IPAsset = await assetsAPI.createAsset(formData);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to create asset';
      setError(errorMessage);
      console.error('Error creating asset:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createAsset,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to create derivative
export function useCreateDerivative() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDerivative = async (data: CreateDerivativeData): Promise<IPAsset | null> => {
    try {
      setLoading(true);
      setError(null);

      // Create FormData
      const formData = new FormData();
      formData.append('parent_asset_id', data.parent_asset_id.toString());
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('commercial_rights', data.commercial_rights.toString());

      if (data.media_file) {
        formData.append('media_file', data.media_file);
      } else if (data.media_url) {
        formData.append('media_url', data.media_url);
      }

      const result: IPAsset = await assetsAPI.createDerivative(formData);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to create derivative';
      setError(errorMessage);
      console.error('Error creating derivative:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createDerivative,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to claim royalties
export function useClaimRoyalties() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimRoyalties = async (assetId: number): Promise<ClaimRoyaltiesResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const result: ClaimRoyaltiesResponse = await assetsAPI.claimRoyalties(assetId);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to claim royalties';
      setError(errorMessage);
      console.error('Error claiming royalties:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    claimRoyalties,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to get royalty balance
export function useRoyaltyBalance(assetId: number | null) {
  const [balance, setBalance] = useState<RoyaltyBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!assetId) return;

    try {
      setLoading(true);
      setError(null);
      const data: RoyaltyBalance = await assetsAPI.getRoyaltyBalance(assetId);
      setBalance(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch balance');
      console.error('Error fetching royalty balance:', err);
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
}
