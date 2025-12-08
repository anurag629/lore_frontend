/**
 * React hooks for IP Account Permissions API
 */
import { useState, useCallback } from 'react';
import { permissionsAPI } from '@/lib/api';
import type {
  IPAccountPermission,
  PermissionSummary,
  PermissionType,
  PaginatedResponse,
} from '@/types/api';

// Hook to fetch permissions
export function usePermissions(params?: {
  asset_uuid?: string;
  permissioned_address?: string;
  permission_type?: PermissionType;
  is_active?: boolean;
}) {
  const [permissions, setPermissions] = useState<IPAccountPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedResponse<IPAccountPermission> = await permissionsAPI.getPermissions(params);
      setPermissions(response.results || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to fetch permissions';
      setError(errorMessage);
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  return {
    permissions,
    loading,
    error,
    refetch: fetchPermissions,
  };
}

// Hook to get permissions for an asset
export function useAssetPermissions(assetUuid: string | null) {
  const [permissions, setPermissions] = useState<IPAccountPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!assetUuid) return;
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedResponse<IPAccountPermission> = await permissionsAPI.getPermissionsForAsset(assetUuid);
      setPermissions(response.results || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to fetch permissions';
      setError(errorMessage);
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  }, [assetUuid]);

  return {
    permissions,
    loading,
    error,
    refetch: fetchPermissions,
  };
}

// Hook to set a single permission
export function useSetPermission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPermission = useCallback(async (data: {
    asset_uuid: string;
    permissioned_address: string;
    permission_type: PermissionType;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await permissionsAPI.setPermission(data);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to set permission';
      setError(errorMessage);
      console.error('Error setting permission:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    setPermission,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to set all permissions
export function useSetAllPermissions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAllPermissions = useCallback(async (data: {
    asset_uuid: string;
    permissioned_address: string;
    permissions: {
      signer: boolean;
      register_derivative: boolean;
      register_derivative_with_attribution: boolean;
    };
  }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await permissionsAPI.setAllPermissions(data);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to set permissions';
      setError(errorMessage);
      console.error('Error setting permissions:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    setAllPermissions,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to revoke a permission
export function useRevokePermission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revokePermission = useCallback(async (data: {
    asset_uuid: string;
    permissioned_address: string;
    permission_type: PermissionType;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await permissionsAPI.revokePermission(data);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to revoke permission';
      setError(errorMessage);
      console.error('Error revoking permission:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    revokePermission,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to revoke all permissions
export function useRevokeAllPermissions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revokeAllPermissions = useCallback(async (data: {
    asset_uuid: string;
    permissioned_address: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await permissionsAPI.revokeAllPermissions(data);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to revoke permissions';
      setError(errorMessage);
      console.error('Error revoking permissions:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    revokeAllPermissions,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to check permission
export function useCheckPermission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermission = useCallback(async (params: {
    asset_uuid: string;
    permissioned_address: string;
    permission_type: PermissionType;
  }): Promise<{ has_permission: boolean; permission?: IPAccountPermission } | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await permissionsAPI.checkPermission(params);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to check permission';
      setError(errorMessage);
      console.error('Error checking permission:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    checkPermission,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to get permission summary
export function usePermissionSummary(assetUuid: string | null, permissionedAddress: string | null) {
  const [summary, setSummary] = useState<PermissionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!assetUuid || !permissionedAddress) return;
    try {
      setLoading(true);
      setError(null);
      const data: PermissionSummary = await permissionsAPI.getPermissionSummary({
        asset_uuid: assetUuid,
        permissioned_address: permissionedAddress,
      });
      setSummary(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to fetch summary';
      setError(errorMessage);
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  }, [assetUuid, permissionedAddress]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
}

