'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Users, Percent } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useCreateGroup } from '@/hooks/useGroups';
import { useToast } from '@/components/ui/Toast';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    total_royalty_percentage: 10,
  });

  const { createGroup, loading, error, clearError } = useCreateGroup();
  const { showToast } = useToast();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        total_royalty_percentage: 10,
      });
      clearError();
    }
  }, [isOpen, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Please enter a group name', 'error');
      return;
    }

    if (formData.total_royalty_percentage < 0 || formData.total_royalty_percentage > 100) {
      showToast('Royalty percentage must be between 0 and 100', 'error');
      return;
    }

    const result = await createGroup(formData);
    if (result) {
      showToast('Group created successfully!', 'success');
      onSuccess?.();
      onClose();
    } else {
      showToast(error || 'Failed to create group', 'error');
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
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Create Group IP</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Pool multiple IP assets together for collective royalty distribution
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
                    <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {/* Group Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                    Group Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Fantasy Art Collection"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your group IP collection..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Total Royalty Percentage */}
                <div>
                  <label htmlFor="royalty" className="block text-sm font-medium text-slate-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Total Royalty Percentage *
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      id="royalty"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.total_royalty_percentage}
                      onChange={(e) => setFormData({ ...formData, total_royalty_percentage: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    This is the total royalty percentage for the group. Individual member shares will be configured when adding members.
                  </p>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-300">
                    <strong>Note:</strong> After creating the group, you'll need to add member assets and register it on the blockchain.
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
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        Create Group
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

