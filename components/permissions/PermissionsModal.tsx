'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Shield, CheckCircle2, AlertCircle, UserPlus, Users, Trash2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';
import { useSetSelectedPermissions, useAssetPermissions, useRevokePermission } from '@/hooks/usePermissions';
import { useToast } from '@/components/ui/Toast';
import type { PermissionType, IPAccountPermission } from '@/types/api';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  assetId: string;
  assetTitle: string;
}

const PERMISSION_CONFIG: { key: PermissionType; label: string; description: string; icon: string }[] = [
  {
    key: 'execute',
    label: 'Execute',
    description: 'Execute transactions on behalf of the IP',
    icon: '⚡',
  },
  {
    key: 'transfer_erc20',
    label: 'Transfer Tokens',
    description: 'Transfer ERC20 tokens from IP account',
    icon: '💰',
  },
  {
    key: 'set_metadata',
    label: 'Metadata',
    description: 'Modify IP asset metadata',
    icon: '📝',
  },
  {
    key: 'attach_license',
    label: 'License',
    description: 'Attach license terms to IP',
    icon: '📜',
  },
  {
    key: 'register_derivative',
    label: 'Derivatives',
    description: 'Register derivative works',
    icon: '🔀',
  },
  {
    key: 'collect_royalty',
    label: 'Royalties',
    description: 'Collect royalty payments',
    icon: '💎',
  },
];

const QUICK_PRESETS = [
  {
    name: 'Full Access',
    description: 'Grant all permissions',
    permissions: {
      execute: true,
      transfer_erc20: true,
      set_metadata: true,
      attach_license: true,
      register_derivative: true,
      collect_royalty: true,
    },
  },
  {
    name: 'Derivative Only',
    description: 'Only allow creating derivatives',
    permissions: {
      execute: false,
      transfer_erc20: false,
      set_metadata: false,
      attach_license: false,
      register_derivative: true,
      collect_royalty: false,
    },
  },
  {
    name: 'Manager',
    description: 'Metadata & license management',
    permissions: {
      execute: false,
      transfer_erc20: false,
      set_metadata: true,
      attach_license: true,
      register_derivative: false,
      collect_royalty: false,
    },
  },
];

type TabType = 'view' | 'grant';

