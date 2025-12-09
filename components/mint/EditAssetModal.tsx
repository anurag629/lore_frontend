'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertCircle, Check, Wand2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useUpdateAsset, useDeleteAsset } from '@/hooks/useAssets';
import { useEnhanceDescription } from '@/hooks/useAI';
import { useToast } from '@/components/ui/Toast';
import type { IPAsset } from '@/types/api';

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  asset: IPAsset | null;
  redirectTo?: string; // Optional redirect path after deletion
}

export default function EditAssetModal({ isOpen, onClose, onSuccess, asset, redirectTo }: EditAssetModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const router = useRouter();
  const { updateAsset, loading: updating, error: updateError, clearError } = useUpdateAsset();
  const { deleteAsset, loading: deleting, error: deleteError } = useDeleteAsset();
  const { showToast } = useToast();
  const enhanceDescription = useEnhanceDescription();

  // Initialize form data when asset changes
  useEffect(() => {
    if (asset) {
      setFormData({
        title: asset.title || '',
        description: asset.description || '',
      });
      setShowDeleteConfirm(false);
    }
  }, [asset]);
  
  // Clear error when modal opens
  useEffect(() => {
    if (isOpen) {
      clearError();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle AI Description Enhancement
  const handleEnhanceDescription = async () => {
    if (!formData.description.trim()) {
      showToast('Please enter a brief description first', 'warning');
      return;
    }

    try {
      const result = await enhanceDescription.mutateAsync({
        description: formData.description,
        title: formData.title || undefined,
        asset_type: 'digital_art'
      });
      setFormData({ ...formData, description: result.enhanced_description });
      showToast('Description enhanced!', 'success');
    } catch (err) {
      console.error('Failed to enhance description:', err);
      showToast('Failed to enhance description. Please try again.', 'error');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;

    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    const result = await updateAsset(asset.id, {
      title: formData.title.trim(),
      description: formData.description.trim(),
    });

    if (result) {
      showToast('Asset updated successfully!', 'success');
      onSuccess?.();
      onClose();
    } else {
      showToast(updateError || 'Failed to update asset', 'error');
    }
  };

  // Handle archive (soft delete)
  const handleDelete = async () => {
    if (!asset) return;

    const result = await deleteAsset(asset.id);
    if (result) {
      showToast('Asset archived successfully', 'success');
      setShowDeleteConfirm(false);
      onClose();

      // Call onSuccess to trigger refetch before navigating
      if (onSuccess) {
        onSuccess();
      }

      // Redirect to dashboard Archived tab
      // Note: router.refresh() removed - URL params with timestamp already trigger refetch in dashboard
      setTimeout(() => {
        const timestamp = Date.now();
        const redirectPath = redirectTo === '/dashboard'
          ? `/dashboard?refresh=${timestamp}&archived=${asset.id}&tab=archived`
          : redirectTo || `/dashboard?refresh=${timestamp}&archived=${asset.id}&tab=archived`;
        router.push(redirectPath);
      }, 100);
    } else {
      showToast(deleteError || 'Failed to archive asset', 'error');
    }
  };

  if (!asset) return null;

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
            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <div>
                  <h2 className="text-2xl font-bold text-slate-50">Edit Asset</h2>
                  <p className="text-sm text-slate-400 mt-1">Update your IP asset details</p>
                </div>
                <button
                  onClick={onClose}
                  disabled={updating || deleting}
                  className="p-2 text-slate-400 hover:text-slate-50 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Error Messages */}
                {updateError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-red-400 font-medium">Update Failed</p>
                      <p className="text-red-300 text-sm mt-1">{updateError}</p>
                    </div>
                  </div>
                )}

                {deleteError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-red-400 font-medium">Archive Failed</p>
                      <p className="text-red-300 text-sm mt-1">{deleteError}</p>
                    </div>
                  </div>
                )}

                {/* Title Field */}
                <div>
                  <label htmlFor="edit-title" className="block text-sm font-medium text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    id="edit-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter asset title"
                    required
                    disabled={updating || deleting}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Description Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="edit-description" className="block text-sm font-medium text-slate-300">
                      Description *
                    </label>
                    <button
                      type="button"
                      onClick={handleEnhanceDescription}
                      disabled={updating || deleting || !formData.description.trim() || enhanceDescription.isPending}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enhanceDescription.isPending ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3 h-3" />
                          Enhance with AI
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your IP asset..."
                    rows={6}
                    required
                    disabled={updating || deleting}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Info Note */}
                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <p className="text-sm text-slate-400">
                    <strong className="text-slate-300">Note:</strong> Only title and description can be edited. 
                    Media files, royalty settings, and license terms cannot be changed after creation.
                  </p>
                </div>

                {/* Archive Section */}
                {!showDeleteConfirm ? (
                  <div className="pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={updating || deleting}
                      className="w-full px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Archive Asset
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-sm text-amber-300 font-medium mb-2">
                        Are you sure you want to archive this asset?
                      </p>
                      <p className="text-xs text-amber-400">
                        The asset will be moved to the Archived tab. You can restore it later or permanently delete it from there.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={updating || deleting}
                        className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={updating || deleting}
                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Archiving...
                          </>
                        ) : (
                          'Confirm Archive'
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {!showDeleteConfirm && (
                  <div className="flex gap-3 pt-4 border-t border-slate-800">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={updating || deleting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={updating || deleting || !formData.title.trim() || !formData.description.trim()}
                      className="flex-1"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


