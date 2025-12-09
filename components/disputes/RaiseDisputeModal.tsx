'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertTriangle, FileText, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useRaiseDispute } from '@/hooks/useDisputes';
import { useToast } from '@/components/ui/Toast';
import type { IPAssetListItem } from '@/types/api';

interface RaiseDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  targetAsset: IPAssetListItem;
}

export default function RaiseDisputeModal({
  isOpen,
  onClose,
  onSuccess,
  targetAsset,
}: RaiseDisputeModalProps) {
  const [formData, setFormData] = useState({
    reason: '',
    evidence_description: '',
    evidence_url: '',
  });

  const { raiseDispute, loading, error, clearError } = useRaiseDispute();
  const { showToast } = useToast();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        reason: '',
        evidence_description: '',
        evidence_url: '',
      });
      clearError();
    }
  }, [isOpen, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      showToast('Please provide a reason for the dispute', 'error');
      return;
    }

    if (formData.reason.length < 20) {
      showToast('Reason must be at least 20 characters', 'error');
      return;
    }

    const result = await raiseDispute({
      asset_id: targetAsset.id,
      reason: formData.reason,
    });

    if (result) {
      showToast('Dispute raised successfully!', 'success');
      onSuccess?.();
      onClose();
    } else {
      showToast(error || 'Failed to raise dispute', 'error');
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
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Raise Dispute</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Challenge IP asset: <span className="text-white font-medium">{targetAsset.title}</span>
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
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {/* Warning Box */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm text-amber-300">
                    <strong>Important:</strong> Disputes are serious matters. Please provide clear, factual reasons and evidence. False disputes may result in penalties.
                  </p>
                </div>

                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-slate-300 mb-2">
                    Reason for Dispute *
                  </label>
                  <textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Explain why you are disputing this IP asset (e.g., copyright infringement, trademark violation, etc.)"
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    required
                    minLength={20}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Minimum 20 characters. Be specific and factual.
                  </p>
                </div>

                {/* Evidence Description */}
                <div>
                  <label htmlFor="evidence_description" className="block text-sm font-medium text-slate-300 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Evidence Description
                    </div>
                  </label>
                  <textarea
                    id="evidence_description"
                    value={formData.evidence_description}
                    onChange={(e) => setFormData({ ...formData, evidence_description: e.target.value })}
                    placeholder="Describe your evidence (optional, can be added later)"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Evidence URL */}
                <div>
                  <label htmlFor="evidence_url" className="block text-sm font-medium text-slate-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Evidence URL (Optional)
                    </div>
                  </label>
                  <input
                    id="evidence_url"
                    type="url"
                    value={formData.evidence_url}
                    onChange={(e) => setFormData({ ...formData, evidence_url: e.target.value })}
                    placeholder="https://... or ipfs://..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Link to evidence file (IPFS, external URL, etc.). You can add more evidence later.
                  </p>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-300">
                    <strong>What happens next?</strong> Your dispute will be reviewed by administrators. Both you and the asset owner can submit additional evidence. The dispute will be resolved based on the evidence provided.
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
                    variant="danger"
                    className="flex-1"
                    disabled={loading || formData.reason.length < 20}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Raising...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        Raise Dispute
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

