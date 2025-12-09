'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, Loader2, ArrowLeft, Trash2, UserPlus, Copy, Check, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAsset } from '@/hooks/useAssets';
import { useAssetPermissions, useRevokePermission } from '@/hooks/usePermissions';
import PermissionsModal from '@/components/permissions/PermissionsModal';
import { useToast } from '@/components/ui/Toast';
import type { PermissionType, IPAccountPermission } from '@/types/api';

const PERMISSION_CONFIG: { key: PermissionType; label: string; icon: string; color: string }[] = [
  { key: 'execute', label: 'Execute', icon: '⚡', color: 'from-yellow-500/20 to-orange-500/20' },
  { key: 'transfer_erc20', label: 'Transfer', icon: '💰', color: 'from-green-500/20 to-emerald-500/20' },
  { key: 'set_metadata', label: 'Metadata', icon: '📝', color: 'from-blue-500/20 to-cyan-500/20' },
  { key: 'attach_license', label: 'License', icon: '📜', color: 'from-purple-500/20 to-pink-500/20' },
  { key: 'register_derivative', label: 'Derivatives', icon: '🔀', color: 'from-indigo-500/20 to-violet-500/20' },
  { key: 'collect_royalty', label: 'Royalties', icon: '💎', color: 'from-amber-500/20 to-yellow-500/20' },
];

export default function PermissionsPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params?.id ? (params.id as string) : null;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { asset, loading: assetLoading } = useAsset(assetId);
  const { permissions, loading, error, refetch } = useAssetPermissions(assetId);
  const { revokePermission, loading: revoking } = useRevokePermission();
  const [showModal, setShowModal] = useState(false);
  const [expandedAddresses, setExpandedAddresses] = useState<Set<string>>(new Set());
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (assetId) refetch();
  }, [assetId, refetch]);

  const isOwner = asset && user && asset.creator.id === user.id;

  if (authLoading || assetLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !asset || !isOwner) {
    router.push('/');
    return null;
  }

  const handleRevoke = async (granteeAddress: string, permissionType: PermissionType) => {
    const ok = await revokePermission({
      asset_id: asset.id,
      grantee_address: granteeAddress,
      permission_type: permissionType,
    });
    if (ok) {
      showToast('Permission revoked', 'success');
      refetch();
    } else {
      showToast('Failed to revoke permission', 'error');
    }
  };

  const toggleAddressExpand = (address: string) => {
    const newExpanded = new Set(expandedAddresses);
    if (newExpanded.has(address)) {
      newExpanded.delete(address);
    } else {
      newExpanded.add(address);
    }
    setExpandedAddresses(newExpanded);
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Group permissions by grantee address
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!perm.is_granted) return acc;
    const addr = perm.grantee_address;
    if (!acc[addr]) acc[addr] = [];
    acc[addr].push(perm);
    return acc;
  }, {} as Record<string, IPAccountPermission[]>);

  const addressCount = Object.keys(groupedPermissions).length;
  const totalPermissions = permissions.filter(p => p.is_granted).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Grant Permission
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Asset Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl">
                <Shield className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-400 uppercase tracking-wide mb-1">
                  IP Permissions
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{asset.title}</h1>
                <p className="text-slate-400 text-sm mt-1">
                  Control who can interact with your intellectual property
                </p>
              </div>
            </div>
            <Link
              href={`/explore/${asset.id}`}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors text-sm"
            >
              View Asset
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{addressCount}</p>
            <p className="text-sm text-slate-400">Addresses</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">{totalPermissions}</p>
            <p className="text-sm text-slate-400">Permissions</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 text-center col-span-2 sm:col-span-2">
            <div className="flex justify-center gap-2 mb-1">
              {PERMISSION_CONFIG.map(p => (
                <span key={p.key} className="text-lg" title={p.label}>{p.icon}</span>
              ))}
            </div>
            <p className="text-sm text-slate-400">6 Permission Types</p>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl">
            {error}
          </div>
        )}

        {/* Permissions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden"
        >
          <div className="p-4 border-b border-slate-800/50">
            <h2 className="text-lg font-semibold text-white">Granted Permissions</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading permissions...
            </div>
          ) : addressCount === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Permissions Yet</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Grant permissions to allow others to interact with your IP asset on the Story Protocol.
              </p>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Grant First Permission
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {Object.entries(groupedPermissions).map(([address, perms], index) => (
                <motion.div
                  key={address}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <button
                    onClick={() => toggleAddressExpand(address)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="font-mono text-white text-sm sm:text-base">
                          <span className="hidden sm:inline">{address}</span>
                          <span className="sm:hidden">{address.slice(0, 10)}...{address.slice(-8)}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                            {perms.length} permission{perms.length !== 1 ? 's' : ''}
                          </span>
                          <div className="flex -space-x-1">
                            {perms.slice(0, 4).map((perm) => {
                              const config = PERMISSION_CONFIG.find(c => c.key === perm.permission_type);
                              return (
                                <span key={perm.uuid} className="text-sm" title={config?.label}>
                                  {config?.icon}
                                </span>
                              );
                            })}
                            {perms.length > 4 && (
                              <span className="text-xs text-slate-400 ml-1">+{perms.length - 4}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); copyAddress(address); }}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Copy address"
                      >
                        {copiedAddress === address ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      {expandedAddresses.has(address) ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedAddresses.has(address) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-800/20 border-t border-slate-800/50 overflow-hidden"
                      >
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {perms.map((perm) => {
                            const config = PERMISSION_CONFIG.find(c => c.key === perm.permission_type);
                            return (
                              <div
                                key={perm.uuid}
                                className={`group/perm flex items-center justify-between bg-gradient-to-r ${config?.color || 'from-slate-700/50 to-slate-600/50'} rounded-xl p-3 border border-slate-700/30`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{config?.icon || '🔐'}</span>
                                  <div>
                                    <p className="font-medium text-white text-sm">{config?.label || perm.permission_type}</p>
                                    <p className="text-xs text-slate-400">
                                      {new Date(perm.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRevoke(address, perm.permission_type)}
                                  disabled={revoking}
                                  className="p-2 opacity-0 group-hover/perm:opacity-100 hover:bg-red-500/20 rounded-lg transition-all"
                                  title="Revoke permission"
                                >
                                  {revoking ? (
                                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Permissions Modal */}
      <PermissionsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => refetch()}
        assetId={asset.id}
        assetTitle={asset.title}
      />
    </div>
  );
}
