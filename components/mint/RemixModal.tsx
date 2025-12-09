'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Upload,
  Check,
  AlertCircle,
  Loader2,
  Wand2,
  Image,
  FileVideo,
  ChevronRight,
  ChevronLeft,
  Shield,
  Coins,
  GitBranch,
  Ban,
  Zap,
  Eye,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useState, useRef, DragEvent, ChangeEvent, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { useAssets, useCreateDerivative, useCreateMultiParentDerivative } from '@/hooks/useAssets';
import { useGenerateTitle, useEnhanceDescription, useSuggestLicense } from '@/hooks/useAI';
import { useToast } from '@/components/ui/Toast';
import type { CreateDerivativeData, IPAssetListItem, IPAsset } from '@/types/api';

interface RemixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  parentAsset: IPAsset;
}

type Step = 'parent' | 'upload' | 'details' | 'license' | 'review';

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'parent', label: 'Parent', icon: GitBranch },
  { key: 'upload', label: 'Upload', icon: Upload },
  { key: 'details', label: 'Details', icon: Sparkles },
  { key: 'license', label: 'License', icon: Shield },
  { key: 'review', label: 'Review', icon: Eye },
];

const LICENSE_PRESETS = [
  {
    id: 'open',
    name: 'Open License',
    description: 'Maximum exposure - anyone can remix and use commercially',
    icon: GitBranch,
    color: 'green',
    allow_derivatives: true,
    commercial_rights: true,
    recommended_royalty: 10,
  },
  {
    id: 'creative',
    name: 'Creative Commons',
    description: 'Allow remixes for non-commercial purposes only',
    icon: Sparkles,
    color: 'blue',
    allow_derivatives: true,
    commercial_rights: false,
    recommended_royalty: 0,
  },
  {
    id: 'commercial',
    name: 'Commercial Only',
    description: 'Commercial use allowed, but no derivative works',
    icon: Coins,
    color: 'amber',
    allow_derivatives: false,
    commercial_rights: true,
    recommended_royalty: 15,
  },
  {
    id: 'restricted',
    name: 'All Rights Reserved',
    description: 'Full protection - no derivatives or commercial use',
    icon: Ban,
    color: 'red',
    allow_derivatives: false,
    commercial_rights: false,
    recommended_royalty: 0,
  },
];

