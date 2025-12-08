'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Plus, Percent, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useAddMember } from '@/hooks/useGroups';
import { useAssets } from '@/hooks/useAssets';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import type { IPAssetListItem } from '@/types/api';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  groupId: string;
  existingMembers?: string[]; // Asset UUIDs already in group
  currentTotalShare?: number; // Current total revenue share percentage
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onSuccess,
  groupId,
  existingMembers = [],
  currentTotalShare = 0,
}: AddMemberModalProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [revenueShare, setRevenueShare] = useState<number>(0);
  const { user } = useAuth();
  const { assets, loading: assetsLoading } = useAssets(
    user?.id ? { creator: user.id, is_deleted: false } : undefined
  );
  const { addMember, loading, error, clearError } = useAddMember();
  const { showToast } = useToast();

  // Filter out assets already in group and non-registered assets
  const availableAssets = assets.filter(
    (asset) =>
      !existingMembers.includes(asset.id) &&
      asset.registration_status === 'registered' &&
      asset.story_ip_id
  );

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedAssetId('');
      setRevenueShare(0);
      clearError();
    }
  }, [isOpen, clearError]);

  const maxAllowedShare = 100 - currentTotalShare;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAssetId) {
      showToast('Please select an asset', 'error');
      return;
    }

    if (revenueShare <= 0 || revenueShare > maxAllowedShare) {
      showToast(`Revenue share must be between 0 and ${maxAllowedShare}%`, 'error');
      return;
    }

    const result = await addMember(groupId, selectedAssetId, revenueShare);
    if (result) {
      showToast('Member added successfully!', 'success');
      onSuccess?.();
      onClose();
    } else {
      showToast(error || 'Failed to add member', 'error');
    }
  };

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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Plus className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Add Member to Group</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Add an IP asset to the group with revenue share percentage
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

                {/* Current Share Info */}
                {currentTotalShare > 0 && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-300">
                      <strong>Current total share:</strong> {currentTotalShare}% / 100%
                    </p>
                    <p className="text-xs text-amber-400 mt-1">
                      Maximum allowed: {maxAllowedShare}%
                    </p>
                  </div>
                )}

                {/* Asset Selection */}
                <div>
                  <label htmlFor="asset" className="block text-sm font-medium text-slate-300 mb-2">
                    Select Asset *
                  </label>
                  {assetsLoading ? (
                    <div className="p-4 bg-slate-800 rounded-lg text-center">
                      <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
                      <p className="text-slate-400 text-sm mt-2">Loading assets...</p>
                    </div>
                  ) : availableAssets.length === 0 ? (
                    <div className="p-4 bg-slate-800 rounded-lg text-center">
                      <AlertCircle className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">
                        No available assets. Assets must be registered on Story Protocol and not already in the group.
                      </p>
                    </div>
                  ) : (
                    <select
                      id="asset"
                      value={selectedAssetId}
                      onChange={(e) => setSelectedAssetId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select an asset...</option>
                      {availableAssets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Revenue Share Percentage */}
                <div>
                  <label htmlFor="share" className="block text-sm font-medium text-slate-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Revenue Share Percentage *
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      id="share"
                      type="number"
                      min="0"
                      max={maxAllowedShare}
                      step="0.01"
                      value={revenueShare || ''}
                      onChange={(e) => setRevenueShare(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Percentage of group royalties allocated to this member (0 - {maxAllowedShare}%)
                  </p>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-300">
                    <strong>Note:</strong> Revenue share percentages must sum to ≤ 100% across all members.
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
                    disabled={loading || availableAssets.length === 0}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Member
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

