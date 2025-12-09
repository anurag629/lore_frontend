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
  asset?: string;
  grantee?: string;
  type?: PermissionType;
  active_only?: boolean;
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
export function useAssetPermissions(assetId: string | null) {
  const [permissions, setPermissions] = useState<IPAccountPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!assetId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await permissionsAPI.getPermissionsForAsset(assetId);
      setPermissions(response.permissions || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to fetch permissions';
      setError(errorMessage);
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  }, [assetId]);

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
    asset_id: string;
    grantee_address: string;
    permission_type: PermissionType;
    is_granted?: boolean;
    expires_at?: string;
    notes?: string;
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

// Hook to set multiple selected permissions
export function useSetSelectedPermissions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setSelectedPermissions = useCallback(async (data: {
    asset_id: string;
    grantee_address: string;
    permissions: {
      execute: boolean;
      transfer_erc20: boolean;
      set_metadata: boolean;
      attach_license: boolean;
      register_derivative: boolean;
      collect_royalty: boolean;
    };
    notes?: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Set each permission individually based on selection
      const permissionTypes: PermissionType[] = [
        'execute', 'transfer_erc20', 'set_metadata',
        'attach_license', 'register_derivative', 'collect_royalty'
      ];

      for (const permType of permissionTypes) {
        if (data.permissions[permType]) {
          await permissionsAPI.setPermission({
            asset_id: data.asset_id,
            grantee_address: data.grantee_address,
            permission_type: permType,
            is_granted: true,
            notes: data.notes,
          });
        }
      }

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

  const clearError = useCallback(() => setError(null), []);

  return {
    setSelectedPermissions,
    loading,
    error,
    clearError,
  };
}

// Hook to set all permissions (grant or revoke all at once)
export function useSetAllPermissions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAllPermissions = useCallback(async (data: {
    asset_id: string;
    grantee_address: string;
    is_granted?: boolean;
    expires_at?: string;
    notes?: string;
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
    asset_id: string;
    grantee_address: string;
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
    asset_id: string;
    grantee_address: string;
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
    asset_id: string;
    grantee_address: string;
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
export function usePermissionSummary(assetId: string | null, granteeAddress: string | null) {
  const [summary, setSummary] = useState<PermissionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!assetId || !granteeAddress) return;
    try {
      setLoading(true);
      setError(null);
      const data: PermissionSummary = await permissionsAPI.getPermissionSummary({
        asset_id: assetId,
        grantee_address: granteeAddress,
      });
      setSummary(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to fetch summary';
      setError(errorMessage);
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  }, [assetId, granteeAddress]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
}

