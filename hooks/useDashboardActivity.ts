/**
 * Dashboard Activity Feed Hook
 * Combines activity from multiple sources: royalties, derivatives, disputes, permissions
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useAssets } from './useAssets';

export type ActivityType =
  | 'royalty_received'
  | 'derivative_created'
  | 'dispute_filed'
  | 'dispute_resolved'
  | 'permission_granted'
  | 'permission_revoked'
  | 'asset_minted'
  | 'asset_registered';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  relativeTime: string;
  metadata?: {
    assetId?: string;
    assetTitle?: string;
    amount?: string;
    address?: string;
    status?: string;
  };
}

// Helper to generate relative time strings
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Generate activity from assets (minting, registration)
function generateAssetActivity(assets: any[]): ActivityItem[] {
  const activities: ActivityItem[] = [];

  assets.forEach(asset => {
    // Asset minted activity
    const mintedDate = new Date(asset.created_at);
    activities.push({
      id: `mint-${asset.id}`,
      type: 'asset_minted',
      title: 'Asset Minted',
      description: `"${asset.title}" was created`,
      timestamp: mintedDate,
      relativeTime: getRelativeTime(mintedDate),
      metadata: {
        assetId: asset.id,
        assetTitle: asset.title,
      },
    });

    // Asset registered activity (if registered)
    if (asset.registration_status === 'registered' && asset.story_ip_id) {
      // Assume registration happened shortly after creation
      const registeredDate = new Date(mintedDate.getTime() + 60000); // 1 min after
      activities.push({
        id: `register-${asset.id}`,
        type: 'asset_registered',
        title: 'Asset Registered',
        description: `"${asset.title}" registered on Story Protocol`,
        timestamp: registeredDate,
        relativeTime: getRelativeTime(registeredDate),
        metadata: {
          assetId: asset.id,
          assetTitle: asset.title,
        },
      });
    }

    // Derivative created activity (simulated based on derivative_count)
    if (asset.derivative_count > 0) {
      // Create one activity for derivatives
      const derivativeDate = new Date(mintedDate.getTime() + 86400000); // 1 day after
      activities.push({
        id: `derivative-${asset.id}`,
        type: 'derivative_created',
        title: 'Derivatives Created',
        description: `${asset.derivative_count} derivative${asset.derivative_count > 1 ? 's' : ''} of "${asset.title}"`,
        timestamp: derivativeDate,
        relativeTime: getRelativeTime(derivativeDate),
        metadata: {
          assetId: asset.id,
          assetTitle: asset.title,
        },
      });
    }
  });

  return activities;
}

// Generate mock activity for demo purposes
function generateMockActivity(): ActivityItem[] {
  const now = new Date();
  const activities: ActivityItem[] = [];

  // Mock royalty payment
  activities.push({
    id: 'mock-royalty-1',
    type: 'royalty_received',
    title: 'Royalty Received',
    description: 'Payment from derivative usage',
    timestamp: new Date(now.getTime() - 2 * 3600000), // 2 hours ago
    relativeTime: '2 hours ago',
    metadata: {
      amount: '0.0025 ETH',
    },
  });

  // Mock permission granted
  activities.push({
    id: 'mock-permission-1',
    type: 'permission_granted',
    title: 'Permission Granted',
    description: 'Execute permission granted to 0x1234...5678',
    timestamp: new Date(now.getTime() - 24 * 3600000), // 1 day ago
    relativeTime: '1 day ago',
    metadata: {
      address: '0x1234...5678',
    },
  });

  return activities;
}

export function useDashboardActivity(limit: number = 10) {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;

  // Fetch user's assets
  const { assets, loading: assetsLoading } = useAssets(
    userId !== undefined ? { creator: userId, is_deleted: false } : undefined
  );

  // Combine and sort all activities
  const activities = useMemo<ActivityItem[]>(() => {
    if (!isAuthenticated || !assets) {
      return [];
    }

    // Generate activities from various sources
    const assetActivities = generateAssetActivity(assets);
    const mockActivities = generateMockActivity();

    // Combine all activities
    const allActivities = [...assetActivities, ...mockActivities];

    // Sort by timestamp (newest first)
    allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Update relative times
    allActivities.forEach(activity => {
      activity.relativeTime = getRelativeTime(activity.timestamp);
    });

    // Return limited results
    return allActivities.slice(0, limit);
  }, [assets, isAuthenticated, limit]);

  // Refresh function to update relative times
  const refresh = useCallback(() => {
    // This would trigger a re-render with updated relative times
  }, []);

  return {
    activities,
    loading: assetsLoading,
    refresh,
    isEmpty: activities.length === 0,
  };
}

// Activity type configuration for UI
export const ACTIVITY_CONFIG: Record<ActivityType, {
  icon: string;
  color: string;
  bgColor: string;
}> = {
  royalty_received: {
    icon: 'Coins',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  derivative_created: {
    icon: 'GitBranch',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  dispute_filed: {
    icon: 'Gavel',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  dispute_resolved: {
    icon: 'CheckCircle',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  permission_granted: {
    icon: 'Shield',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  permission_revoked: {
    icon: 'ShieldOff',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  asset_minted: {
    icon: 'Plus',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
  asset_registered: {
    icon: 'CheckCircle',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
};
