/**
 * React hooks for Group IP API
 */
import { useState, useCallback } from 'react';
import { groupsAPI } from '@/lib/api';
import type {
  GroupIP,
  GroupIPMembership,
  GroupIPStatistics,
  GroupRoyaltyDistribution,
  PaginatedResponse,
} from '@/types/api';

// Hook to fetch list of groups
export function useGroups(params?: {
  creator?: string;
  is_active?: boolean;
  registration_status?: 'pending' | 'registered' | 'failed';
}) {
  const [groups, setGroups] = useState<GroupIP[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedResponse<GroupIP> = await groupsAPI.getGroups(params);
      setGroups(response.results || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to fetch groups';
      setError(errorMessage);
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  return {
    groups,
    loading,
    error,
    refetch: fetchGroups,
  };
}

// Hook to fetch single group
export function useGroup(id: string | null) {
  const [group, setGroup] = useState<GroupIP | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroup = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data: GroupIP = await groupsAPI.getGroup(id);
      setGroup(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to fetch group';
      setError(errorMessage);
      console.error('Error fetching group:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    group,
    loading,
    error,
    refetch: fetchGroup,
  };
}

// Hook to create group
export function useCreateGroup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGroup = useCallback(async (data: {
    name: string;
    description: string;
    total_royalty_percentage: number;
  }): Promise<GroupIP | null> => {
    try {
      setLoading(true);
      setError(null);
      const result: GroupIP = await groupsAPI.createGroup(data);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to create group';
      setError(errorMessage);
      console.error('Error creating group:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createGroup,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to update group
export function useUpdateGroup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGroup = useCallback(async (id: string, data: {
    name?: string;
    description?: string;
    total_royalty_percentage?: number;
  }): Promise<GroupIP | null> => {
    try {
      setLoading(true);
      setError(null);
      const result: GroupIP = await groupsAPI.updateGroup(id, data);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to update group';
      setError(errorMessage);
      console.error('Error updating group:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateGroup,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to register group on blockchain
export function useRegisterGroup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerGroup = useCallback(async (id: string, creatorAddress?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await groupsAPI.registerGroup(id, creatorAddress);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to register group';
      setError(errorMessage);
      console.error('Error registering group:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    registerGroup,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to add member to group
export function useAddMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMember = useCallback(async (groupId: string, assetUuid: string, revenueShare: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await groupsAPI.addMember(groupId, {
        asset_uuid: assetUuid,
        revenue_share_percentage: revenueShare,
      });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to add member';
      setError(errorMessage);
      console.error('Error adding member:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    addMember,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to remove member from group
export function useRemoveMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeMember = useCallback(async (groupId: string, assetUuid: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await groupsAPI.removeMember(groupId, { asset_uuid: assetUuid });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to remove member';
      setError(errorMessage);
      console.error('Error removing member:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    removeMember,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to get group statistics
export function useGroupStatistics(id: string | null) {
  const [statistics, setStatistics] = useState<GroupIPStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data: GroupIPStatistics = await groupsAPI.getStatistics(id);
      setStatistics(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to fetch statistics';
      setError(errorMessage);
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
  };
}

// Hook to get group distributions
export function useGroupDistributions(id: string | null) {
  const [distributions, setDistributions] = useState<GroupRoyaltyDistribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDistributions = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedResponse<GroupRoyaltyDistribution> = await groupsAPI.getDistributions(id);
      setDistributions(response.results || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to fetch distributions';
      setError(errorMessage);
      console.error('Error fetching distributions:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    distributions,
    loading,
    error,
    refetch: fetchDistributions,
  };
}

