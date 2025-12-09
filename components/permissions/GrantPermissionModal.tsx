'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useSetSelectedPermissions } from '@/hooks/usePermissions';
import { useToast } from '@/components/ui/Toast';
import type { PermissionType } from '@/types/api';

interface GrantPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  assetUuid: string;
}

export default function GrantPermissionModal({
  isOpen,
  onClose,
  onSuccess,
  assetUuid,
}: GrantPermissionModalProps) {
  const [granteeAddress, setGranteeAddress] = useState('');
  const [permissions, setPermissions] = useState({
    execute: false,
    transfer_erc20: false,
    set_metadata: false,
    attach_license: false,
    register_derivative: false,
    collect_royalty: false,
  });

  const { setSelectedPermissions, loading, error, clearError } = useSetSelectedPermissions();
  const { showToast } = useToast();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setGranteeAddress('');
      setPermissions({
        execute: false,
        transfer_erc20: false,
        set_metadata: false,
        attach_license: false,
        register_derivative: false,
        collect_royalty: false,
      });
      clearError();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only reset when modal opens, not when clearError changes

  // Validate Ethereum address
  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!granteeAddress.trim()) {
      showToast('Please enter an Ethereum address', 'error');
      return;
    }

    if (!isValidAddress(granteeAddress)) {
      showToast('Invalid Ethereum address format', 'error');
      return;
    }

    const hasAnyPermission = Object.values(permissions).some(Boolean);
    if (!hasAnyPermission) {
      showToast('Please select at least one permission', 'error');
      return;
    }

    const result = await setSelectedPermissions({
      asset_id: assetUuid,
      grantee_address: granteeAddress.toLowerCase(),
      permissions,
    });

    if (result) {
      showToast('Permissions granted successfully!', 'success');
      onSuccess?.();
      onClose();
    } else {
      showToast(error || 'Failed to grant permissions', 'error');
    }
  };

  const permissionTypes = [
    {
      key: 'execute' as const,
      label: 'Execute Transactions',
      description: 'Can execute transactions on behalf of the IP asset',
    },
    {
      key: 'transfer_erc20' as const,
      label: 'Transfer ERC20',
      description: 'Can transfer ERC20 tokens from the IP account',
    },
    {
      key: 'set_metadata' as const,
      label: 'Set Metadata',
      description: 'Can modify the metadata of this IP asset',
    },
    {
      key: 'attach_license' as const,
      label: 'Attach License',
      description: 'Can attach new license terms to this IP asset',
    },
    {
      key: 'register_derivative' as const,
      label: 'Register Derivatives',
      description: 'Can register new derivatives of this IP asset',
    },
    {
      key: 'collect_royalty' as const,
      label: 'Collect Royalties',
      description: 'Can collect royalty payments on behalf of this IP',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Grant Permissions</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Grant specific permissions to an Ethereum address
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {/* Ethereum Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-2">
                    Ethereum Address *
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={granteeAddress}
                    onChange={(e) => setGranteeAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm"
                    required
                  />
                  {granteeAddress && !isValidAddress(granteeAddress) && (
                    <p className="text-xs text-red-400 mt-1">Invalid Ethereum address format</p>
                  )}
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Select Permissions *
                  </label>
                  <div className="space-y-3">
                    {permissionTypes.map((perm) => (
                      <label
                        key={perm.key}
                        className="flex items-start gap-3 p-4 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:border-amber-500/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={permissions[perm.key]}
                          onChange={(e) =>
                            setPermissions({ ...permissions, [perm.key]: e.target.checked })
                          }
                          className="mt-1 w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 rounded focus:ring-amber-500 focus:ring-2"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{perm.label}</span>
                            {permissions[perm.key] && (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{perm.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-300">
                    <strong>Note:</strong> Permissions are stored on-chain via Story Protocol. You can revoke them at any time.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={loading || !isValidAddress(granteeAddress) || !Object.values(permissions).some(Boolean)}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Granting...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Grant Permissions
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

