/**
 * Dashboard Statistics Hook
 * Aggregates data from multiple sources for the dashboard
 */
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useAssets } from './useAssets';
import type { IPAssetListItem } from '@/types/api';

export interface DashboardStats {
  // User stats
  totalEarnings: number;
  totalEarningsFormatted: string;
  assetsCount: number;
  totalSpinoffs: number;

  // Asset breakdown
  totalAssets: number;
  liveAssets: number;
  pendingAssets: number;
  failedAssets: number;
  archivedAssets: number;

  // Derivatives
  totalDerivatives: number;
  derivativeGrowthData: { date: string; count: number }[];

  // Asset status for pie chart
  assetStatusData: { name: string; value: number; color: string }[];

  // Top performing assets (by derivative count)
  topAssets: IPAssetListItem[];
}

export function useDashboardStats() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Get user ID safely
  const userId = user?.id;

  // Fetch all user assets (active)
  const {
    assets: activeAssets,
    loading: activeLoading
  } = useAssets(
    userId !== undefined ? { creator: userId, is_deleted: false } : undefined
  );

  // Fetch archived assets
  const {
    assets: archivedAssets,
    loading: archivedLoading
  } = useAssets(
    userId !== undefined ? { creator: userId, is_deleted: true } : undefined
  );

  // Calculate aggregated stats
  const stats = useMemo<DashboardStats>(() => {
    const earnings = user ? parseFloat(user.total_earnings || '0') : 0;

    // Count by registration status
    const liveCount = activeAssets.filter(a => a.registration_status === 'registered').length;
    const pendingCount = activeAssets.filter(a =>
      a.registration_status === 'pending' || a.registration_status === 'retrying'
    ).length;
    const failedCount = activeAssets.filter(a => a.registration_status === 'failed').length;

    // Calculate total derivatives
    const totalDerivatives = activeAssets.reduce(
      (sum, asset) => sum + (asset.derivative_count || 0),
      0
    );

    // Asset status data for pie chart
    const assetStatusData = [
      { name: 'Live', value: liveCount, color: '#10b981' },
      { name: 'Pending', value: pendingCount, color: '#eab308' },
      { name: 'Failed', value: failedCount, color: '#ef4444' },
      { name: 'Archived', value: archivedAssets.length, color: '#6b7280' },
    ].filter(item => item.value > 0);

    // Generate derivative growth data (mock - based on asset creation dates)
    // In a real app, this would come from a dedicated API endpoint
    const derivativeGrowthData = generateDerivativeGrowthData(activeAssets);

    // Top assets by derivative count
    const topAssets = [...activeAssets]
      .sort((a, b) => (b.derivative_count || 0) - (a.derivative_count || 0))
      .slice(0, 5);

    return {
      totalEarnings: earnings,
      totalEarningsFormatted: earnings.toFixed(4),
      assetsCount: user?.assets_count || 0,
      totalSpinoffs: user?.total_spinoffs || 0,

      totalAssets: activeAssets.length + archivedAssets.length,
      liveAssets: liveCount,
      pendingAssets: pendingCount,
      failedAssets: failedCount,
      archivedAssets: archivedAssets.length,

      totalDerivatives,
      derivativeGrowthData,

      assetStatusData,
      topAssets,
    };
  }, [user, activeAssets, archivedAssets]);

  const loading = authLoading || activeLoading || archivedLoading;

  return {
    stats,
    user,
    isAuthenticated,
    loading,
    activeAssets,
    archivedAssets,
  };
}

/**
 * Generate derivative growth data based on asset creation dates
 * This simulates growth over time - in production, use a real API
 */
function generateDerivativeGrowthData(assets: IPAssetListItem[]): { date: string; count: number }[] {
  if (assets.length === 0) {
    return [];
  }

  // Get the last 30 days
  const data: { date: string; count: number }[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Count derivatives for assets created before this date
    const derivativesUpToDate = assets
      .filter(a => new Date(a.created_at) <= date)
      .reduce((sum, a) => sum + (a.derivative_count || 0), 0);

    data.push({
      date: dateStr,
      count: derivativesUpToDate,
    });
  }

  return data;
}

/**
 * Get time-based greeting
 */
export function getTimeGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Format large numbers with K/M suffix
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
