'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Shield, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAsset } from '@/hooks/useAssets';
import { useAssetPermissions, useRevokePermission } from '@/hooks/usePermissions';
import GrantPermissionModal from '@/components/permissions/GrantPermissionModal';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

export default function PermissionsPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params?.id ? (params.id as string) : null;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { asset, loading: assetLoading } = useAsset(assetId);
  const { permissions, loading, error, refetch } = useAssetPermissions(assetId);
  const { revokePermission, loading: revoking } = useRevokePermission();
  const [showGrant, setShowGrant] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const isOwner = asset && user && asset.creator.id === user.id;

  if (authLoading || assetLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !asset || !isOwner) {
    router.push('/');
    return null;
  }

  const handleRevoke = async (permissionId: string, permissionedAddress: string, permissionType: string) => {
    const ok = await revokePermission({
      asset_uuid: asset.id,
      permissioned_address: permissionedAddress,
      permission_type: permissionType as any,
    });
    if (ok) {
      showToast('Permission revoked', 'success');
      refetch();
    } else {
      showToast('Failed to revoke permission', 'error');
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-300 hover:text-slate-50 transition-colors cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </div>
          <Button variant="primary" onClick={() => setShowGrant(true)}>
            <Shield className="w-4 h-4" /> Grant Permissions
          </Button>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 text-amber-400 mb-2">
            <Shield className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-wide">Permissions</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{asset.title}</h1>
          <p className="text-slate-400 text-sm">
            Manage who can interact with this IP asset. Navigate here from Dashboard → More → Permissions.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading permissions...
            </div>
          ) : permissions.length === 0 ? (
            <div className="text-slate-400 text-sm">No permissions granted yet.</div>
          ) : (
            <div className="space-y-3">
              {permissions.map((perm) => (
                <div key={perm.uuid} className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div>
                    <p className="text-white font-semibold">{perm.permission_type}</p>
                    <p className="text-slate-400 text-sm">{perm.permissioned_address}</p>
                    <p className="text-slate-500 text-xs">Granted: {new Date(perm.granted_at).toLocaleString()}</p>
                  </div>
                  <Button
                    variant="danger"
                    className="px-3 py-2 text-sm"
                    onClick={() => handleRevoke(perm.uuid, perm.permissioned_address, perm.permission_type)}
                    disabled={revoking}
                  >
                    {revoking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {asset && (
        <GrantPermissionModal
          isOpen={showGrant}
          onClose={() => setShowGrant(false)}
          onSuccess={() => {
            refetch();
          }}
          assetUuid={asset.id}
        />
      )}
    </div>
  );
}

