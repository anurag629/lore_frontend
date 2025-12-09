'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Shield,
  Loader2,
  ArrowLeft,
  Trash2,
  UserPlus,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  Wallet,
  FileText,
  ScrollText,
  GitBranch,
  Coins,
  Users,
  Info,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAsset } from '@/hooks/useAssets';
import { useAssetPermissions, useRevokePermission } from '@/hooks/usePermissions';
import PermissionsModal from '@/components/permissions/PermissionsModal';
import { useToast } from '@/components/ui/Toast';
import type { PermissionType, IPAccountPermission } from '@/types/api';

const PERMISSION_CONFIG: {
  key: PermissionType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    key: 'execute',
    label: 'Execute',
    description: 'Execute transactions on behalf of the IP',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  {
    key: 'transfer_erc20',
    label: 'Transfer',
    description: 'Transfer ERC20 tokens from the IP account',
    icon: Wallet,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  {
    key: 'set_metadata',
    label: 'Metadata',
    description: 'Update IP metadata and attributes',
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    key: 'attach_license',
    label: 'License',
    description: 'Attach license terms to the IP',
    icon: ScrollText,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  {
    key: 'register_derivative',
    label: 'Derivatives',
    description: 'Register derivative works of this IP',
    icon: GitBranch,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
  },
  {
    key: 'collect_royalty',
    label: 'Royalties',
    description: 'Collect royalty payments from the IP',
    icon: Coins,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
];

function PermissionBadge({ type, showLabel = true }: { type: PermissionType; showLabel?: boolean }) {
  const config = PERMISSION_CONFIG.find((c) => c.key === type);
  if (!config) return null;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bgColor} border ${config.borderColor}`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
      {showLabel && <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>}
    </div>
  );
}

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
  const [showPermissionInfo, setShowPermissionInfo] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (assetId) refetch();
  }, [assetId, refetch]);

  const isOwner = asset && user && asset.creator.id === user.id;

  // Loading state
  if (authLoading || assetLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 rounded-full" />
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
          </div>
          <p className="text-slate-400 mt-4">Loading permissions...</p>
        </div>
      </div>
    );
  }

  // Auth check
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
      showToast('Permission revoked successfully', 'success');
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
    showToast('Address copied to clipboard', 'success');
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
  const totalPermissions = permissions.filter((p) => p.is_granted).length;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Asset</span>
          </button>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/50 border border-slate-700/50 rounded-2xl"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Asset Thumbnail */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                {asset.media_url && asset.media_url !== 'https://placeholder.example.com/media' ? (
                  <img src={asset.media_url} alt={asset.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Shield className="w-12 h-12 text-amber-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                    IP Permissions
                  </span>
                  {asset.registration_status === 'registered' && (
                    <span className="px-2.5 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Registered
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 truncate">{asset.title}</h1>

                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  Manage who can interact with your intellectual property on the Story Protocol blockchain.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/explore/${asset.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors text-sm"
                  >
                    View Asset
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <Button variant="primary" onClick={() => setShowModal(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Grant Permission
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{addressCount}</p>
            <p className="text-sm text-slate-400 mt-1">Authorized Addresses</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-400">{totalPermissions}</p>
            <p className="text-sm text-slate-400 mt-1">Active Permissions</p>
          </div>

          <div className="col-span-2 bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-300">Permission Types</p>
              <button
                onClick={() => setShowPermissionInfo(!showPermissionInfo)}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                title="Learn about permissions"
              >
                <Info className="w-4 h-4 text-slate-500 hover:text-slate-300" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {PERMISSION_CONFIG.map((config) => (
                <PermissionBadge key={config.key} type={config.key} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Permission Types Info Panel */}
        <AnimatePresence>
          {showPermissionInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Permission Types Explained</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PERMISSION_CONFIG.map((config) => {
                    const Icon = config.icon;
                    return (
                      <div
                        key={config.key}
                        className={`p-4 rounded-xl ${config.bgColor} border ${config.borderColor}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`w-5 h-5 ${config.color}`} />
                          <span className={`font-medium ${config.color}`}>{config.label}</span>
                        </div>
                        <p className="text-sm text-slate-400">{config.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
          >
            <ShieldX className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Permissions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden"
        >
          <div className="p-5 border-b border-slate-800/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Granted Permissions</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {addressCount > 0
                  ? `${addressCount} address${addressCount !== 1 ? 'es' : ''} with access`
                  : 'No permissions granted yet'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-3" />
              Loading permissions...
            </div>
          ) : addressCount === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-12 h-12 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No Permissions Granted</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Your IP asset is fully protected. Grant permissions to allow trusted addresses to interact with your
                intellectual property on the Story Protocol.
              </p>
              <Button variant="primary" onClick={() => setShowModal(true)} className="mx-auto">
                <UserPlus className="w-4 h-4 mr-2" />
                Grant First Permission
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {Object.entries(groupedPermissions).map(([address, perms], index) => (
                <motion.div
                  key={address}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  {/* Address Header */}
                  <button
                    onClick={() => toggleAddressExpand(address)}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-700/50">
                        <Users className="w-6 h-6 text-blue-400" />
                      </div>

                      {/* Address Info */}
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-white text-sm sm:text-base">
                            <span className="hidden md:inline">{address}</span>
                            <span className="md:hidden">{formatAddress(address)}</span>
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyAddress(address);
                            }}
                            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Copy address"
                          >
                            {copiedAddress === address ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full font-medium">
                            {perms.length} permission{perms.length !== 1 ? 's' : ''}
                          </span>
                          <div className="flex items-center gap-1">
                            {perms.slice(0, 5).map((perm) => {
                              const config = PERMISSION_CONFIG.find((c) => c.key === perm.permission_type);
                              if (!config) return null;
                              const Icon = config.icon;
                              return (
                                <div
                                  key={perm.uuid}
                                  className={`w-6 h-6 rounded ${config.bgColor} flex items-center justify-center`}
                                  title={config.label}
                                >
                                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                                </div>
                              );
                            })}
                            {perms.length > 5 && (
                              <span className="text-xs text-slate-500 ml-1">+{perms.length - 5}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        expandedAddresses.has(address) ? 'bg-slate-800' : ''
                      }`}
                    >
                      {expandedAddresses.has(address) ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Permission Cards */}
                  <AnimatePresence>
                    {expandedAddresses.has(address) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {perms.map((perm) => {
                            const config = PERMISSION_CONFIG.find((c) => c.key === perm.permission_type);
                            if (!config) return null;
                            const Icon = config.icon;

                            return (
                              <div
                                key={perm.uuid}
                                className={`group/perm relative p-4 rounded-xl ${config.bgColor} border ${config.borderColor} hover:border-opacity-60 transition-all`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-10 h-10 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}
                                    >
                                      <Icon className={`w-5 h-5 ${config.color}`} />
                                    </div>
                                    <div>
                                      <p className={`font-medium ${config.color}`}>{config.label}</p>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        Granted {new Date(perm.created_at).toLocaleDateString()}
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

                                <p className="text-xs text-slate-400 mt-3 line-clamp-2">{config.description}</p>
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

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium text-white mb-1">About IP Permissions</h3>
              <p className="text-sm text-slate-400">
                Permissions are granted on-chain through the Story Protocol. Each permission type allows the grantee
                address to perform specific actions on your IP asset. You can revoke permissions at any time.
              </p>
            </div>
          </div>
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