export default function RemixModal({ isOpen, onClose, onSuccess, parentAsset }: RemixModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('parent');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    royalty_percentage: parentAsset.royalty_percentage || 10,
    allow_derivatives: true,
    commercial_rights: parentAsset.commercial_rights,
  });
  const [selectedLicensePreset, setSelectedLicensePreset] = useState<string>('open');
  const [useMultiParents, setUseMultiParents] = useState(false);
  const [parentSelections, setParentSelections] = useState<
    { parent_asset_id: string; attribution_percentage: number }[]
  >([{ parent_asset_id: parentAsset.id, attribution_percentage: 100 }]);
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createDerivative, loading, error, clearError } = useCreateDerivative();
  const { createMultiParentDerivative, loading: loadingMulti } = useCreateMultiParentDerivative();
  const { assets } = useAssets();
  const { showToast } = useToast();

  // AI hooks
  const generateTitle = useGenerateTitle();
  const enhanceDescription = useEnhanceDescription();
  const suggestLicense = useSuggestLicense();

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);
  const isLoading = loading || loadingMulti;

  const totalAttribution = useMemo(
    () => parentSelections.reduce((sum, p) => sum + (Number(p.attribution_percentage) || 0), 0),
    [parentSelections]
  );

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Handle AI Title Generation
  const handleGenerateTitle = async () => {
    if (!formData.description.trim()) {
      showToast('Please enter a description first', 'warning');
      return;
    }

    try {
      const result = await generateTitle.mutateAsync({
        description: formData.description,
        asset_type: 'digital_art',
      });
      setTitleSuggestions(result.titles);
      setShowTitleSuggestions(true);
      showToast('Title suggestions generated!', 'success');
    } catch (err) {
      console.error('Failed to generate titles:', err);
      showToast('Failed to generate title suggestions', 'error');
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
        asset_type: 'digital_art',
      });
      setFormData({ ...formData, description: result.enhanced_description });
      showToast('Description enhanced!', 'success');
    } catch (err) {
      console.error('Failed to enhance description:', err);
      showToast('Failed to enhance description', 'error');
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
        intended_use: formData.commercial_rights ? 'commercial' : 'non_commercial',
      });
      setFormData({
        ...formData,
        royalty_percentage: result.royalty_percentage,
        allow_derivatives: result.allow_derivatives,
        commercial_rights: result.commercial_rights && parentAsset.commercial_rights,
      });
      // Find matching preset
      const preset = LICENSE_PRESETS.find(
        (p) => p.allow_derivatives === result.allow_derivatives && p.commercial_rights === result.commercial_rights
      );
      if (preset) setSelectedLicensePreset(preset.id);
      showToast('License terms suggested!', 'success');
    } catch (err) {
      console.error('Failed to suggest license:', err);
      showToast('Failed to generate license suggestion', 'error');
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
    if (selectedFile.size > 50 * 1024 * 1024) {
      showToast('File size must be less than 50MB', 'error');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (!validTypes.includes(selectedFile.type)) {
      showToast('File must be JPG, PNG, GIF, or MP4', 'error');
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleLicensePresetSelect = (presetId: string) => {
    const preset = LICENSE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      // Check if preset is allowed based on parent's license
      if (preset.commercial_rights && !parentAsset.commercial_rights) {
        showToast('Commercial rights not allowed by parent license', 'warning');
        return;
      }
      setSelectedLicensePreset(presetId);
      setFormData({
        ...formData,
        allow_derivatives: preset.allow_derivatives,
        commercial_rights: preset.commercial_rights && parentAsset.commercial_rights,
        royalty_percentage: preset.recommended_royalty,
      });
    }
  };

  const handleSubmit = async () => {
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
        }, 2500);
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
      }, 2500);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl(null);
    setFormData({
      title: '',
      description: '',
      royalty_percentage: parentAsset.royalty_percentage || 10,
      allow_derivatives: true,
      commercial_rights: parentAsset.commercial_rights,
    });
    setCurrentStep('parent');
    setSelectedLicensePreset('open');
    setUseMultiParents(false);
    setParentSelections([{ parent_asset_id: parentAsset.id, attribution_percentage: 100 }]);
    setSuccess(false);
    setShowTitleSuggestions(false);
    setTitleSuggestions([]);
    clearError();
    onClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'parent':
        if (useMultiParents) {
          return parentSelections.length > 0 && Math.abs(totalAttribution - 100) <= 0.01;
        }
        return true;
      case 'upload':
        return true; // Media is optional
      case 'details':
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 'license':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const goToNextStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].key);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].key);
    }
  };

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? handleClose : undefined}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] overflow-hidden z-[70] p-4"
          >
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col max-h-[calc(90vh-2rem)]">
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Create Remix</h2>
                    <p className="text-xs text-slate-400">Build on existing IP with proper attribution</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="px-5 py-4 border-b border-slate-800/50 shrink-0">
                <div className="flex items-center justify-between">
                  {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.key === currentStep;
                    const isCompleted = index < currentStepIndex;

                    return (
                      <div key={step.key} className="flex items-center flex-1">
                        <button
                          onClick={() => index <= currentStepIndex && setCurrentStep(step.key)}
                          disabled={index > currentStepIndex}
                          className={`flex items-center gap-2 ${
                            index <= currentStepIndex ? 'cursor-pointer' : 'cursor-not-allowed'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              isActive
                                ? 'bg-purple-500 text-white'
                                : isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                          </div>
                          <span
                            className={`text-sm font-medium hidden sm:block ${
                              isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-slate-500'
                            }`}
                          >
                            {step.label}
                          </span>
                        </button>
                        {index < STEPS.length - 1 && (
                          <div
                            className={`flex-1 h-0.5 mx-3 rounded ${
                              isCompleted ? 'bg-green-500' : 'bg-slate-800'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {/* Success State */}
                  {success && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-8 flex flex-col items-center justify-center min-h-[400px]"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
                      >
                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                      </motion.div>
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-bold text-white mb-2"
                      >
                        Remix Created!
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-400 text-center max-w-md"
                      >
                        Your remix is being registered on the Story Protocol blockchain with proper attribution to the original creator.
                      </motion.p>
                    </motion.div>
                  )}

                  {/* Error Message */}
                  {error && !success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mx-5 mt-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-medium">Error</p>
                        <p className="text-red-300 text-sm mt-0.5">{error}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1: Parent Selection */}
                  {currentStep === 'parent' && !success && (
                    <motion.div
                      key="parent"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-5"
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white mb-1">Select Parent Asset</h3>
                        <p className="text-sm text-slate-400">Choose the IP asset(s) you want to remix</p>
                      </div>

                      <div className="space-y-4">
                        {/* Multi-parent toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                          <div className="flex items-center gap-3">
                            <Info className="w-5 h-5 text-purple-400" />
                            <div>
                              <p className="text-sm font-medium text-white">Multi-parent Remix</p>
                              <p className="text-xs text-slate-400">Combine multiple IP assets with attribution</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={useMultiParents}
                              onChange={(e) => setUseMultiParents(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                          </label>
                        </div>

                        {/* Single parent display */}
                        {!useMultiParents && (
                          <div className="p-4 bg-slate-800/50 rounded-xl border border-purple-500/50">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-slate-700 rounded-xl overflow-hidden flex-shrink-0">
                                {parentAsset.media_url && parentAsset.media_url !== 'https://placeholder.example.com/media' ? (
                                  <img
                                    src={parentAsset.media_url}
                                    alt={parentAsset.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-amber-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white mb-1 truncate">{parentAsset.title}</p>
                                <p className="text-sm text-slate-400">
                                  by {parentAsset.creator.display_name || formatAddress(parentAsset.creator.wallet_address)}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  {parentAsset.commercial_rights && (
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                                      Commercial
                                    </span>
                                  )}
                                  {parentAsset.allow_derivatives && (
                                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                      Remixable
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-purple-400">100%</p>
                                <p className="text-xs text-slate-400">Attribution</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Multi-parent selection */}
                        {useMultiParents && (
                          <div className="space-y-3">
                            {parentSelections.map((p, idx) => (
                              <div key={idx} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                  <select
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                                    value={p.parent_asset_id}
                                    onChange={(e) => {
                                      const next = [...parentSelections];
                                      next[idx].parent_asset_id = e.target.value;
                                      setParentSelections(next);
                                    }}
                                  >
                                    <option value="">Select parent asset...</option>
                                    {assets
                                      .filter((a) => !a.is_deleted && a.allow_derivatives)
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
                                      value={p.attribution_percentage}
                                      onChange={(e) => {
                                        const next = [...parentSelections];
                                        next[idx].attribution_percentage = Number(e.target.value);
                                        setParentSelections(next);
                                      }}
                                      className="w-20 px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-center focus:border-purple-500 focus:outline-none"
                                    />
                                    <span className="text-slate-400">%</span>
                                  </div>
                                  {parentSelections.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => setParentSelections(parentSelections.filter((_, i) => i !== idx))}
                                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                            <div className="flex items-center justify-between">
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
                                + Add Parent
                              </Button>
                              <div className={`text-sm font-medium ${Math.abs(totalAttribution - 100) <= 0.01 ? 'text-green-400' : 'text-amber-400'}`}>
                                Total: {totalAttribution.toFixed(0)}%
                                {Math.abs(totalAttribution - 100) > 0.01 && (
                                  <span className="text-xs ml-1">(must be 100%)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Parent license info */}
                        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                          <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-white">License Inheritance</p>
                              <p className="text-xs text-slate-400 mt-1">
                                Your remix will inherit licensing restrictions from the parent. {parentAsset.royalty_percentage}% royalty flows to the original creator.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Upload */}
                  {currentStep === 'upload' && !success && (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-5"
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white mb-1">Upload Your Remix</h3>
                        <p className="text-sm text-slate-400">Add media to showcase your derivative work</p>
                      </div>

                      <div
                        className={`relative border-2 border-dashed rounded-2xl transition-all overflow-hidden ${
                          dragActive
                            ? 'border-purple-500 bg-purple-500/10'
                            : previewUrl
                            ? 'border-green-500/50 bg-green-500/5'
                            : 'border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/png,image/gif,video/mp4"
                          onChange={handleFileInput}
                          disabled={isLoading}
                        />

                        {previewUrl ? (
                          <div className="p-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                              <div className="w-48 h-48 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                                {file?.type.startsWith('video/') ? (
                                  <video src={previewUrl} className="w-full h-full object-cover" controls />
                                ) : (
                                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="flex-1 text-center sm:text-left">
                                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                                  {file?.type.startsWith('video/') ? (
                                    <FileVideo className="w-5 h-5 text-purple-400" />
                                  ) : (
                                    <Image className="w-5 h-5 text-blue-400" />
                                  )}
                                  <span className="text-sm font-medium text-white truncate max-w-[200px]">
                                    {file?.name}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-400 mb-4">{file && formatFileSize(file.size)}</p>
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
                                >
                                  Change File
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full p-12 flex flex-col items-center justify-center cursor-pointer"
                          >
                            <div
                              className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                                dragActive ? 'bg-purple-500/20 scale-110' : 'bg-slate-800'
                              }`}
                            >
                              <Upload className={`w-10 h-10 ${dragActive ? 'text-purple-400' : 'text-slate-500'}`} />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {dragActive ? 'Drop your file here' : 'Upload your remix'}
                            </h3>
                            <p className="text-sm text-slate-400 mb-4">Drag and drop or click to browse</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Image className="w-4 h-4" /> JPG, PNG, GIF
                              </span>
                              <span className="flex items-center gap-1">
                                <FileVideo className="w-4 h-4" /> MP4
                              </span>
                              <span>Max 50MB</span>
                            </div>
                          </button>
                        )}
                      </div>

                      <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-slate-300 font-medium">Media is optional</p>
                            <p className="text-xs text-slate-400 mt-1">
                              You can create a remix without uploading new media if your derivative is conceptual or builds on the original in other ways.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Details */}
                  {currentStep === 'details' && !success && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-5 space-y-5"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Remix Details</h3>
                        <p className="text-sm text-slate-400">Describe how your work builds on the original</p>
                      </div>

                      {/* Title */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-300">Title *</label>
                          <button
                            type="button"
                            onClick={handleGenerateTitle}
                            disabled={isLoading || generateTitle.isPending || !formData.description}
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
                          placeholder="Enter a title for your remix"
                          className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                          disabled={isLoading}
                        />

                        {/* Title Suggestions */}
                        <AnimatePresence>
                          {showTitleSuggestions && titleSuggestions.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl"
                            >
                              <p className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                AI Suggestions
                              </p>
                              <div className="space-y-1">
                                {titleSuggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                      setFormData({ ...formData, title: suggestion });
                                      setShowTitleSuggestions(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-amber-500/10 rounded-lg transition-colors"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-300">Description *</label>
                          <button
                            type="button"
                            onClick={handleEnhanceDescription}
                            disabled={isLoading || enhanceDescription.isPending || !formData.description}
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
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe your remix - what you changed, added, or reimagined from the original..."
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                          disabled={isLoading}
                        />
                        <p className="text-xs text-slate-500">
                          Tip: Start with a brief description, then use AI Enhance to expand it professionally
                        </p>
                      </div>

                      {/* AI Feature Banner */}
                      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">AI-Powered Assistance</p>
                            <p className="text-xs text-slate-400">
                              Our AI can generate titles, enhance descriptions, and suggest optimal license terms
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: License */}
                  {currentStep === 'license' && !success && (
                    <motion.div
                      key="license"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-5 space-y-5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">License Terms</h3>
                          <p className="text-sm text-slate-400">Choose how others can use your remix</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleSuggestLicense}
                          disabled={isLoading || suggestLicense.isPending || !formData.description}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {suggestLicense.isPending ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-3 h-3" />
                              AI Suggest
                            </>
                          )}
                        </button>
                      </div>

                      {/* Parent license restriction notice */}
                      {!parentAsset.commercial_rights && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-amber-400" />
                            <p className="text-sm text-amber-300">
                              Commercial use is restricted by the parent license
                            </p>
                          </div>
                        </div>
                      )}

                      {/* License Presets */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {LICENSE_PRESETS.map((preset) => {
                          const Icon = preset.icon;
                          const isSelected = selectedLicensePreset === preset.id;
                          const isDisabled = preset.commercial_rights && !parentAsset.commercial_rights;
                          const colorClasses = {
                            green: {
                              bg: isSelected ? 'bg-green-500/20' : 'bg-slate-800/50',
                              border: isSelected ? 'border-green-500' : 'border-slate-700',
                              icon: 'text-green-400',
                            },
                            blue: {
                              bg: isSelected ? 'bg-blue-500/20' : 'bg-slate-800/50',
                              border: isSelected ? 'border-blue-500' : 'border-slate-700',
                              icon: 'text-blue-400',
                            },
                            amber: {
                              bg: isSelected ? 'bg-amber-500/20' : 'bg-slate-800/50',
                              border: isSelected ? 'border-amber-500' : 'border-slate-700',
                              icon: 'text-amber-400',
                            },
                            red: {
                              bg: isSelected ? 'bg-red-500/20' : 'bg-slate-800/50',
                              border: isSelected ? 'border-red-500' : 'border-slate-700',
                              icon: 'text-red-400',
                            },
                          };
                          const colors = colorClasses[preset.color as keyof typeof colorClasses];

                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleLicensePresetSelect(preset.id)}
                              disabled={isDisabled}
                              className={`p-4 rounded-xl border-2 text-left transition-all ${colors.bg} ${colors.border} ${
                                isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium text-white">{preset.name}</p>
                                    {isSelected && <Check className="w-4 h-4 text-green-400" />}
                                  </div>
                                  <p className="text-xs text-slate-400 mt-1">{preset.description}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Royalty Slider */}
                      {formData.commercial_rights && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-slate-300">Royalty Percentage</label>
                            <span className="text-lg font-bold text-purple-400">{formData.royalty_percentage}%</span>
                          </div>
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
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            disabled={isLoading}
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-2">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-3">
                            Earn {formData.royalty_percentage}% when others commercially use your remix
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 5: Review */}
                  {currentStep === 'review' && !success && (
                    <motion.div
                      key="review"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-5 space-y-5"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Review & Create</h3>
                        <p className="text-sm text-slate-400">Confirm your remix details before creating</p>
                      </div>

                      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                        {/* Preview Header */}
                        <div className="flex items-start gap-4 p-4 border-b border-slate-700/50">
                          {previewUrl ? (
                            <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-700 flex-shrink-0">
                              {file?.type.startsWith('video/') ? (
                                <video src={previewUrl} className="w-full h-full object-cover" />
                              ) : (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                              )}
                            </div>
                          ) : (
                            <div className="w-24 h-24 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
                              <GitBranch className="w-10 h-10 text-slate-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xl font-bold text-white truncate">{formData.title || 'Untitled'}</h4>
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                              {formData.description || 'No description'}
                            </p>
                          </div>
                        </div>

                        {/* Parent Info */}
                        <div className="p-4 border-b border-slate-700/50 bg-purple-500/5">
                          <p className="text-xs font-medium text-purple-400 mb-2">REMIXING</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-700 overflow-hidden">
                              {parentAsset.media_url && parentAsset.media_url !== 'https://placeholder.example.com/media' ? (
                                <img src={parentAsset.media_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Sparkles className="w-5 h-5 text-amber-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{parentAsset.title}</p>
                              <p className="text-xs text-slate-400">
                                {parentAsset.royalty_percentage}% royalty to original creator
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                            <span className="text-sm text-slate-400">License Type</span>
                            <span className="text-sm font-medium text-white">
                              {LICENSE_PRESETS.find((p) => p.id === selectedLicensePreset)?.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                            <span className="text-sm text-slate-400">Allow Derivatives</span>
                            <span
                              className={`text-sm font-medium ${formData.allow_derivatives ? 'text-green-400' : 'text-red-400'}`}
                            >
                              {formData.allow_derivatives ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                            <span className="text-sm text-slate-400">Commercial Use</span>
                            <span
                              className={`text-sm font-medium ${formData.commercial_rights ? 'text-green-400' : 'text-red-400'}`}
                            >
                              {formData.commercial_rights ? 'Yes' : 'No'}
                            </span>
                          </div>
                          {formData.commercial_rights && (
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm text-slate-400">Your Royalty Rate</span>
                              <span className="text-sm font-medium text-purple-400">{formData.royalty_percentage}%</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Blockchain Info */}
                      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white">Blockchain Registration</p>
                            <p className="text-xs text-slate-400 mt-1">
                              Your remix will be registered on Story Protocol with automatic royalty distribution to the original creator.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              {!success && (
                <div className="p-5 border-t border-slate-800 flex items-center justify-between shrink-0">
                  <div>
                    {currentStepIndex > 0 && (
                      <Button type="button" variant="outline" onClick={goToPreviousStep} disabled={isLoading}>
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                      Cancel
                    </Button>
                    {currentStep === 'review' ? (
                      <Button variant="primary" onClick={handleSubmit} disabled={isLoading || !canProceed()}>
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <GitBranch className="w-4 h-4 mr-2" />
                            Create Remix
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button variant="primary" onClick={goToNextStep} disabled={!canProceed()}>
                        Continue
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
