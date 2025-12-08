'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Upload, Check, AlertCircle, Loader2, GitBranch, Info } from 'lucide-react';
import { useState, useRef, DragEvent, ChangeEvent, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { useAssets, useCreateDerivative, useCreateMultiParentDerivative } from '@/hooks/useAssets';
import { useToast } from '@/components/ui/Toast';
import type { CreateDerivativeData, IPAssetListItem } from '@/types/api';
import type { IPAsset } from '@/types/api';

interface RemixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  parentAsset: IPAsset;
}

export default function RemixModal({ isOpen, onClose, onSuccess, parentAsset }: RemixModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    commercial_rights: parentAsset.commercial_rights, // Inherit from parent
  });
  const [useMultiParents, setUseMultiParents] = useState(false);
  const [parentSelections, setParentSelections] = useState<
    { parent_asset_id: string; attribution_percentage: number }[]
  >([{ parent_asset_id: parentAsset.id, attribution_percentage: 100 }]);
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createDerivative, loading, error, clearError } = useCreateDerivative();
  const { createMultiParentDerivative, loading: loadingMulti } = useCreateMultiParentDerivative();
  const { assets } = useAssets(); // all assets for selection
  const { showToast } = useToast();

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Validate file size (50MB max)
    if (selectedFile.size > 50 * 1024 * 1024) {
      showToast('File size must be less than 50MB', 'error');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (!validTypes.includes(selectedFile.type)) {
      showToast('File must be JPG, PNG, GIF, or MP4', 'error');
      return;
    }

    setFile(selectedFile);

    // Create preview URL for images
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const totalAttribution = useMemo(
    () => parentSelections.reduce((sum, p) => sum + (Number(p.attribution_percentage) || 0), 0),
    [parentSelections]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('Please enter a title', 'warning');
      return;
    }

    if (!formData.description.trim()) {
      showToast('Please enter a description', 'warning');
      return;
    }

    // Single parent flow
    if (!useMultiParents) {
      const derivativeData: CreateDerivativeData = {
        parent_asset_id: parentAsset.id,
        title: formData.title,
        description: formData.description,
        commercial_rights: formData.commercial_rights,
        media_file: file || undefined,
      };

      const result = await createDerivative(derivativeData);

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          handleClose();
          if (onSuccess) onSuccess();
        }, 2000);
      }
      return;
    }

    // Multi-parent flow
    if (parentSelections.length === 0) {
      showToast('Add at least one parent', 'warning');
      return;
    }
    if (Math.abs(totalAttribution - 100) > 0.01) {
      showToast('Attribution percentages must sum to 100%', 'warning');
      return;
    }

    const result = await createMultiParentDerivative({
      parent_assets: parentSelections,
      title: formData.title,
      description: formData.description,
      commercial_rights: formData.commercial_rights,
      media_file: file || undefined,
    });

    if (result) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        handleClose();
        if (onSuccess) onSuccess();
      }, 2000);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl(null);
    setFormData({
      title: '',
      description: '',
      commercial_rights: parentAsset.commercial_rights,
    });
    setSuccess(false);
    clearError();
    onClose();
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-70 p-4"
          >
            <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Create Remix</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Parent Assets */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Info className="w-4 h-4" />
                        <span className="text-sm font-medium">Parents</span>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={useMultiParents}
                          onChange={(e) => setUseMultiParents(e.target.checked)}
                          className="w-4 h-4 text-amber-500 bg-slate-800 border-slate-600 rounded"
                        />
                        Multi-parent remix
                      </label>
                    </div>

                    {!useMultiParents && (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-700 rounded-lg overflow-hidden shrink-0">
                          {parentAsset.media_url && parentAsset.media_url !== 'https://placeholder.example.com/media' ? (
                            <img
                              src={parentAsset.media_url}
                              alt={parentAsset.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-amber-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-50 mb-1 line-clamp-1">
                            {parentAsset.title}
                          </p>
                          <p className="text-xs text-slate-400">
                            by {parentAsset.creator.display_name || formatAddress(parentAsset.creator.wallet_address)}
                          </p>
                        </div>
                      </div>
                    )}

                    {useMultiParents && (
                      <div className="space-y-3">
                        {parentSelections.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <select
                              className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                              value={p.parent_asset_id}
                              onChange={(e) => {
                                const next = [...parentSelections];
                                next[idx].parent_asset_id = e.target.value;
                                setParentSelections(next);
                              }}
                            >
                              <option value="">Select parent...</option>
                              {assets
                                .filter((a) => !a.is_deleted)
                                .map((a: IPAssetListItem) => (
                                  <option key={a.id} value={a.id}>
                                    {a.title}
                                  </option>
                                ))}
                            </select>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={p.attribution_percentage}
                                onChange={(e) => {
                                  const next = [...parentSelections];
                                  next[idx].attribution_percentage = Number(e.target.value);
                                  setParentSelections(next);
                                }}
                                className="w-28 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                              />
                              <span className="text-slate-400 text-sm">%</span>
                            </div>
                            {parentSelections.length > 1 && (
                              <button
                                type="button"
                                className="text-slate-400 hover:text-red-400 text-sm"
                                onClick={() => setParentSelections(parentSelections.filter((_, i) => i !== idx))}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setParentSelections([
                                ...parentSelections,
                                { parent_asset_id: '', attribution_percentage: 0 },
                              ])
                            }
                            className="text-sm"
                          >
                            Add Parent
                          </Button>
                          <p className="text-xs text-slate-400">Total attribution: {totalAttribution.toFixed(2)}%</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Success Message */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
                    >
                      <Check className="w-5 h-5 text-green-400" />
                      <p className="text-green-400 font-medium">
                        Derivative created successfully! Registering on Story Protocol...
                      </p>
                    </motion.div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                  )}

                  {/* Upload Area */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      Upload Your Remix *
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                        dragActive
                          ? 'border-purple-500 bg-purple-500/5'
                          : previewUrl
                          ? 'border-green-500/50 bg-green-500/5'
                          : 'border-white/10 hover:border-purple-500/50 hover:bg-white/5'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/gif,video/mp4"
                        onChange={handleFileInput}
                        disabled={loading}
                      />

                      {previewUrl ? (
                        <div className="space-y-3">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <p className="text-sm text-green-400 font-medium">
                            {file?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Click to change file
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-medium text-white mb-1">
                            Upload your remix
                          </h3>
                          <p className="text-sm text-slate-400">
                            Drag and drop or click to browse
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            JPG, PNG, GIF, MP4 (Max 50MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter a title for your remix"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Describe your remix and how it builds on the original..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                        disabled={loading}
                        required
                      />
                    </div>

                    {/* Commercial Rights (inherited from parent) */}
                    <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-white/5">
                      <h3 className="text-sm font-medium text-slate-300">License Terms</h3>

                      <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.commercial_rights}
                            onChange={(e) =>
                              setFormData({ ...formData, commercial_rights: e.target.checked })
                            }
                            disabled={!parentAsset.commercial_rights || loading}
                            className="w-4 h-4 rounded border-white/20 bg-slate-800 text-purple-500 focus:ring-purple-500 disabled:opacity-50"
                          />
                          <div className="flex-1">
                            <span className="text-sm text-slate-300">Allow Commercial Use</span>
                            {!parentAsset.commercial_rights && (
                              <p className="text-xs text-slate-500 mt-1">
                                Commercial use not allowed by parent license
                              </p>
                            )}
                          </div>
                        </label>
                      </div>

                      <div className="pt-3 border-t border-white/5">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-400">
                            {parentAsset.royalty_percentage}% of revenue from this derivative will automatically go to the original creator through Story Protocol smart contracts.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="px-6"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="px-6 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={loading || success}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Remix...
                      </>
                    ) : success ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Success!
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Remix
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