export default function PermissionsModal({
  isOpen,
  onClose,
  onSuccess,
  assetId,
  assetTitle,
}: PermissionsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('view');
  const [granteeAddress, setGranteeAddress] = useState('');
  const [permissions, setPermissions] = useState({
    execute: false,
    transfer_erc20: false,
    set_metadata: false,
    attach_license: false,
    register_derivative: false,
    collect_royalty: false,
  });
  const [expandedAddresses, setExpandedAddresses] = useState<Set<string>>(new Set());
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const { setSelectedPermissions, loading: granting, error: grantError, clearError } = useSetSelectedPermissions();
  const { permissions: existingPermissions, loading: loadingPermissions, refetch } = useAssetPermissions(assetId);
  const { revokePermission, loading: revoking } = useRevokePermission();
  const { showToast } = useToast();

  // Fetch permissions when modal opens
  useEffect(() => {
    if (isOpen) {
      refetch();
      clearError();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Reset grant form when switching tabs
  useEffect(() => {
    if (activeTab === 'grant') {
      setGranteeAddress('');
      setPermissions({
        execute: false,
        transfer_erc20: false,
        set_metadata: false,
        attach_license: false,
        register_derivative: false,
        collect_royalty: false,
      });
    }
  }, [activeTab]);

  const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidAddress(granteeAddress)) {
      showToast('Invalid Ethereum address', 'error');
      return;
    }

    const hasAnyPermission = Object.values(permissions).some(Boolean);
    if (!hasAnyPermission) {
      showToast('Select at least one permission', 'error');
      return;
    }

    const result = await setSelectedPermissions({
      asset_id: assetId,
      grantee_address: granteeAddress.toLowerCase(),
      permissions,
    });

    if (result) {
      showToast('Permissions granted!', 'success');
      setActiveTab('view');
      refetch();
      onSuccess?.();
    }
  };

  const handleRevoke = async (granteeAddress: string, permissionType: PermissionType) => {
    const ok = await revokePermission({
      asset_id: assetId,
      grantee_address: granteeAddress,
      permission_type: permissionType,
    });
    if (ok) {
      showToast('Permission revoked', 'success');
      refetch();
    } else {
      showToast('Failed to revoke', 'error');
    }
  };

  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setPermissions(preset.permissions);
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
  const groupedPermissions = existingPermissions.reduce((acc, perm) => {
    if (!perm.is_granted) return acc;
    const addr = perm.grantee_address;
    if (!acc[addr]) acc[addr] = [];
    acc[addr].push(perm);
    return acc;
  }, {} as Record<string, IPAccountPermission[]>);

  const addressCount = Object.keys(groupedPermissions).length;
  const totalPermissions = existingPermissions.filter(p => p.is_granted).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-700/50 w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl pointer-events-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-slate-800 p-5 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl">
                      <Shield className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Permissions</h2>
                      <p className="text-slate-400 text-sm truncate max-w-[300px]">{assetTitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('view')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                      activeTab === 'view'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800/50 text-slate-400 border border-transparent hover:bg-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>View ({addressCount})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('grant')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                      activeTab === 'grant'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800/50 text-slate-400 border border-transparent hover:bg-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Grant New</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {activeTab === 'view' ? (
                  /* View Permissions Tab */
                  <div className="space-y-4">
                    {loadingPermissions ? (
                      <div className="flex items-center justify-center py-12 text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading permissions...
                      </div>
                    ) : addressCount === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Shield className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-slate-400 mb-4">No permissions granted yet</p>
                        <Button variant="primary" onClick={() => setActiveTab('grant')}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Grant First Permission
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Stats */}
                        <div className="flex gap-3 mb-4">
                          <div className="flex-1 bg-slate-800/50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-white">{addressCount}</p>
                            <p className="text-xs text-slate-400">Addresses</p>
                          </div>
                          <div className="flex-1 bg-slate-800/50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-amber-400">{totalPermissions}</p>
                            <p className="text-xs text-slate-400">Permissions</p>
                          </div>
                        </div>

                        {/* Grouped by Address */}
                        {Object.entries(groupedPermissions).map(([address, perms]) => (
                          <div key={address} className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
                            <button
                              onClick={() => toggleAddressExpand(address)}
                              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-lg">👤</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-mono text-sm text-white truncate">
                                    {address.slice(0, 8)}...{address.slice(-6)}
                                  </p>
                                  <p className="text-xs text-slate-400">{perms.length} permission{perms.length !== 1 ? 's' : ''}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); copyAddress(address); }}
                                  className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
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
                                  className="border-t border-slate-700/50"
                                >
                                  <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {perms.map((perm) => {
                                      const config = PERMISSION_CONFIG.find(c => c.key === perm.permission_type);
                                      return (
                                        <div
                                          key={perm.uuid}
                                          className="group flex items-center justify-between bg-slate-800/50 rounded-lg p-2.5 hover:bg-slate-700/50 transition-colors"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-base">{config?.icon || '🔐'}</span>
                                            <span className="text-xs text-slate-300 truncate">{config?.label || perm.permission_type}</span>
                                          </div>
                                          <button
                                            onClick={() => handleRevoke(address, perm.permission_type)}
                                            disabled={revoking}
                                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition-all"
                                            title="Revoke"
                                          >
                                            {revoking ? (
                                              <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                                            ) : (
                                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                            )}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  /* Grant Permissions Tab */
                  <form onSubmit={handleGrant} className="space-y-5">
                    {grantError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-300 text-sm">{grantError}</p>
                      </div>
                    )}

                    {/* Address Input */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Recipient Address
                      </label>
                      <input
                        type="text"
                        value={granteeAddress}
                        onChange={(e) => setGranteeAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 font-mono text-sm transition-all"
                      />
                      {granteeAddress && !isValidAddress(granteeAddress) && (
                        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Invalid address format
                        </p>
                      )}
                      {granteeAddress && isValidAddress(granteeAddress) && (
                        <p className="text-xs text-green-400 mt-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Valid address
                        </p>
                      )}
                    </div>

                    {/* Quick Presets */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Quick Presets
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-amber-500/30 rounded-lg text-sm text-slate-300 hover:text-amber-400 transition-all"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Permission Grid */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Select Permissions
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PERMISSION_CONFIG.map((perm) => (
                          <label
                            key={perm.key}
                            className={`relative flex flex-col items-center p-3 rounded-xl border cursor-pointer transition-all ${
                              permissions[perm.key]
                                ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                                : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={permissions[perm.key]}
                              onChange={(e) => setPermissions({ ...permissions, [perm.key]: e.target.checked })}
                              className="sr-only"
                            />
                            <span className="text-2xl mb-1">{perm.icon}</span>
                            <span className={`text-xs font-medium text-center ${permissions[perm.key] ? 'text-amber-400' : 'text-slate-300'}`}>
                              {perm.label}
                            </span>
                            {permissions[perm.key] && (
                              <div className="absolute top-1 right-1">
                                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Selected Summary */}
                    {Object.values(permissions).some(Boolean) && (
                      <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                        <p className="text-sm text-amber-300">
                          <strong>{Object.values(permissions).filter(Boolean).length}</strong> permission{Object.values(permissions).filter(Boolean).length !== 1 ? 's' : ''} selected
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full py-3"
                      disabled={granting || !isValidAddress(granteeAddress) || !Object.values(permissions).some(Boolean)}
                    >
                      {granting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Granting...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Grant Permissions
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
