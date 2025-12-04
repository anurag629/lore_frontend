'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Upload, Check, AlertCircle, Loader2, Wand2 } from 'lucide-react';
import { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useCreateAsset } from '@/hooks/useAssets';
import { useGenerateTitle, useEnhanceDescription, useSuggestLicense } from '@/hooks/useAI';
import { useToast } from '@/components/ui/Toast';
import type { CreateIPAssetData } from '@/types/api';

interface MintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function MintModal({ isOpen, onClose, onSuccess }: MintModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    royalty_percentage: 10,
    allow_derivatives: true,
    commercial_rights: false,
  });
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createAsset, loading, error, clearError } = useCreateAsset();
  const { showToast } = useToast();

  // AI hooks
  const generateTitle = useGenerateTitle();
  const enhanceDescription = useEnhanceDescription();
  const suggestLicense = useSuggestLicense();

  // Handle AI Title Generation
  const handleGenerateTitle = async () => {
    if (!formData.description.trim()) {
      showToast('Please enter a description first', 'warning');
      return;
    }

    try {
      const result = await generateTitle.mutateAsync({
        description: formData.description,
        asset_type: 'digital_art'
      });
      setTitleSuggestions(result.titles);
      setShowTitleSuggestions(true);
      showToast('Title suggestions generated!', 'success');
    } catch (err) {
      console.error('Failed to generate titles:', err);
      showToast('Failed to generate title suggestions. Please try again.', 'error');
    }
  };

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

  // Handle AI License Suggestion
  const handleSuggestLicense = async () => {
    if (!formData.description.trim()) {
      showToast('Please enter a description first', 'warning');
      return;
    }

    try {
      const result = await suggestLicense.mutateAsync({
        asset_type: 'digital_art',
        description: formData.description,
        intended_use: formData.commercial_rights ? 'commercial' : 'non_commercial'
      });
      setFormData({
        ...formData,
        royalty_percentage: result.royalty_percentage,
        allow_derivatives: result.allow_derivatives,
        commercial_rights: result.commercial_rights
      });
      showToast('License terms suggested!', 'success');
    } catch (err) {
      console.error('Failed to suggest license:', err);
      showToast('Failed to generate license suggestion. Please try again.', 'error');
    }
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

    const assetData: CreateIPAssetData = {
      title: formData.title,
      description: formData.description,
      royalty_percentage: formData.royalty_percentage,
      allow_derivatives: formData.allow_derivatives,
      commercial_rights: formData.commercial_rights,
      media_file: file || undefined,
    };

    const result = await createAsset(assetData);

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
      royalty_percentage: 10,
      allow_derivatives: true,
      commercial_rights: false,
    });
    setSuccess(false);
    clearError();
    onClose();
  };

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, loading]);

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-[70] p-4"
          >
            <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Mint IP Asset</h2>
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
                  {/* Success Message */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
                    >
                      <Check className="w-5 h-5 text-green-400" />
                      <p className="text-green-400 font-medium">
                        IP Asset created successfully! Registering on Story Protocol...
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
                      Upload Media
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                        dragActive
                          ? 'border-amber-500 bg-amber-500/5'
                          : previewUrl
                          ? 'border-green-500/50 bg-green-500/5'
                          : 'border-white/10 hover:border-amber-500/50 hover:bg-white/5'
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
                            Upload your creation
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
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-300">
                          Title *
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateTitle}
                          disabled={loading || generateTitle.isPending || !formData.description}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generateTitle.isPending ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-3 h-3" />
                              AI Generate
                            </>
                          )}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter a title for your asset"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                        disabled={loading}
                        required
                      />

                      {/* Title Suggestions */}
                      {showTitleSuggestions && titleSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-slate-950 border border-amber-500/20 rounded-xl space-y-2"
                        >
                          <p className="text-xs font-medium text-amber-400">AI Suggestions:</p>
                          <div className="space-y-1">
                            {titleSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, title: suggestion });
                                  setShowTitleSuggestions(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-300">
                          Description *
                        </label>
                        <button
                          type="button"
                          onClick={handleEnhanceDescription}
                          disabled={loading || enhanceDescription.isPending || !formData.description}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {enhanceDescription.isPending ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Enhancing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              AI Enhance
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Describe your asset..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
                        disabled={loading}
                        required
                      />
                      <p className="text-xs text-slate-500">
                        Enter a brief description, then click "AI Enhance" for a detailed version
                      </p>
                    </div>

                    {/* License Options */}
                    <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-300">License Terms</h3>
                        <button
                          type="button"
                          onClick={handleSuggestLicense}
                          disabled={loading || suggestLicense.isPending || !formData.description}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {suggestLicense.isPending ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Suggesting...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-3 h-3" />
                              AI Suggest
                            </>
                          )}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.allow_derivatives}
                            onChange={(e) =>
                              setFormData({ ...formData, allow_derivatives: e.target.checked })
                            }
                            className="w-4 h-4 rounded border-white/20 bg-slate-800 text-amber-500 focus:ring-amber-500"
                            disabled={loading}
                          />
                          <span className="text-sm text-slate-300">Allow Derivatives/Remixes</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.commercial_rights}
                            onChange={(e) =>
                              setFormData({ ...formData, commercial_rights: e.target.checked })
                            }
                            className="w-4 h-4 rounded border-white/20 bg-slate-800 text-amber-500 focus:ring-amber-500"
                            disabled={loading}
                          />
                          <span className="text-sm text-slate-300">
                            Allow Commercial Use
                          </span>
                        </label>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                          Royalty Percentage: {formData.royalty_percentage}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          step="5"
                          value={formData.royalty_percentage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              royalty_percentage: parseInt(e.target.value),
                            })
                          }
                          className="w-full"
                          disabled={loading}
                        />
                        <p className="text-xs text-slate-500">
                          Percentage of revenue you'll earn from derivatives
                        </p>
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
                    className="px-6"
                    disabled={loading || success}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Minting...
                      </>
                    ) : success ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Success!
                      </>
                    ) : (
                      'Mint Now'
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
