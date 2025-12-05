/**
 * React hooks for IP Assets API
 */
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    count: number;
    next: string | null;
    previous: string | null;
  } | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Use refs to track component mount state
  const isMountedRef = useRef(true);
  
  // Create a stable key from params to detect changes
  const paramsKey = JSON.stringify({
    creator: params?.creator,
    is_derivative: params?.is_derivative,
    search: params?.search,
    page: params?.page,
  });

  // Fetch on mount and when params change
  useEffect(() => {
    isMountedRef.current = true;
    let isCancelled = false;
    
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response: PaginatedResponse<IPAssetListItem> = await assetsAPI.getAssets(params);
        
        // Only update state if this fetch wasn't cancelled
        if (!isCancelled && isMountedRef.current) {
          setAssets(response.results || []);
          setPagination({
            count: response.count,
            next: response.next,
            previous: response.previous,
          });
          setHasFetched(true);
        }
      } catch (err: any) {
        if (!isCancelled && isMountedRef.current) {
          let errorMessage = 'Failed to fetch assets';
          if (err.response?.data) {
            if (typeof err.response.data === 'string') {
              errorMessage = err.response.data;
            } else if (err.response.data.detail) {
              errorMessage = err.response.data.detail;
            } else if (err.response.data.message) {
              errorMessage = err.response.data.message;
            } else if (err.response.data.error) {
              errorMessage = err.response.data.error;
            }
          } else if (err.message) {
            errorMessage = err.message;
          }
          setError(errorMessage);
          console.error('Error fetching assets:', err);
        }
      } finally {
        if (!isCancelled && isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchAssets();
    
    // Cleanup: cancel this fetch if params change or component unmounts
    return () => {
      isCancelled = true;
      isMountedRef.current = false;
    };
  }, [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manual refetch function
  const refetch = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response: PaginatedResponse<IPAssetListItem> = await assetsAPI.getAssets(params);
      
      if (isMountedRef.current) {
        setAssets(response.results || []);
        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous,
        });
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        let errorMessage = 'Failed to fetch assets';
        if (err.response?.data) {
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (err.response.data.error) {
            errorMessage = err.response.data.error;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    assets,
    loading: loading || (!hasFetched && !error),
    error,
    pagination,
    refetch,
  };
}

// Hook to fetch single asset
export function useAsset(id: string | null) {
  const [asset, setAsset] = useState<IPAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  
  const isMountedRef = useRef(true);

  // Fetch on mount and when id changes
  useEffect(() => {
    isMountedRef.current = true;
    let isCancelled = false;
    
    // Reset state when id changes
    setAsset(null);
    setError(null);
    setHasFetched(false);
    
    const fetchAsset = async () => {
      // If no id, mark as fetched with null asset
      if (id === null) {
        if (!isCancelled && isMountedRef.current) {
          setHasFetched(true);
        }
        return;
      }

      try {
        setLoading(true);
        
        const data: IPAsset = await assetsAPI.getAsset(id);
        
        // Only update state if this fetch wasn't cancelled
        if (!isCancelled && isMountedRef.current) {
          setAsset(data);
          setHasFetched(true);
        }
      } catch (err: any) {
        if (!isCancelled && isMountedRef.current) {
          let errorMessage = 'Failed to fetch asset';
          
          if (err.response?.data) {
            const data = err.response.data;
            if (typeof data === 'string') {
              errorMessage = data;
            } else if (data.detail) {
              errorMessage = typeof data.detail === 'string' ? data.detail : String(data.detail);
            } else if (data.message) {
              errorMessage = typeof data.message === 'string' ? data.message : String(data.message);
            } else if (data.error) {
              errorMessage = typeof data.error === 'string' ? data.error : String(data.error);
            } else {
              errorMessage = JSON.stringify(data);
            }
          } else if (err.message) {
            errorMessage = typeof err.message === 'string' ? err.message : String(err.message);
          }
          
          setError(errorMessage);
          console.error('Error fetching asset:', err);
        }
      } finally {
        if (!isCancelled && isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchAsset();
    
    // Cleanup: cancel this fetch if id changes or component unmounts
    return () => {
      isCancelled = true;
      isMountedRef.current = false;
    };
  }, [id]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    if (id === null || !isMountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data: IPAsset = await assetsAPI.getAsset(id);
      
      if (isMountedRef.current) {
        setAsset(data);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        let errorMessage = 'Failed to fetch asset';
        
        if (err.response?.data) {
          const data = err.response.data;
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (data.detail) {
            errorMessage = typeof data.detail === 'string' ? data.detail : String(data.detail);
          } else if (data.message) {
            errorMessage = typeof data.message === 'string' ? data.message : String(data.message);
          } else if (data.error) {
            errorMessage = typeof data.error === 'string' ? data.error : String(data.error);
          } else {
            errorMessage = JSON.stringify(data);
          }
        } else if (err.message) {
          errorMessage = typeof err.message === 'string' ? err.message : String(err.message);
        }
        
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [id]);

  return {
    asset,
    loading: loading || (id !== null && !hasFetched && !error),
    error,
    refetch,
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

  const claimRoyalties = async (assetId: string): Promise<ClaimRoyaltiesResponse | null> => {
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
export function useRoyaltyBalance(assetId: string | null) {
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

// Hook to update asset
export function useUpdateAsset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAsset = useCallback(async (id: string, data: { title: string; description: string }): Promise<IPAsset | null> => {
    try {
      setLoading(true);
      setError(null);
      const result: IPAsset = await assetsAPI.updateAsset(id, data);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to update asset';
      setError(errorMessage);
      console.error('Error updating asset:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    updateAsset,
    loading,
    error,
    clearError,
  };
}

// Hook to delete asset
export function useDeleteAsset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAsset = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await assetsAPI.deleteAsset(id);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to delete asset';
      setError(errorMessage);
      console.error('Error deleting asset:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    deleteAsset,
    loading,
    error,
    clearError,
  };
}

// Hook to retry asset creation
export function useRetryCreation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retryCreation = useCallback(async (id: string): Promise<IPAsset | null> => {
    try {
      setLoading(true);
      setError(null);
      const result: { asset: IPAsset; message?: string; resumed_from_step?: string } = await assetsAPI.retryCreation(id);
      return result.asset || result as any;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to retry asset creation';
      setError(errorMessage);
      console.error('Error retrying asset creation:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    retryCreation,
    loading,
    error,
    clearError,
  };
}
