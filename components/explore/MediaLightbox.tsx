'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';
import Link from 'next/link';
import type { IPAssetListItem } from '@/types/api';

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  asset: IPAssetListItem | null;
  assets?: IPAssetListItem[];
  onNavigate?: (asset: IPAssetListItem) => void;
}

export default function MediaLightbox({
  isOpen,
  onClose,
  asset,
  assets = [],
  onNavigate,
}: MediaLightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Reset zoom when asset changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [asset?.id]);

  // Current index in assets array
  const currentIndex = asset ? assets.findIndex(a => a.id === asset.id) : -1;
  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext = currentIndex < assets.length - 1 && currentIndex !== -1;

  // Navigation handlers
  const navigatePrev = useCallback(() => {
    if (canNavigatePrev && onNavigate) {
      onNavigate(assets[currentIndex - 1]);
    }
  }, [canNavigatePrev, onNavigate, assets, currentIndex]);

  const navigateNext = useCallback(() => {
    if (canNavigateNext && onNavigate) {
      onNavigate(assets[currentIndex + 1]);
    }
  }, [canNavigateNext, onNavigate, assets, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          navigatePrev();
          break;
        case 'ArrowRight':
          navigateNext();
          break;
        case '+':
        case '=':
          setScale(s => Math.min(s + 0.25, 3));
          break;
        case '-':
          setScale(s => Math.max(s - 0.25, 0.5));
          break;
        case '0':
          setScale(1);
          setPosition({ x: 0, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, navigatePrev, navigateNext]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Touch/mouse drag handlers for panning when zoomed
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      });
    }
  }, [isDragging, scale, startPos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom handlers
  const zoomIn = () => setScale(s => Math.min(s + 0.5, 3));
  const zoomOut = () => setScale(s => Math.max(s - 0.5, 0.5));
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  if (!asset) return null;

  const hasValidMedia = asset.media_url && asset.media_url !== 'https://placeholder.example.com/media';
  const isVideo = asset.media_url?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-3 bg-slate-800/80 hover:bg-slate-700 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Zoom controls */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); zoomOut(); }}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-white transition-colors"
              title="Zoom out (-)"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); resetZoom(); }}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-white text-sm font-medium transition-colors"
              title="Reset zoom (0)"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); zoomIn(); }}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-white transition-colors"
              title="Zoom in (+)"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation arrows */}
          {canNavigatePrev && (
            <button
              onClick={(e) => { e.stopPropagation(); navigatePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-slate-800/80 hover:bg-slate-700 rounded-full text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {canNavigateNext && (
            <button
              onClick={(e) => { e.stopPropagation(); navigateNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-slate-800/80 hover:bg-slate-700 rounded-full text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Media content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-[90vw] max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            {hasValidMedia ? (
              isVideo ? (
                <video
                  src={asset.media_url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] rounded-lg"
                  style={{
                    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                  }}
                />
              ) : (
                <img
                  src={asset.media_url}
                  alt={asset.title}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg"
                  style={{
                    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                  }}
                  draggable={false}
                />
              )
            ) : (
              <div className="w-96 h-64 bg-slate-800 rounded-lg flex items-center justify-center">
                <p className="text-slate-400">No media available</p>
              </div>
            )}
          </motion.div>

          {/* Asset info bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">{asset.title}</h3>
                <p className="text-slate-400 text-sm">
                  by {asset.creator?.display_name || 'Unknown creator'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {hasValidMedia && (
                  <a
                    href={asset.media_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-white transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                )}
                <Link
                  href={`/explore/${asset.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-white font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Details
                </Link>
              </div>
            </div>
          </div>

          {/* Counter */}
          {assets.length > 1 && currentIndex !== -1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-800/80 rounded-full text-white text-sm">
              {currentIndex + 1} / {assets.length}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
