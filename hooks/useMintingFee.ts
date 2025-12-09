/**
 * React Query hooks for Minting Fee calculations and management
 */
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import type {
  MintingFeeInfo,
  MintingFeeStats,
  MintingFeePayment,
  MintingFeeBalance,
  ClaimMintingFeesResponse,
} from '@/types/api';

interface ParentSelection {
  parent_asset_id: string;
  attribution_percentage: number;
}

/**
 * Hook to calculate derivative fee for selected parents
 * Uses React state for immediate feedback during selection changes
 */
export function useMintingFeeCalculation() {
  const [feeInfo, setFeeInfo] = useState<MintingFeeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateFee = useCallback(async (parents: ParentSelection[]) => {
    if (parents.length === 0) {
      setFeeInfo(null);
      setError(null);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await assetsAPI.calculateDerivativeFee(parents);
      setFeeInfo(result);
      return result;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to calculate fee';
      setError(message);
      setFeeInfo(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFeeInfo(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    feeInfo,
    isLoading,
    error,
    calculateFee,
    reset,
  };
}

/**
 * Hook to get user's minting fee statistics
 */
export function useFeeStats() {
  return useQuery<MintingFeeStats>({
    queryKey: ['fee-stats'],
    queryFn: () => assetsAPI.getMyFeeStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get minting fee balance for a specific asset
 */
export function useFeeBalance(assetId: string | null) {
  return useQuery<MintingFeeBalance>({
    queryKey: ['fee-balance', assetId],
    queryFn: () => assetsAPI.getMintingFeeBalance(assetId!),
    enabled: !!assetId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get paginated list of fee payments
 */
export function useFeePayments(params?: {
  type?: 'received' | 'paid' | 'all';
  status?: 'pending' | 'paid' | 'claimed' | 'all';
  page?: number;
}) {
  return useQuery<MintingFeePayment[]>({
    queryKey: ['fee-payments', params],
    queryFn: async () => {
      const response = await assetsAPI.getMyFeePayments(params);
      return Array.isArray(response) ? response : response.results || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to claim minting fees for an asset
 */
export function useClaimMintingFees() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<ClaimMintingFeesResponse, Error, string>({
    mutationFn: (assetId: string) => assetsAPI.claimMintingFees(assetId),
    onSuccess: (data, assetId) => {
      // Invalidate fee-related queries
      queryClient.invalidateQueries({ queryKey: ['fee-stats'] });
      queryClient.invalidateQueries({ queryKey: ['fee-balance', assetId] });
      queryClient.invalidateQueries({ queryKey: ['fee-payments'] });
      // Also invalidate user data (total_earnings updated)
      queryClient.invalidateQueries({ queryKey: ['user'] });

      showToast(
        `Claimed ${data.claimed_amount.toFixed(4)} ETH (${data.claimed_count} payments)!`,
        'success'
      );
    },
    onError: (error: any) => {
      showToast(
        error?.response?.data?.error || 'Failed to claim fees',
        'error'
      );
    },
  });
}

/**
 * Hook to claim all unclaimed minting fees across all assets
 */
export function useClaimAllFees() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isClaimingAll, setIsClaimingAll] = useState(false);

  const claimAll = useCallback(async (assetIds: string[]) => {
    if (assetIds.length === 0) {
      showToast('No fees to claim', 'info');
      return;
    }

    setIsClaimingAll(true);
    let totalClaimed = 0;
    let totalCount = 0;
    let errors = 0;

    try {
      for (const assetId of assetIds) {
        try {
          const result = await assetsAPI.claimMintingFees(assetId);
          totalClaimed += result.claimed_amount;
          totalCount += result.claimed_count;
        } catch (err) {
          errors++;
        }
      }

      // Invalidate all fee-related queries
      queryClient.invalidateQueries({ queryKey: ['fee-stats'] });
      queryClient.invalidateQueries({ queryKey: ['fee-balance'] });
      queryClient.invalidateQueries({ queryKey: ['fee-payments'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });

      if (totalClaimed > 0) {
        showToast(
          `Claimed ${totalClaimed.toFixed(4)} ETH from ${totalCount} payments!${errors > 0 ? ` (${errors} failed)` : ''}`,
          errors > 0 ? 'warning' : 'success'
        );
      } else if (errors > 0) {
        showToast('Failed to claim fees', 'error');
      }

      return { totalClaimed, totalCount, errors };
    } finally {
      setIsClaimingAll(false);
    }
  }, [queryClient, showToast]);

  return {
    claimAll,
    isClaimingAll,
  };
}

/**
 * Utility function to format ETH amount
 */
export function formatEth(amount: number, decimals = 4): string {
  if (amount === 0) return 'FREE';
  return `${amount.toFixed(decimals)} ETH`;
}

/**
 * Utility function to estimate USD value (rough estimate)
 * Note: In production, use a price oracle
 */
export function estimateUsd(ethAmount: number, ethPrice = 2000): string {
  return `$${(ethAmount * ethPrice).toFixed(2)}`;
}
