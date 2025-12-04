'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Check, ZoomIn, ZoomOut, Move } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (croppedImageBlob: Blob) => Promise<void>;
  imageSrc: string;
  aspect?: number;
  cropShape?: 'rect' | 'round';
  title?: string;
}

export default function ImageCropModal({
  isOpen,
  onClose,
  onSave,
  imageSrc,
  aspect = 1,
  cropShape = 'rect',
  title = 'Crop Image',
}: ImageCropModalProps) {
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [cropSize, setCropSize] = useState({ width: 200, height: 200 });

  // Load image when modal opens
  useEffect(() => {
    if (isOpen && imageSrc) {
      setImageLoaded(false);
      setPosition({ x: 0, y: 0 });
      setZoom(1);
      
      const img = new Image();
      img.onload = () => {
        setImageElement(img);
        setImageLoaded(true);
        
        // Calculate initial crop size based on container and aspect ratio
        if (containerRef.current) {
          const containerWidth = containerRef.current.clientWidth - 40;
          const containerHeight = containerRef.current.clientHeight - 40;
          
          let cropWidth, cropHeight;
          if (aspect >= 1) {
            cropWidth = Math.min(containerWidth, containerHeight * aspect);
            cropHeight = cropWidth / aspect;
          } else {
            cropHeight = Math.min(containerHeight, containerWidth / aspect);
            cropWidth = cropHeight * aspect;
          }
          
          // Ensure crop size doesn't exceed container
          cropWidth = Math.min(cropWidth, containerWidth);
          cropHeight = Math.min(cropHeight, containerHeight);
          
          setCropSize({ width: cropWidth, height: cropHeight });
        }
      };
      img.onerror = () => {
        showToast('Failed to load image', 'error');
      };
      img.src = imageSrc;
    }
    
    return () => {
      setImageElement(null);
      setImageLoaded(false);
    };
  }, [isOpen, imageSrc, aspect, showToast]);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle zoom change
  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(0.5, Math.min(3, newZoom)));
  };

  // Create cropped image
  const createCroppedImage = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!imageElement || !containerRef.current) {
        reject(new Error('Image not loaded'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Get container dimensions
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerCenterX = containerRect.width / 2;
      const containerCenterY = containerRect.height / 2;

      // Calculate the crop area in image coordinates
      const scaledWidth = imageElement.naturalWidth * zoom;
      const scaledHeight = imageElement.naturalHeight * zoom;
      
      const imageX = containerCenterX - scaledWidth / 2 + position.x;
      const imageY = containerCenterY - scaledHeight / 2 + position.y;
      
      // Crop area center (center of container)
      const cropCenterX = containerCenterX;
      const cropCenterY = containerCenterY;
      
      // Crop area bounds
      const cropLeft = cropCenterX - cropSize.width / 2;
      const cropTop = cropCenterY - cropSize.height / 2;
      
      // Calculate source coordinates in the original image
      const sourceX = (cropLeft - imageX) / zoom;
      const sourceY = (cropTop - imageY) / zoom;
      const sourceWidth = cropSize.width / zoom;
      const sourceHeight = cropSize.height / zoom;

      // Set canvas size to crop dimensions
      canvas.width = cropSize.width;
      canvas.height = cropSize.height;

      // Draw the cropped portion
      ctx.drawImage(
        imageElement,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        cropSize.width,
        cropSize.height
      );

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create image blob'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleSave = async () => {
    if (!imageLoaded || !imageElement) {
      showToast('Please wait for the image to load', 'warning');
      return;
    }

    setUploading(true);
    try {
      const croppedBlob = await createCroppedImage();
      await onSave(croppedBlob);
      handleClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to crop image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setPosition({ x: 0, y: 0 });
      setZoom(1);
      setImageLoaded(false);
      setImageElement(null);
      onClose();
    }
  };

  if (!isOpen) return null;

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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h2 className="text-2xl font-bold text-slate-50">{title}</h2>
                <button
                  onClick={handleClose}
                  disabled={uploading}
                  className="p-2 text-slate-400 hover:text-slate-50 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cropper Container */}
              <div 
                ref={containerRef}
                className="flex-1 relative bg-slate-950 overflow-hidden cursor-move select-none"
                style={{ 
                  minHeight: '400px',
                  height: '500px',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Loading state */}
                {!imageLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className="text-slate-400">Loading image...</p>
                  </div>
                )}

                {/* Image display */}
                {imageLoaded && imageElement && (
                  <>
                    {/* The image */}
                    <div
                      className="absolute"
                      style={{
                        width: imageElement.naturalWidth * zoom,
                        height: imageElement.naturalHeight * zoom,
                        left: '50%',
                        top: '50%',
                        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageSrc}
                        alt="Crop preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          userSelect: 'none',
                          pointerEvents: 'none',
                        }}
                        draggable={false}
                      />
                    </div>

                    {/* Crop overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Dark overlay with hole for crop area */}
                      <svg className="w-full h-full">
                        <defs>
                          <mask id="cropMask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            {cropShape === 'round' ? (
                              <ellipse
                                cx="50%"
                                cy="50%"
                                rx={cropSize.width / 2}
                                ry={cropSize.height / 2}
                                fill="black"
                              />
                            ) : (
                              <rect
                                x={`calc(50% - ${cropSize.width / 2}px)`}
                                y={`calc(50% - ${cropSize.height / 2}px)`}
                                width={cropSize.width}
                                height={cropSize.height}
                                fill="black"
                              />
                            )}
                          </mask>
                        </defs>
                        <rect
                          x="0"
                          y="0"
                          width="100%"
                          height="100%"
                          fill="rgba(0, 0, 0, 0.6)"
                          mask="url(#cropMask)"
                        />
                      </svg>

                      {/* Crop border */}
                      <div
                        className="absolute border-2 border-amber-500"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: cropSize.width,
                          height: cropSize.height,
                          borderRadius: cropShape === 'round' ? '50%' : '4px',
                        }}
                      />
                    </div>

                    {/* Drag hint */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/80 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm text-slate-300 pointer-events-none">
                      <Move className="w-4 h-4" />
                      Drag to reposition
                    </div>
                  </>
                )}
              </div>

              {/* Controls */}
              <div className="p-6 border-t border-slate-800 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">
                      Zoom: {zoom.toFixed(1)}x
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleZoomChange(zoom - 0.1)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        disabled={zoom <= 0.5}
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleZoomChange(zoom + 0.1)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        disabled={zoom >= 3}
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => handleZoomChange(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={uploading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSave}
                    disabled={uploading || !imageLoaded}
                    className="flex-1"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Save & Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
