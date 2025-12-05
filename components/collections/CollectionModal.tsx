'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Plus, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useCreateCollection, useUpdateCollection } from '@/hooks/useCollections';
import { useToast } from '@/components/ui/Toast';
import ImageCropModal from '@/components/profile/ImageCropModal';
import type { Collection } from '@/hooks/useCollections';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  collection?: Collection; // If provided, edit mode
  preselectedAssetIds?: string[]; // Asset UUIDs to pre-select
}

export default function CollectionModal({
  isOpen,
  onClose,
  onSuccess,
  collection,
  preselectedAssetIds = [],
}: CollectionModalProps) {
  const isEditMode = !!collection;
  const [formData, setFormData] = useState({
    title: collection?.title || '',
    description: collection?.description || '',
    cover_image_url: collection?.cover_image_url || '',
    is_public: collection?.is_public ?? true,
    asset_ids: preselectedAssetIds,
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const { showToast } = useToast();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image must be less than 10MB', 'error');
      return;
    }

    // Read file and show cropper
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageToCrop(result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [showToast]);

  const handleCropComplete = useCallback(async (croppedBlob: Blob): Promise<void> => {
    // Create file from blob
    const file = new File([croppedBlob], 'cover-image.jpg', { type: 'image/jpeg' });
    setCoverImageFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(croppedBlob);
    setCoverImagePreview(previewUrl);
    
    // Clear URL input since we're using file upload
    setFormData(prev => ({ ...prev, cover_image_url: '' }));
    
    setShowCropper(false);
    setImageToCrop(null);
  }, []);

  const handleRemoveCoverImage = useCallback(() => {
    setCoverImageFile(null);
    if (coverImagePreview) {
      URL.revokeObjectURL(coverImagePreview);
    }
    setCoverImagePreview(null);
  }, [coverImagePreview]);

  // Track previous isOpen to detect when modal opens
  const prevIsOpenRef = useRef(false);
  
  // Reset form only when modal transitions from closed to open
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;
    
    // Only reset when transitioning from closed to open
    if (isOpen && !wasOpen) {
      setFormData({
        title: collection?.title || '',
        description: collection?.description || '',
        cover_image_url: collection?.cover_image_url || '',
        is_public: collection?.is_public ?? true,
        asset_ids: preselectedAssetIds,
      });
      setCoverImageFile(null);
      setCoverImagePreview(null);
      setShowCropper(false);
      setImageToCrop(null);
    }
  }, [isOpen, collection?.id]); // Only depend on collection.id, not the whole object

  const loading = createCollection.isPending || updateCollection.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('Please enter a collection title', 'warning');
      return;
    }

    try {
      const submitData = {
        ...formData,
        ...(coverImageFile && { cover_image: coverImageFile }),
      };

      if (isEditMode && collection) {
        await updateCollection.mutateAsync({
          id: collection.id,
          data: submitData,
        });
      } else {
        await createCollection.mutateAsync(submitData);
      }
      
      // Cleanup preview URL
      if (coverImagePreview) {
        URL.revokeObjectURL(coverImagePreview);
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error handling is done in the hook
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
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {isEditMode ? 'Edit Collection' : 'Create Collection'}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {isEditMode
                      ? 'Update your collection details'
                      : 'Organize your favorite assets into collections'}
                  </p>
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
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="My Awesome Collection"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe your collection..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Cover Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cover Image
                  </label>
                  
                  {/* Upload button and preview */}
                  <div className="flex items-start gap-4">
                    {/* Preview or Upload Zone */}
                    <div className="relative">
                      {coverImagePreview || formData.cover_image_url ? (
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-slate-700 group">
                          <img
                            src={coverImagePreview || formData.cover_image_url}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay with actions */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                              title="Change image"
                            >
                              <Upload className="w-4 h-4 text-white" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleRemoveCoverImage();
                                setFormData({ ...formData, cover_image_url: '' });
                              }}
                              className="p-2 bg-red-600 rounded-lg hover:bg-red-500 transition-colors"
                              title="Remove image"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500 transition-colors flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-amber-400"
                        >
                          <ImageIcon className="w-8 h-8" />
                          <span className="text-xs">Upload Image</span>
                        </button>
                      )}
                    </div>
                    
                    {/* Alternative: URL input */}
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-2">
                        Or enter an image URL:
                      </p>
                      <input
                        type="url"
                        value={formData.cover_image_url}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            cover_image_url: e.target.value,
                          });
                          // Clear file upload if URL is entered
                          if (e.target.value) {
                            handleRemoveCoverImage();
                          }
                        }}
                        placeholder="https://example.com/image.jpg"
                        disabled={!!coverImageFile}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Leave empty to use first asset's image as cover
                      </p>
                    </div>
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Privacy */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) =>
                      setFormData({ ...formData, is_public: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-2 focus:ring-amber-500"
                  />
                  <label htmlFor="is_public" className="text-sm text-slate-300">
                    Make collection public
                  </label>
                </div>

                {/* Selected Assets Count */}
                {formData.asset_ids && formData.asset_ids.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <p className="text-sm text-amber-400">
                      <Plus className="w-4 h-4 inline mr-2" />
                      {formData.asset_ids.length} asset
                      {formData.asset_ids.length !== 1 ? 's' : ''} will be added to this
                      collection
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {isEditMode ? 'Update Collection' : 'Create Collection'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}

      {/* Image Cropper Modal */}
      {imageToCrop && (
        <ImageCropModal
          isOpen={showCropper}
          imageSrc={imageToCrop}
          onSave={handleCropComplete}
          onClose={() => {
            setShowCropper(false);
            setImageToCrop(null);
          }}
          aspect={16 / 9}
          cropShape="rect"
          title="Crop Cover Image"
        />
      )}
    </AnimatePresence>
  );
}

